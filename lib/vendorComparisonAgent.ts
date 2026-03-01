import Anthropic from "@anthropic-ai/sdk";
import { searchSupplierInfo } from "./tavilySearch";
import type { DiscoveredVendor } from "./mistralVendorAgent";
import type { VendorComparisonReport, VendorScorecard } from "./types";
import { runVendorReviewAgent } from "./vendorReviewAgent";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a supply chain intelligence analyst. Your task is to research and score a set of vendor companies across six standardised metrics.

Use the search_supplier_info tool to research EACH vendor before scoring. Always research all vendors before producing your final output.

After all research is complete, respond ONLY with a valid JSON object in this exact shape (no text before or after):
{
  "overall_score": <integer 0–100, higher = safer overall portfolio>,
  "scorecards": [
    {
      "name": "<vendor name exactly as given>",
      "risk_score": <integer 0–100, higher = riskier>,
      "reliability": <integer 0–100, percentage — higher is better>,
      "financial_stability": <integer 0–100, percentage — higher is better>,
      "years_in_business": <integer, estimate from web; use 3 for very new, 10 for established SMEs, 30+ for large corporates>,
      "legal_disputes": <integer 0–5, count of known disputes/lawsuits/sanctions>,
      "compliance": ["<cert or standard name>"],
      "color": "<RED | YELLOW | GREEN>",
      "reason": "<1–2 sentences citing your research findings>",
      "backups": ["<alternative vendor 1>", "<alternative vendor 2>"]
    }
  ]
}

Metric scoring guidelines:
- risk_score   : 0–25 = low risk (established, stable, positive news); 26–60 = medium; 61–100 = high risk (financial trouble, disputes, unknown)
- reliability  : 80–100 = proven delivery track record; 50–79 = reasonable; <50 = limited info or reported issues
- financial_stability: base on company size, age, any financial news; 75+ = solid; 40–74 = moderate; <40 = concerns found
- years_in_business: search for founding year; calculate from current year (2025); estimate if not found
- legal_disputes: count clearly reported lawsuits, sanctions, regulatory actions (cap at 5)
- compliance   : list any certifications found (ISO 9001, ISO 14001, SOC 2, GDPR, PCI-DSS, industry-specific, etc.); use [] if none

Color thresholds:
- GREEN : risk_score ≤ 30 — stable, established, low risk
- YELLOW: risk_score 31–65 — some concerns or limited information
- RED   : risk_score ≥ 66 — significant risk factors identified

For RED vendors include exactly 2 backup alternatives in "backups". For YELLOW and GREEN "backups" must be [].`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_supplier_info",
    description:
      "Search the web for news, founding year, financial health, legal issues, and certifications for a vendor company.",
    input_schema: {
      type: "object",
      properties: {
        supplier_name: { type: "string", description: "The vendor company name" },
        country:       { type: "string", description: "The country where the vendor operates" },
      },
      required: ["supplier_name", "country"],
    },
  },
];

const MAX_TURNS = 16;

function extractCountry(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  return parts[parts.length - 1] || "Unknown";
}

export async function runVendorComparisonAgent(
  vendors: DiscoveredVendor[],
  requestId: string,
): Promise<VendorComparisonReport> {
  const vendorList = vendors.map((v) => ({
    name: v.name,
    category: v.category,
    country: extractCountry(v.address),
    address: v.address,
    rating: v.rating,
    total_ratings: v.total_ratings,
    business_status: v.business_status,
  }));

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Research and score these ${vendors.length} vendor(s). Use the search tool on each one, then output your JSON scorecard.\n\n${JSON.stringify(vendorList, null, 2)}`,
    },
  ];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude.");

      const match = textBlock.text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in Claude response.");

      const parsed = JSON.parse(match[0]) as { overall_score: number; scorecards: VendorScorecard[] };
      const reviewScores = await runVendorReviewAgent(
        vendors.map((v) => ({
          name: v.name,
          category: v.category,
          country: extractCountry(v.address),
          location: v.address,
        })),
      );
      const reviewByName = new Map(reviewScores.map((r) => [r.name, r]));
      const scorecards = (parsed.scorecards ?? []).map((card) => {
        const review = reviewByName.get(card.name);
        return {
          ...card,
          review_validation_score: review?.review_validation_score ?? 0,
          review_validation_reason: review?.review_validation_reason ?? "No validated review evidence found.",
        };
      });
      return {
        overall_score: parsed.overall_score,
        scorecards,
        generated_at: new Date().toISOString(),
        request_id: requestId,
      };
    }

    if (response.stop_reason === "tool_use") {
      const toolBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );
      const toolResults = await Promise.all(
        toolBlocks.map(async (tc) => {
          const { supplier_name, country } = tc.input as { supplier_name: string; country: string };
          const content = await searchSupplierInfo(supplier_name, country);
          return { type: "tool_result" as const, tool_use_id: tc.id, content };
        }),
      );
      messages.push({ role: "user", content: toolResults });
    }
  }

  throw new Error("Vendor comparison agent exceeded maximum turns.");
}
