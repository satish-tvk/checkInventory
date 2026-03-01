import { Mistral } from "@mistralai/mistralai";
import { searchVendorsByLocation, getVendorDetails } from "./googlePlaces";
import type { PlaceDetails } from "./googlePlaces";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const MAX_TURNS = 8;

export interface DiscoveredVendor extends PlaceDetails {
  summary: string;
  category: string;
}

export interface DiscoveryResult {
  location: string;
  query: string;
  vendors: DiscoveredVendor[];
  total_found: number;
  generated_at: string;
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_vendors_by_location",
      description:
        "Search Google Places for vendor businesses matching a category near a given location.",
      parameters: {
        type: "object" as const,
        properties: {
          query: {
            type: "string",
            description: 'Business category, e.g. "electronics supplier", "logistics company"',
          },
          location: {
            type: "string",
            description: 'City, region, or address, e.g. "San Francisco, CA"',
          },
        },
        required: ["query", "location"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_vendor_details",
      description:
        "Fetch full details for a vendor using its Google Place ID (phone, website, hours, Maps link).",
      parameters: {
        type: "object" as const,
        properties: {
          place_id: {
            type: "string",
            description: "The Google Place ID from search_vendors_by_location",
          },
        },
        required: ["place_id"],
      },
    },
  },
];

// ── Tool executor ─────────────────────────────────────────────────────────────

async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  if (name === "search_vendors_by_location") {
    const results = await searchVendorsByLocation(args.query, args.location);
    return JSON.stringify(results);
  }
  if (name === "get_vendor_details") {
    const details = await getVendorDetails(args.place_id);
    return JSON.stringify(details);
  }
  throw new Error(`Unknown tool: ${name}`);
}

// ── Main agent ────────────────────────────────────────────────────────────────

export async function runVendorDiscoveryAgent(
  category: string,
  location: string,
): Promise<DiscoveryResult> {
  const systemPrompt = `You are a vendor discovery specialist. Find real businesses near the given location using tools.

Steps:
1. Call search_vendors_by_location to find vendors matching the category and location.
2. For the top 5 most relevant results, call get_vendor_details to enrich each one.
3. Respond ONLY with a valid JSON object in this exact shape (no text before or after):
{
  "vendors": [
    {
      "place_id": "<place id>",
      "name": "<business name>",
      "address": "<full address>",
      "phone": "<phone or null>",
      "website": "<website url or null>",
      "rating": <number or null>,
      "total_ratings": <number or null>,
      "business_status": "<OPERATIONAL | CLOSED_TEMPORARILY | CLOSED_PERMANENTLY>",
      "types": ["<type1>"],
      "lat": <number>,
      "lng": <number>,
      "maps_url": "<google maps url>",
      "opening_hours": ["<Mon: 9am-5pm>"] or null,
      "price_level": <0-4 or null>,
      "category": "<clean human-readable category>",
      "summary": "<one sentence about what this vendor offers>"
    }
  ]
}`;

  // Use plain object array — Mistral SDK accepts this shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Find ${category} vendors near ${location}. Research the top results thoroughly.`,
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
    // SDK maps tool_calls → toolCalls; normalise back to snake_case for the next request
    const rawToolCalls: any[] = assistantMsg.toolCalls ?? assistantMsg.tool_calls ?? [];

    // Build the assistant turn using SDK camelCase field names.
    // The outbound Zod schema transforms toolCalls → tool_calls for the API,
    // so we must use toolCalls (camelCase) here — snake_case is silently dropped.
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

    // Final text answer
    const finishReason = choice.finish_reason ?? choice.finishReason;
    if (finishReason === "stop") {
      const raw =
        typeof assistantMsg.content === "string"
          ? assistantMsg.content
          : JSON.stringify(assistantMsg.content);

      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in Mistral response.");

      const parsed = JSON.parse(match[0]) as { vendors: DiscoveredVendor[] };
      return {
        location,
        query: category,
        vendors: parsed.vendors ?? [],
        total_found: parsed.vendors?.length ?? 0,
        generated_at: new Date().toISOString(),
      };
    }

    // Execute tool calls
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

        // ToolMessage outbound schema expects toolCallId (camelCase);
        // the SDK transforms it to tool_call_id for the API.
        messages.push({
          role: "tool",
          toolCallId: tc.id,
          name: tc.function.name,
          content,
        });
      }
    }
  }

  throw new Error("Vendor discovery agent exceeded maximum turns without a result.");
}
