"""
Pydantic schemas for request/response validation.
camelCase on the wire (from Next.js) ↔ snake_case internally.
"""
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# ── Inbound (from onboarding form) ───────────────────────────────────────────

class ProfileCreate(BaseModel):
    # Step 1
    businessName:    str
    ownerName:       str
    industry:        str
    customIndustry:  str = ""
    website:         str = ""
    businessType:    str
    addressCountry:  Optional[str] = None
    addressState:    Optional[str] = None
    addressCity:     Optional[str] = None

    # Step 2
    yearsInOperation:  str
    employeeCount:     str
    annualRevenue:     str
    operatingLocations: str

    # Step 3
    supplierCount:          str
    procurementCategories:  List[str] = Field(default_factory=list)
    monthlySpend:           str
    sourcingRegions:        List[str] = Field(default_factory=list)

    # Step 4
    supplyChainConcerns: List[str] = Field(default_factory=list)
    currentRiskMethod:   str
    biggestPainPoint:    str = ""

    # Step 5
    primaryGoals: List[str] = Field(default_factory=list)
    howHeard:     str = ""

    # Auth link
    user_id: Optional[int] = None


# ── Classification output ─────────────────────────────────────────────────────

class ClassificationOut(BaseModel):
    business_archetype:      str
    archetype_description:   str
    archetype_icon:          str
    supply_chain_complexity: str
    complexity_description:  str
    risk_profile:            str
    risk_description:        str
    risk_score:              int
    recommended_features:    List[str]
    key_insight:             str
    urgency_level:           Literal["low", "medium", "high", "critical"]


# ── Full profile response ─────────────────────────────────────────────────────

class ProfileOut(BaseModel):
    id:         int
    created_at: datetime

    business_name:            str
    owner_name:               str
    industry:                 str
    business_archetype:       Optional[str]
    supply_chain_complexity:  Optional[str]
    risk_profile:             Optional[str]
    risk_score:               Optional[int]

    classification: ClassificationOut

    model_config = {"from_attributes": True}


# ── List summary (lighter payload for GET /api/profiles) ─────────────────────

class ProfileSummary(BaseModel):
    id:                       int
    created_at:               datetime
    business_name:            str
    owner_name:               str
    industry:                 str
    business_archetype:       Optional[str]
    supply_chain_complexity:  Optional[str]
    risk_profile:             Optional[str]
    risk_score:               Optional[int]

    model_config = {"from_attributes": True}


# ── Auth schemas ──────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token:    str
    user_id:  int
    username: str


# ── Personalisation profile (lightweight, includes procurement categories) ────

class ProfilePersonal(BaseModel):
    id:                  int
    business_name:       str
    owner_name:          str
    industry:            str
    business_archetype:  Optional[str]
    risk_profile:        Optional[str]
    risk_score:          Optional[int]
    procurement_categories: List[str]

    model_config = {"from_attributes": True}
