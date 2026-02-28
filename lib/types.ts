export interface SupplierInput {
  name: string;
  category: string;
  spend_pct: number;
  country: string;
}

export interface AuditRequest {
  suppliers: SupplierInput[];
  request_id: string;
  ip_hash: string;
  timestamp: string;
}

export type RiskColor = "RED" | "YELLOW" | "GREEN";

export interface SupplierRating {
  name: string;
  color: RiskColor;
  reason: string;
  backups: string[]; // populated only when color === "RED", max 2
}

export interface AuditReport {
  overall_score: number; // 0–100
  ratings: SupplierRating[];
  generated_at: string;
  request_id: string;
}
