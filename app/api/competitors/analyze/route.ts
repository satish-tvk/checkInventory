import { NextRequest, NextResponse } from "next/server";
import { runCompetitorAnalysisAgent } from "@/lib/mistralCompetitorAgent";

interface AnalyzeBody {
  businessName?: string;
  industry?: string;
  location?: string;
}

export async function POST(req: NextRequest) {
  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const businessName = body.businessName?.trim();
  const industry = body.industry?.trim();
  const location = body.location?.trim();

  if (!businessName || !industry || !location) {
    return NextResponse.json(
      { error: "businessName, industry, and location are required." },
      { status: 400 },
    );
  }

  if (!process.env.MISTRAL_API_KEY) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY is not configured." },
      { status: 500 },
    );
  }

  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json(
      { error: "TAVILY_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    const result = await runCompetitorAnalysisAgent(businessName, industry, location);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Competitor analysis failed.";
    console.error("[competitors/analyze] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
