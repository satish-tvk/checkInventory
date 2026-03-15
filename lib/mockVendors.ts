export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  country: string;
  riskScore: number;        // 0-100, higher = safer
  reliabilityScore: number; // 0-100
  yearsInBusiness: number;
  compliance: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  revenue: string;
  employees: string;
  description: string;
  financialStability: number; // 0-100
  reviewValidationScore: number; // 0-100
  legalDisputes: number;
  operationalRisk: number;    // 0-100, lower = safer
  riskTrend: number[];        // last 7 months (risk score history)
  specialty: string[];
  website: string;
}

export const MOCK_VENDORS: Vendor[] = [
  {
    id: "1",
    name: "TechForge Solutions",
    category: "IT Infrastructure",
    location: "San Francisco, CA",
    country: "USA",
    riskScore: 18,
    reliabilityScore: 94,
    yearsInBusiness: 12,
    compliance: ["ISO 27001", "SOC 2", "GDPR"],
    riskLevel: "LOW",
    revenue: "$45M",
    employees: "280",
    description:
      "Leading provider of enterprise IT infrastructure solutions with a proven track record of reliable delivery and exceptional security standards.",
    financialStability: 92,
    reviewValidationScore: 88,
    legalDisputes: 0,
    operationalRisk: 15,
    riskTrend: [24, 22, 20, 19, 18, 18, 18],
    specialty: ["Cloud Infrastructure", "Network Security", "Data Centers"],
    website: "techforge.io",
  },
  {
    id: "2",
    name: "GlobalParts Co.",
    category: "Manufacturing",
    location: "Detroit, MI",
    country: "USA",
    riskScore: 67,
    reliabilityScore: 71,
    yearsInBusiness: 8,
    compliance: ["ISO 9001"],
    riskLevel: "MEDIUM",
    revenue: "$120M",
    employees: "850",
    description:
      "Regional manufacturer specializing in automotive components with solid production capacity but moderate geopolitical exposure.",
    financialStability: 68,
    reviewValidationScore: 63,
    legalDisputes: 2,
    operationalRisk: 54,
    riskTrend: [60, 63, 65, 67, 66, 68, 67],
    specialty: ["Auto Parts", "Metal Fabrication", "Assembly"],
    website: "globalparts.co",
  },
  {
    id: "3",
    name: "SwiftLogistics Inc.",
    category: "Supply Chain",
    location: "Chicago, IL",
    country: "USA",
    riskScore: 31,
    reliabilityScore: 88,
    yearsInBusiness: 15,
    compliance: ["ISO 9001", "CTPAT", "C-TPAT"],
    riskLevel: "LOW",
    revenue: "$200M",
    employees: "1,200",
    description:
      "Established logistics provider with a vast domestic network, strong compliance record, and diversified customer base.",
    financialStability: 86,
    reviewValidationScore: 82,
    legalDisputes: 1,
    operationalRisk: 28,
    riskTrend: [38, 36, 34, 33, 31, 30, 31],
    specialty: ["Last-Mile Delivery", "Warehousing", "Cold Chain"],
    website: "swiftlogistics.com",
  },
  {
    id: "4",
    name: "PrimeRaw Materials",
    category: "Raw Materials",
    location: "Houston, TX",
    country: "USA",
    riskScore: 82,
    reliabilityScore: 55,
    yearsInBusiness: 3,
    compliance: [],
    riskLevel: "HIGH",
    revenue: "$18M",
    employees: "45",
    description:
      "Early-stage supplier operating in a volatile commodity market with limited compliance certifications and high financial leverage.",
    financialStability: 41,
    reviewValidationScore: 37,
    legalDisputes: 4,
    operationalRisk: 78,
    riskTrend: [70, 73, 76, 79, 81, 82, 82],
    specialty: ["Petroleum Derivatives", "Chemical Compounds"],
    website: "primeraw.com",
  },
  {
    id: "5",
    name: "CloudNine SaaS",
    category: "Software",
    location: "Austin, TX",
    country: "USA",
    riskScore: 14,
    reliabilityScore: 97,
    yearsInBusiness: 9,
    compliance: ["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA"],
    riskLevel: "LOW",
    revenue: "$80M",
    employees: "420",
    description:
      "Top-tier SaaS provider with industry-leading security posture, exceptional uptime record, and comprehensive compliance coverage.",
    financialStability: 95,
    reviewValidationScore: 93,
    legalDisputes: 0,
    operationalRisk: 11,
    riskTrend: [18, 17, 16, 15, 14, 14, 14],
    specialty: ["Enterprise SaaS", "Data Analytics", "API Platforms"],
    website: "cloudnine.io",
  },
  {
    id: "6",
    name: "EastCoast Fabricators",
    category: "Manufacturing",
    location: "Boston, MA",
    country: "USA",
    riskScore: 29,
    reliabilityScore: 90,
    yearsInBusiness: 22,
    compliance: ["ISO 9001", "AS9100", "IATF 16949"],
    riskLevel: "LOW",
    revenue: "$95M",
    employees: "620",
    description:
      "Legacy manufacturer with deep aerospace and defense expertise, strong quality management systems, and multi-decade operational history.",
    financialStability: 88,
    reviewValidationScore: 85,
    legalDisputes: 0,
    operationalRisk: 22,
    riskTrend: [33, 32, 30, 29, 29, 28, 29],
    specialty: ["Aerospace Parts", "Precision Engineering", "Defense"],
    website: "ecfab.com",
  },
];

export const TESTIMONIALS = [
  {
    id: "1",
    quote:
      "OneStopSMB identified three high-risk suppliers before they caused a major disruption. The AI risk scoring is incredibly accurate and saved us millions.",
    author: "Sarah Chen",
    title: "Chief Procurement Officer",
    company: "NexGen Manufacturing",
    initials: "SC",
  },
  {
    id: "2",
    quote:
      "We reduced our supply chain risk exposure by 67% in just six months. The real-time monitoring and instant alerts are genuinely game-changing.",
    author: "Marcus Webb",
    title: "VP Operations",
    company: "Apex Retail Group",
    initials: "MW",
  },
  {
    id: "3",
    quote:
      "The vendor comparison feature saved us weeks of due diligence. Best investment we've made in operational intelligence. Absolutely essential.",
    author: "Priya Sharma",
    title: "Founder & CEO",
    company: "Elevate Logistics",
    initials: "PS",
  },
];

export const CATEGORIES = [
  "All Categories",
  "IT Infrastructure",
  "Manufacturing",
  "Supply Chain",
  "Raw Materials",
  "Software",
  "Logistics",
  "Services",
];
