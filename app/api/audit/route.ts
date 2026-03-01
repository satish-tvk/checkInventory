import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import type { SupplierInput, AuditReport } from "@/lib/types";
import { MOCK_AUDIT_REPORT } from "@/lib/mockData";
import { runAuditAgent } from "@/lib/auditAgent";

const ALLOWED_FIELDS = ["name", "category", "spend_pct", "country"] as const;
const MAX_ROWS = 10;
const MAX_FIELD_LENGTH = 80;
const INJECTION_PATTERN = /\bignore\b|\bforget\b|\bsystem\b|\bprompt\b/i;

function sanitizeRow(raw: Record<string, string>): SupplierInput | null {
  const row: Partial<SupplierInput> = {};

  for (const field of ALLOWED_FIELDS) {
    const value = raw[field];
    if (value === undefined || value === "") return null;
    const truncated = String(value).slice(0, MAX_FIELD_LENGTH);
    if (INJECTION_PATTERN.test(truncated)) return null;
    (row as Record<string, string | number>)[field] =
      field === "spend_pct" ? parseFloat(truncated) : truncated;
  }

  const spend = row.spend_pct as number;
  if (isNaN(spend) || spend < 0 || spend > 100) return null;

  return row as SupplierInput;
}

export async function POST(req: NextRequest) {
  let body: { csvText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { csvText } = body;
  if (!csvText || typeof csvText !== "string") {
    return NextResponse.json({ error: "Missing csvText field." }, { status: 400 });
  }

  // Parse CSV
  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json({ error: "CSV parse error: " + parsed.errors[0].message }, { status: 400 });
  }

  if (parsed.data.length === 0) {
    return NextResponse.json({ error: "CSV has no data rows." }, { status: 400 });
  }

  if (parsed.data.length > MAX_ROWS) {
    return NextResponse.json({ error: `Maximum ${MAX_ROWS} suppliers allowed.` }, { status: 400 });
  }

  // Sanitize rows
  const suppliers: SupplierInput[] = [];
  for (const raw of parsed.data) {
    const row = sanitizeRow(raw);
    if (!row) {
      return NextResponse.json(
        { error: "Invalid or suspicious data in CSV. Check all rows have name, category, spend_pct, and country." },
        { status: 400 }
      );
    }
    suppliers.push(row);
  }

  // Validate total spend_pct
  const totalSpend = suppliers.reduce((sum, s) => sum + s.spend_pct, 0);
  if (totalSpend > 100.01) {
    return NextResponse.json({ error: "Total spend_pct exceeds 100%." }, { status: 400 });
  }

  // Dev mock shortcut
  if (process.env.USE_MOCK_GPT === "true") {
    const mock: AuditReport = {
      ...MOCK_AUDIT_REPORT,
      generated_at: new Date().toISOString(),
    };
    return NextResponse.json(mock);
  }

  const requestId = uuidv4();
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
  }
  if (!process.env.MISTRAL_API_KEY) {
    return NextResponse.json({ error: "MISTRAL_API_KEY is not configured." }, { status: 500 });
  }
  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json({ error: "TAVILY_API_KEY is not configured." }, { status: 500 });
  }
  try {
    const report = await runAuditAgent(suppliers, requestId);
    return NextResponse.json(report);
  } catch (err) {
    console.error("Audit agent error:", err);
    return NextResponse.json(
      { error: "Audit failed. Check server logs for details." },
      { status: 500 }
    );
  }
}
