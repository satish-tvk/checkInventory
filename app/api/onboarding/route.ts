import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/profiles`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { detail?: string }).detail ?? "Failed to save profile." },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Profile service unavailable. Start the Python backend: cd backend && uvicorn main:app --reload --port 8000" },
      { status: 503 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skip  = searchParams.get("skip")  ?? "0";
  const limit = searchParams.get("limit") ?? "50";

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/profiles?skip=${skip}&limit=${limit}`,
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Profile service unavailable." },
      { status: 503 },
    );
  }
}
