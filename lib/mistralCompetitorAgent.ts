import { Mistral } from "@mistralai/mistralai";
import { getCompanyProfile, searchCompetitors } from "./tavilySearch";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const MAX_TURNS = 10;

export interface CompetitorEntry {
  name: string;
  location: string;
  website: string | null;
  why_competitor: string;
  differentiator: string;
  confidence: number;
}

export interface CompetitorAnalysisResult {
  business_name: string;
  industry: string;
  location: string;
  market_summary: string;
  threats: string[];
  opportunities: string[];
  competitors: CompetitorEntry[];
  generated_at: string;
}

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_competitors",
      description:
        "Search for competitor companies in a business category and location. Use this first.",
      parameters: {
        type: "object" as const,
        properties: {
          business_name: { type: "string", description: "Business being analyzed" },
          industry: { type: "string", description: "Industry/category to search for competitors" },
          location: { type: "string", description: "City/state/country to focus on local competitors" },
        },
        required: ["business_name", "industry", "location"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_company_profile",
      description:
        "Fetch profile details for a specific competitor company after discovery.",
      parameters: {
        type: "object" as const,
        properties: {
          company_name: { type: "string", description: "Competitor company name" },
        },
        required: ["company_name"],
      },
    },
  },
];

async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  if (name === "search_competitors") {
    const text = await searchCompetitors(args.business_name, args.industry, args.location);
    return JSON.stringify({ result: text });
  }
  if (name === "get_company_profile") {
    const text = await getCompanyProfile(args.company_name);
    return JSON.stringify({ result: text });
  }
  throw new Error(`Unknown tool: ${name}`);
}

export async function runCompetitorAnalysisAgent(
  businessName: string,
  industry: string,
  location: string,
): Promise<CompetitorAnalysisResult> {
  const systemPrompt = `You are a competitive intelligence analyst for local businesses.

Goal:
- Find direct competitors for the target business in the same area.
- Prioritize local competitors that customers in the area can realistically choose instead.
- Use tools for evidence before final output.

Workflow:
1) Call search_competitors once with the provided business_name, industry, and location.
2) Select the most relevant 4-6 competitor companies from that result.
3) Call get_company_profile for each selected company.
4) Return ONLY a valid JSON object with this exact shape:
{
  "market_summary": "<2-3 sentence local market summary>",
  "threats": ["<threat 1>", "<threat 2>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>"],
  "competitors": [
    {
      "name": "<company name>",
      "location": "<city/area or 'Unknown'>",
      "website": "<url or null>",
      "why_competitor": "<why this company competes directly in this location>",
      "differentiator": "<what makes them different>",
      "confidence": <integer 0-100>
    }
  ]
}

Rules:
- Include 4-6 competitors when possible.
- Keep fields factual and concise.
- Set confidence lower if evidence is weak.
- Do not add any text before/after JSON.`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Analyze local competitors for:
Business: ${businessName}
Industry: ${industry}
Location: ${location}`,
    },
  ];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.chat.complete as any)({
      model: "mistral-large-latest",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
    });

    const choice = response.choices?.[0];
    if (!choice) throw new Error("No response from Mistral.");

    const assistantMsg = choice.message;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawToolCalls: any[] = assistantMsg.toolCalls ?? assistantMsg.tool_calls ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assistantTurn: any = { role: "assistant", content: assistantMsg.content ?? null };
    if (rawToolCalls.length > 0) {
      assistantTurn.toolCalls = rawToolCalls.map((tc: any) => ({
        id: tc.id && tc.id !== "null" ? tc.id : `call_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: tc.type ?? "function",
        function: {
          name: tc.function.name,
          arguments:
            typeof tc.function.arguments === "string"
              ? tc.function.arguments
              : JSON.stringify(tc.function.arguments),
        },
      }));
    }
    messages.push(assistantTurn);

    const finishReason = choice.finish_reason ?? choice.finishReason;
    if (finishReason === "stop") {
      const raw =
        typeof assistantMsg.content === "string"
          ? assistantMsg.content
          : JSON.stringify(assistantMsg.content);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in Mistral response.");

      const parsed = JSON.parse(match[0]) as Omit<
        CompetitorAnalysisResult,
        "business_name" | "industry" | "location" | "generated_at"
      >;

      const competitors = Array.isArray(parsed.competitors)
        ? parsed.competitors.slice(0, 6).map((c) => ({
            ...c,
            confidence: Math.max(0, Math.min(100, Number(c.confidence ?? 0))),
            website: c.website ?? null,
            location: c.location || "Unknown",
          }))
        : [];

      return {
        business_name: businessName,
        industry,
        location,
        market_summary: parsed.market_summary ?? "",
        threats: Array.isArray(parsed.threats) ? parsed.threats : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        competitors,
        generated_at: new Date().toISOString(),
      };
    }

    if (assistantTurn.toolCalls?.length > 0) {
      for (const tc of assistantTurn.toolCalls) {
        const fnArgs =
          typeof tc.function.arguments === "string"
            ? (JSON.parse(tc.function.arguments) as Record<string, string>)
            : (tc.function.arguments as Record<string, string>);

        let content: string;
        try {
          content = await executeTool(tc.function.name, fnArgs);
        } catch (err) {
          content = JSON.stringify({ error: String(err) });
        }

        messages.push({
          role: "tool",
          toolCallId: tc.id,
          name: tc.function.name,
          content,
        });
      }
    }
  }

  throw new Error("Competitor analysis agent exceeded maximum turns.");
}
