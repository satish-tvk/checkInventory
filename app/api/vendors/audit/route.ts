import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { runVendorComparisonAgent } from "@/lib/vendorComparisonAgent";
import type { DiscoveredVendor } from "@/lib/mistralVendorAgent";

export async function POST(req: NextRequest) {
  let body: { vendors?: DiscoveredVendor[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { vendors } = body;
  if (!Array.isArray(vendors) || vendors.length < 1 || vendors.length > 3) {
    return NextResponse.json({ error: "Select 1–3 vendors to audit." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
  }
  if (!process.env.MISTRAL_API_KEY) {
    return NextResponse.json({ error: "MISTRAL_API_KEY is not configured." }, { status: 500 });
  }
  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json({ error: "TAVILY_API_KEY is not configured." }, { status: 500 });
  }

  const requestId = uuidv4();
  try {
    const report = await runVendorComparisonAgent(vendors, requestId);
    return NextResponse.json(report);
  } catch (err) {
    console.error("[vendor-audit] error:", err);
    return NextResponse.json({ error: "Audit failed. Check server logs." }, { status: 500 });
  }
}
