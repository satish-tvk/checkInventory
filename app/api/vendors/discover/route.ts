import { NextRequest, NextResponse } from "next/server";
import { runVendorDiscoveryAgent } from "@/lib/mistralVendorAgent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { category?: string; location?: string };
    const { category, location } = body;

    if (!category?.trim() || !location?.trim()) {
      return NextResponse.json(
        { error: "Both category and location are required." },
        { status: 400 },
      );
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "MISTRAL_API_KEY is not configured." },
        { status: 500 },
      );
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_PLACES_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const result = await runVendorDiscoveryAgent(category.trim(), location.trim());
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vendor discovery failed.";
    console.error("[discover] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
