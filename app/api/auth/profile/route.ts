import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ error: "user_id required." }, { status: 400 });
  try {
    const res = await fetch(`${BACKEND_URL}/api/profiles/user/${user_id}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Profile service unavailable." }, { status: 503 });
  }
}
