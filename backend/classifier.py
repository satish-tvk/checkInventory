"""
Rule-based business classifier.

Analyses a BusinessProfile (or any duck-typed object with the same fields)
and returns a ClassificationResult with archetype, complexity, risk profile,
recommended features, and a personalised insight.
"""
from dataclasses import dataclass
from typing import List


# ── Archetype catalogue ───────────────────────────────────────────────────────

ARCHETYPES: dict[str, dict] = {
    "Solopreneur": {
        "description": (
            "Single-owner operator with a lean, nimble supply chain. "
            "Every supplier relationship is personal and every disruption hits hard."
        ),
        "icon": "🧑‍💼",
    },
    "Early-Stage Startup": {
        "description": (
            "Rapidly building your supplier network from scratch. "
            "Speed and flexibility matter most — but visibility into vendor risk "
            "pays dividends before your first major procurement decision."
        ),
        "icon": "🚀",
    },
    "Growing SME": {
        "description": (
            "Your business is scaling and so is supplier complexity. "
            "A structured risk approach now prevents costly surprises as volumes increase."
        ),
        "icon": "📈",
    },
    "Established SME": {
        "description": (
            "Deep industry expertise with an established supplier base. "
            "Proactive monitoring protects the reputation you've spent years building."
        ),
        "icon": "🏢",
    },
    "Mid-Market Enterprise": {
        "description": (
            "Significant procurement scale with a multi-tier supply chain "
            "that demands systematic, data-driven oversight."
        ),
        "icon": "🏭",
    },
    "High-Volume Buyer": {
        "description": (
            "Procurement is a core strategic function. "
            "Supplier risk and cost optimisation directly impact your margins at scale."
        ),
        "icon": "💰",
    },
    "Global Sourcer": {
        "description": (
            "Multi-regional procurement creates geopolitical and logistical exposure "
            "that requires continuous monitoring across time zones and regulatory environments."
        ),
        "icon": "🌍",
    },
    "Compliance-Driven Business": {
        "description": (
            "Regulatory requirements shape every supplier decision you make. "
            "Automated certification tracking is not optional — it's your licence to operate."
        ),
        "icon": "📋",
    },
}

COMPLEXITY_DESCRIPTIONS: dict[str, str] = {
    "Minimal":    "Small, manageable supply chain. Focus on depth of relationship over breadth.",
    "Basic":      "A core supplier base with moderate coordination needs.",
    "Moderate":   "Multi-supplier, multi-region operations that benefit from structured monitoring.",
    "Complex":    "Sophisticated network with meaningful single-source and geographic risk.",
    "Enterprise": "Enterprise-scale procurement with significant systemic risk exposure.",
}

RISK_DESCRIPTIONS: dict[str, str] = {
    "Low":      "Risk exposure is relatively contained. Maintain current practices and monitor.",
    "Moderate": "Several risk factors deserve attention. Proactive management now prevents crises later.",
    "High":     "Multiple active risk vectors requiring immediate attention and mitigation planning.",
    "Critical": "Critical vulnerabilities identified. Urgent action is strongly recommended.",
}


# ── Result dataclass ──────────────────────────────────────────────────────────

@dataclass
class ClassificationResult:
    business_archetype:      str
    archetype_description:   str
    archetype_icon:          str
    supply_chain_complexity: str
    complexity_description:  str
    risk_profile:            str
    risk_description:        str
    risk_score:              int          # 0–100
    recommended_features:    List[str]
    key_insight:             str
    urgency_level:           str          # low | medium | high | critical


# ── Public entry point ────────────────────────────────────────────────────────

def classify(profile) -> ClassificationResult:
    """
    Classify a business profile and return a fully populated ClassificationResult.

    `profile` must expose these attributes (all strings unless noted):
        supply_chain_concerns  (list[str])
        primary_goals          (list[str])
        procurement_categories (list[str])
        sourcing_regions       (list[str])
        employee_count, years_in_operation, annual_revenue,
        operating_locations, supplier_count, monthly_spend,
        current_risk_method
    """
    concerns   = _safe_list(profile, "supply_chain_concerns")
    goals      = _safe_list(profile, "primary_goals")
    regions    = _safe_list(profile, "sourcing_regions")
    categories = _safe_list(profile, "procurement_categories")

    archetype              = _archetype(profile, concerns, goals, regions)
    complexity, c_score    = _complexity(profile, regions, categories)
    risk,       r_score    = _risk(profile, concerns, regions)
    features               = _features(profile, concerns, goals, regions)
    insight                = _insight(profile, concerns, regions, archetype, risk)

    urgency = (
        "critical" if r_score >= 75 else
        "high"     if r_score >= 50 else
        "medium"   if r_score >= 25 else
        "low"
    )

    return ClassificationResult(
        business_archetype      = archetype,
        archetype_description   = ARCHETYPES[archetype]["description"],
        archetype_icon          = ARCHETYPES[archetype]["icon"],
        supply_chain_complexity = complexity,
        complexity_description  = COMPLEXITY_DESCRIPTIONS[complexity],
        risk_profile            = risk,
        risk_description        = RISK_DESCRIPTIONS[risk],
        risk_score              = r_score,
        recommended_features    = features,
        key_insight             = insight,
        urgency_level           = urgency,
    )


# ── Private helpers ───────────────────────────────────────────────────────────

def _safe_list(profile, attr: str) -> list:
    val = getattr(profile, attr, None)
    return val if isinstance(val, list) else []


