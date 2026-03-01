export interface SupplierInput {
  name: string;
  category: string;
  spend_pct: number;
  country: string;
}

export type RiskColor = "RED" | "YELLOW" | "GREEN";

export interface VendorScorecard {
  name: string;
  risk_score: number; // 0-100, higher = riskier
  reliability: number; // 0-100 %
  financial_stability: number; // 0-100 %
  review_validation_score: number; // 0-100 %, higher = more trustworthy review signal
  years_in_business: number; // estimated years
  legal_disputes: number; // count 0-5
  compliance: string[]; // e.g. ["ISO 9001", "SOC 2"]
  color: RiskColor;
  reason: string;
  review_validation_reason: string;
  backups: string[];
}

export interface VendorComparisonReport {
  overall_score: number; // 0-100, higher = safer portfolio
  scorecards: VendorScorecard[];
  generated_at: string;
  request_id: string;
}

export interface AuditRequest {
  suppliers: SupplierInput[];
  request_id: string;
  ip_hash: string;
  timestamp: string;
}

export interface SupplierRating {
  name: string;
  color: RiskColor;
  reason: string;
  review_validation_score: number; // 0-100 %, higher = more trustworthy review signal
  review_validation_reason: string;
  backups: string[]; // populated only when color === "RED", max 2
}

export interface AuditReport {
  overall_score: number; // 0-100
  ratings: SupplierRating[];
  generated_at: string;
  request_id: string;
}
