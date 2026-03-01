import { Mistral } from "@mistralai/mistralai";
import { searchVendorsByLocation } from "@/lib/googlePlaces";
import { NextResponse } from "next/server";

// Initialize Mistral client
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required (e.g., 'Find me catering vendors in New York City')" },
        { status: 400 }
      );
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json({ error: "MISTRAL_API_KEY is not configured." }, { status: 500 });
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is not configured." }, { status: 500 });
    }

    // Step 1: Define the tool (function) the agent can use
    const tools = [
      {
        type: "function",
        function: {
          name: "searchVendors",
          description: "Search for vendors or businesses based on a type of business and a location.",
          parameters: {
            type: "object",
            properties: {
              businessType: {
                type: "string",
                description: "The type of business to search for (e.g., 'catering', 'photography', 'florist').",
              },
              location: {
                type: "string",
                description: "The location to search in (e.g., 'New York City', 'San Francisco, CA').",
              },
            },
            required: ["businessType", "location"],
          },
        },
      },
    ];

    const messages = [
      {
        role: "system",
        content:
          "You are a helpful Discovery Agent. Your job is to help users find vendors based on their queries. You MUST use the `searchVendors` tool to find real places based on the user's request. When you get the results back from the tool, summarize them nicely for the user, including the name, address, and rating if available.",
      },
      {
        role: "user",
        content: query,
      },
    ];

    // Step 2: Call Mistral with the user's query and the available tools
    // We use a model that supports function calling, like mistral-large-latest or open-mixtral-8x22b
    const response = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: messages as any,
      tools: tools as any,
      toolChoice: "auto",
    });

    const responseMessage = response.choices?.[0]?.message;

    if (!responseMessage) {
      throw new Error("No response message from Mistral");
    }

    // Step 3: Check if Mistral decided to call a tool
    if (responseMessage.toolCalls && responseMessage.toolCalls.length > 0) {
      const toolCall = responseMessage.toolCalls[0];

      if (toolCall.function.name === "searchVendors") {
        // Step 4: Execute the actual tool function
        const args = typeof toolCall.function.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;

        const { businessType, location } = args;

        console.log(`Agent called searchVendors with: ${businessType} in ${location}`);

        let toolResult;
        let isError = false;
        try {
          const places = await searchVendorsByLocation(businessType, location);
          toolResult = JSON.stringify(places);
        } catch (error: any) {
          console.error("Error executing Google Places search:", error);
          isError = true;
          toolResult = JSON.stringify({ error: error.message || "Failed to search vendors." });
        }

        messages.push(responseMessage as any); // Append Assistant's tool call request

        messages.push({
          role: "tool",
          name: "searchVendors",
          content: toolResult,
          toolCallId: toolCall.id,
        } as any);

        // Optional: If there was a fatal API error (like REQUEST_DENIED), we can just return it 
        // immediately rather than asking Mistral to summarize a failed tool call.
        if (isError) {
          let errorMessage = "Unknown error";
          try {
            errorMessage = JSON.parse(toolResult).error;
          } catch (e) {
            errorMessage = toolResult;
          }
          return NextResponse.json({
            reply: `I encountered an error while searching for vendors: ${errorMessage}. Please check your Google Places API Key configuration.`,
          });
        }

        // Step 5: Call Mistral again with the tool's result to generate the final summary
        const finalResponse = await mistral.chat.complete({
          model: "mistral-large-latest",
          messages: messages as any,
        });

        return NextResponse.json({
          reply: finalResponse.choices?.[0]?.message?.content || "No summary could be generated.",
        });
      }
    }

    // If no tool was called, just return the standard reply
    return NextResponse.json({
      reply: responseMessage.content || "Sorry, I couldn't understand that.",
    });

  } catch (error: any) {
    console.error("Discovery Agent Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