def _archetype(profile, concerns: list, goals: list, regions: list) -> str:
    emp   = getattr(profile, "employee_count",      "") or ""
    years = getattr(profile, "years_in_operation",  "") or ""
    rev   = getattr(profile, "annual_revenue",      "") or ""
    spend = getattr(profile, "monthly_spend",       "") or ""
    locs  = getattr(profile, "operating_locations", "") or ""

    # Compliance-driven (strongest signal — check first)
    if "compliance" in concerns and "compliance" in goals:
        return "Compliance-Driven Business"

    # Solopreneur
    if emp == "solo":
        return "Solopreneur"

    # Early-stage startup
    if years == "0-1":
        return "Early-Stage Startup"

    # High-volume buyer (spend drives the archetype)
    if spend == "200k+":
        return "High-Volume Buyer"

    # Global sourcer
    if len(regions) >= 5 or (locs == "global" and len(regions) >= 3):
        return "Global Sourcer"

    # Mid-market enterprise
    if emp == "200+" or rev == "10m+":
        return "Mid-Market Enterprise"

    # Established SME
    if years == "10+":
        return "Established SME"

    # Default — growing SME covers 1–10 year businesses with some team
    return "Growing SME"


def _complexity(profile, regions: list, categories: list) -> tuple[str, int]:
    score = 0

    # Supplier count (0–60)
    score += {"1-5": 5, "6-20": 20, "21-50": 40, "50+": 60}.get(
        getattr(profile, "supplier_count", ""), 10
    )

    # Sourcing regions (0–50)
    r = len(regions)
    score += 5 if r == 1 else 15 if r <= 3 else 30 if r <= 6 else 50

    # Monthly spend (0–35)
    score += {"under10k": 5, "10k-50k": 10, "50k-200k": 20, "200k+": 35}.get(
        getattr(profile, "monthly_spend", ""), 10
    )

    # Procurement category diversity (0–20)
    score += min(len(categories) * 2, 20)

    # Operating locations (0–20)
    score += {"single": 0, "multi_city": 5, "multi_state": 10, "global": 20}.get(
        getattr(profile, "operating_locations", ""), 0
    )

    score = min(score, 130)   # cap raw

    if score < 20:  return "Minimal",    score
    if score < 45:  return "Basic",      score
    if score < 75:  return "Moderate",   score
    if score < 105: return "Complex",    score
    return                 "Enterprise", score


def _risk(profile, concerns: list, regions: list) -> tuple[str, int]:
    score = 0

    # Concern count (0–50)
    score += min(len(concerns) * 10, 50)

    # High-impact specific concerns
    if "single_source" in concerns: score += 15
    if "geo_risk"       in concerns: score += 10
    if "financial"      in concerns: score += 10

    # Risk tracking method
    method = getattr(profile, "current_risk_method", "") or ""
    if method == "none":        score += 20
    elif method == "spreadsheet": score += 10

    # Supplier count adds systemic risk
    sc = getattr(profile, "supplier_count", "") or ""
    if sc == "50+":   score += 10
    elif sc == "21-50": score += 5

    # Global sourcing + no formal tracking
    if len(regions) >= 4 and method == "none":
        score += 15

    score = min(score, 100)

    if score < 25: return "Low",      score
    if score < 50: return "Moderate", score
    if score < 75: return "High",     score
    return                "Critical", score


def _features(profile, concerns: list, goals: list, regions: list) -> List[str]:
    features: List[str] = []
    method = getattr(profile, "current_risk_method", "") or ""
    sc     = getattr(profile, "supplier_count",      "") or ""

    if "discover" in goals or sc in ("1-5", "6-20"):
        features.append("Vendor Discovery — find and qualify new suppliers fast")

    if "monitor" in goals or method in ("none", "spreadsheet"):
        features.append("Risk Audit — AI-powered supplier scorecard across 6 metrics")

    if len(regions) >= 3 or "geo_risk" in concerns:
        features.append("Vendor Compare — side-by-side geographic & financial risk")

    if "compliance" in goals or "compliance" in concerns:
        features.append("Compliance Check — surface ISO, SOC 2, GDPR certs automatically")

    if "backup" in goals or "single_source" in concerns:
        features.append("Backup Finder — pre-qualify alternatives before you need them")

    if "cost" in goals:
        features.append("Financial Stability Score — spot financially distressed vendors early")

    return features[:4]   # surface at most 4 recommendations


def _insight(
    profile, concerns: list, regions: list, archetype: str, risk: str
) -> str:
    method = getattr(profile, "current_risk_method", "") or ""
    sc     = getattr(profile, "supplier_count",      "") or ""

    if risk == "Critical":
        tracking = "no formal" if method == "none" else "limited"
        return (
            f"As a {archetype}, your supply chain has {len(concerns)} active risk "
            f"factors with {tracking} tracking in place. "
            "Immediate auditing is strongly recommended before your next procurement cycle."
        )

    if archetype == "Solopreneur":
        return (
            "With a lean team, a single supplier failure can halt your operations. "
            "Regular risk checks keep you ahead of disruptions without requiring a dedicated team."
        )

    if archetype == "Global Sourcer":
        return (
            f"Sourcing from {len(regions)} regions creates geopolitical and logistical exposure. "
            "OneStopSMB monitors political stability, financial health, and compliance "
            "across your international supplier network."
        )

    if method == "none":
        return (
            f"You currently have no formal risk tracking despite managing {sc} suppliers. "
            "Starting with a Risk Audit establishes your baseline and surfaces "
            "the vendors that need immediate attention."
        )

    if "single_source" in concerns:
        return (
            "Single-source dependencies are your biggest vulnerability. "
            "Discovering and pre-qualifying backup vendors now prevents "
            "a single failure from disrupting your entire operation."
        )

    return (
        f"Your {archetype.lower()} profile with {sc} suppliers "
        f"across {len(regions)} region(s) is well-positioned to benefit from "
        "automated risk intelligence — freeing you to focus on growth, not firefighting."
    )
