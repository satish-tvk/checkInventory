import { Mistral } from "@mistralai/mistralai";
import { searchSupplierInfo, searchVendorReviews } from "./tavilySearch";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const MAX_TURNS = 10;

export interface VendorReviewInput {
  name: string;
  country?: string;
  category?: string;
  location?: string;
}

export interface VendorReviewScore {
  name: string;
  review_validation_score: number;
  review_validation_reason: string;
}

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_vendor_reviews",
      description:
        "Search external sources (Google, Trustpilot, Yelp, G2, news) to validate review quality and sentiment.",
      parameters: {
        type: "object" as const,
        properties: {
          vendor_name: { type: "string" },
          location: { type: "string" },
          category: { type: "string" },
        },
        required: ["vendor_name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_supplier_info",
      description:
        "Search broader supplier/company signals for cross-validation of public reputation.",
      parameters: {
        type: "object" as const,
        properties: {
          supplier_name: { type: "string" },
          country: { type: "string" },
        },
        required: ["supplier_name", "country"],
      },
    },
  },
];

async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  if (name === "search_vendor_reviews") {
    const content = await searchVendorReviews(args.vendor_name, args.location, args.category);
    return JSON.stringify({ evidence: content });
  }
  if (name === "search_supplier_info") {
    const content = await searchSupplierInfo(args.supplier_name, args.country);
    return JSON.stringify({ evidence: content });
  }
  throw new Error(`Unknown tool: ${name}`);
}

export async function runVendorReviewAgent(vendors: VendorReviewInput[]): Promise<VendorReviewScore[]> {
  if (vendors.length === 0) return [];

  const systemPrompt = `You are a vendor review validation analyst.

Goal:
- Validate review quality for each vendor using external sources.
- Cross-check whether review signals look authentic, consistent, and trustworthy.

Instructions:
1) For EACH vendor, call search_vendor_reviews at least once.
2) If review evidence is sparse/conflicting, call search_supplier_info to cross-check reputation.
3) Return ONLY JSON in this exact shape:
{
  "reviews": [
    {
      "name": "<vendor name exactly as provided>",
      "review_validation_score": <integer 0-100>,
      "review_validation_reason": "<1-2 sentences, mention source consistency/volume/sentiment anomalies>"
    }
  ]
}

Scoring:
- 80-100: strong, consistent, high-volume, low anomaly signals
- 50-79: mixed sentiment or limited source consistency
- 0-49: sparse, conflicting, suspicious, or poor review signals`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Validate review trust signals for these vendors:\n${JSON.stringify(vendors, null, 2)}`,
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
    if (!choice) throw new Error("No response from Mistral review agent.");

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
      if (!match) throw new Error("No JSON found in review-agent response.");

      const parsed = JSON.parse(match[0]) as { reviews?: VendorReviewScore[] };
      const mapped = (parsed.reviews ?? []).map((r) => ({
        name: r.name,
        review_validation_score: Math.max(0, Math.min(100, Number(r.review_validation_score ?? 0))),
        review_validation_reason: r.review_validation_reason ?? "No review signal found.",
      }));

      return vendors.map((v) => {
        const found = mapped.find((m) => m.name === v.name);
        return found ?? {
          name: v.name,
          review_validation_score: 0,
          review_validation_reason: "No validated review evidence found.",
        };
      });
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

  throw new Error("Vendor review agent exceeded maximum turns.");
}
