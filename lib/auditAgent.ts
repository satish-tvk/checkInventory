import Anthropic from "@anthropic-ai/sdk";
import { searchSupplierInfo } from "./tavilySearch";
import type { SupplierInput, AuditReport } from "./types";
import { runVendorReviewAgent } from "./vendorReviewAgent";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a supply chain risk analyst. Your job is to audit a list of suppliers and assess their risk level.

Use the search_supplier_info tool to research each supplier before making your assessment.

After all research is complete, respond ONLY with a valid JSON object in this exact shape:
{
  "overall_score": <integer 0–100, higher = safer supply chain>,
  "ratings": [
    {
      "name": "<supplier name exactly as given>",
      "color": "<RED | YELLOW | GREEN>",
      "reason": "<1–2 sentence explanation citing what you found>",
      "backups": ["<alternative supplier 1>", "<alternative supplier 2>"]
    }
  ]
}

Risk thresholds:
- RED: spend_pct > 40%, or geopolitical instability, financial trouble, single-source risk
- YELLOW: spend_pct 20–40%, or emerging market concerns, limited alternatives
- GREEN: spend_pct < 20%, stable region, established supplier, diversified options

For RED-rated suppliers include 2 backup alternatives in "backups". For YELLOW and GREEN, "backups" must be [].`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_supplier_info",
    description:
      "Search the web for recent news, financial stability, and risk factors for a supplier.",
    input_schema: {
      type: "object",
      properties: {
        supplier_name: {
          type: "string",
          description: "The supplier company name",
        },
        country: {
          type: "string",
          description: "The country where the supplier operates",
        },
      },
      required: ["supplier_name", "country"],
    },
  },
];

const MAX_TURNS = 12;

export async function runAuditAgent(
  suppliers: SupplierInput[],
  requestId: string
): Promise<AuditReport> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Audit these ${suppliers.length} supplier(s). Research each one with the search tool, then respond with your JSON assessment.\n\n${JSON.stringify(suppliers, null, 2)}`,
    },
  ];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    // Append assistant message
    messages.push({ role: "assistant", content: response.content });

    // No tool calls → final JSON answer
    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude.");
      }
      const raw = textBlock.text;
      // Extract the JSON object even if Claude adds preamble text
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in Claude response.");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      const reviewScores = await runVendorReviewAgent(
        suppliers.map((s) => ({
          name: s.name,
          country: s.country,
          category: s.category,
          location: s.country,
        })),
      );

      const reviewByName = new Map(
        reviewScores.map((r) => [r.name, r]),
      );

      const ratings = (parsed.ratings ?? []).map((r: { name: string; color: string; reason: string; backups: string[] }) => {
        const review = reviewByName.get(r.name);
        return {
          ...r,
          review_validation_score: review?.review_validation_score ?? 0,
          review_validation_reason: review?.review_validation_reason ?? "No validated review evidence found.",
        };
      });

      return {
        overall_score: parsed.overall_score,
        ratings,
        request_id: requestId,
        generated_at: new Date().toISOString(),
      } as AuditReport;
    }

    // Execute tool calls
    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (tc) => {
          const { supplier_name, country } = tc.input as {
            supplier_name: string;
            country: string;
          };
          const content = await searchSupplierInfo(supplier_name, country);
          return {
            type: "tool_result" as const,
            tool_use_id: tc.id,
            content,
          };
        })
      );

      messages.push({ role: "user", content: toolResults });
    }
  }

  throw new Error(
    "Audit agent exceeded maximum turns without producing a result."
  );
}
