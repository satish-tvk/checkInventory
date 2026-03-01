import type { AuditReport } from "./types";

// Fixture used when USE_MOCK_GPT=true — dev only, never shipped to production
export const MOCK_AUDIT_REPORT: AuditReport = {
  overall_score: 62,
  ratings: [
    {
      name: "Harbor Fish Co",
      color: "RED",
      reason: "Single-source supplier with 45% spend concentration in a high-tariff region.",
      review_validation_score: 41,
      review_validation_reason: "Mixed cross-platform sentiment with complaint spikes and limited verified profile data.",
      backups: ["Pacific Coast Distributors", "Blue Ocean Seafood Supply"],
    },
    {
      name: "Coastal Greens",
      color: "YELLOW",
      reason: "Moderate geographic risk; limited secondary sourcing options documented.",
      review_validation_score: 66,
      review_validation_reason: "Review coverage is moderate, but source consistency is only partial.",
      backups: [],
    },
    {
      name: "Valley Dairy",
      color: "GREEN",
      reason: "Diversified supply chain, stable pricing, low geopolitical risk.",
      review_validation_score: 84,
      review_validation_reason: "Consistent positive sentiment and stable review signals across multiple sources.",
      backups: [],
    },
  ],
  generated_at: new Date().toISOString(),
  request_id: "mock-request-id",
};

// Sample CSV content for the download link
export const SAMPLE_CSV = `name,category,spend_pct,country
Harbor Fish Co,Seafood,45,USA
Coastal Greens,Produce,25,Mexico
Valley Dairy,Dairy,30,USA
`;
