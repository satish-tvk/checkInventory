"""
VendorIQ — Business Profile API
--------------------------------
FastAPI application backed by SQLAlchemy ORM + SQLite.

Run with:
    uvicorn main:app --reload --port 8000

Endpoints:
    POST   /api/profiles          — save onboarding data + classify
    GET    /api/profiles           — list all profiles (summary)
    GET    /api/profiles/{id}     — retrieve one profile with classification
    DELETE /api/profiles/{id}     — delete a profile
    GET    /health                — liveness check
"""
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import classifier
import database
import models
import schemas

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="VendorIQ Business Profile API",
    version="1.0.0",
    description="Stores onboarding questionnaires and classifies business types.",
)

# Ensure all tables exist on startup
models.Base.metadata.create_all(bind=database.engine)

# Allow Next.js dev server and production origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)


# ── Helper: build ProfileOut from ORM object ──────────────────────────────────

def _build_profile_out(profile: models.BusinessProfile) -> schemas.ProfileOut:
    result = classifier.classify(profile)
    return schemas.ProfileOut(
        id                       = profile.id,
        created_at               = profile.created_at,
        business_name            = profile.business_name,
        owner_name               = profile.owner_name,
        industry                 = profile.industry,
        business_archetype       = profile.business_archetype,
        supply_chain_complexity  = profile.supply_chain_complexity,
        risk_profile             = profile.risk_profile,
        risk_score               = profile.risk_score,
        classification           = schemas.ClassificationOut(**result.__dict__),
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@app.post("/api/profiles", response_model=schemas.ProfileOut, status_code=201)
def create_profile(
    body: schemas.ProfileCreate,
    db:   Session = Depends(database.get_db),
):
    """
    Persist a completed onboarding submission, run the classifier,
    store the computed archetype/complexity/risk, and return the full result.
    """
    profile = models.BusinessProfile(
        business_name          = body.businessName.strip(),
        owner_name             = body.ownerName.strip(),
        industry               = body.industry,
        custom_industry        = body.customIndustry.strip() or None,
        website                = body.website.strip() or None,
        business_type          = body.businessType,
        address_country        = body.addressCountry or None,
        address_state          = body.addressState or None,
        address_city           = body.addressCity or None,
        years_in_operation     = body.yearsInOperation,
        employee_count         = body.employeeCount,
        annual_revenue         = body.annualRevenue,
        operating_locations    = body.operatingLocations,
        supplier_count         = body.supplierCount,
        procurement_categories = body.procurementCategories,
        monthly_spend          = body.monthlySpend,
        sourcing_regions       = body.sourcingRegions,
        supply_chain_concerns  = body.supplyChainConcerns,
        current_risk_method    = body.currentRiskMethod,
        biggest_pain_point     = body.biggestPainPoint.strip() or None,
        primary_goals          = body.primaryGoals,
        how_heard              = body.howHeard.strip() or None,
    )

    # Run classifier before persisting so computed columns are stored
    result = classifier.classify(profile)
    profile.business_archetype       = result.business_archetype
    profile.supply_chain_complexity  = result.supply_chain_complexity
    profile.risk_profile             = result.risk_profile
    profile.risk_score               = result.risk_score

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return schemas.ProfileOut(
        id                       = profile.id,
        created_at               = profile.created_at,
        business_name            = profile.business_name,
        owner_name               = profile.owner_name,
        industry                 = profile.industry,
        business_archetype       = profile.business_archetype,
        supply_chain_complexity  = profile.supply_chain_complexity,
        risk_profile             = profile.risk_profile,
        risk_score               = profile.risk_score,
        classification           = schemas.ClassificationOut(**result.__dict__),
    )


@app.get("/api/profiles", response_model=List[schemas.ProfileSummary])
def list_profiles(
    skip:  int = 0,
    limit: int = 50,
    db:    Session = Depends(database.get_db),
):
    """Return a paginated list of all saved profiles (summary, no classification detail)."""
    profiles = (
        db.query(models.BusinessProfile)
        .order_by(models.BusinessProfile.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return profiles


@app.get("/api/profiles/{profile_id}", response_model=schemas.ProfileOut)
def get_profile(
    profile_id: int,
    db:         Session = Depends(database.get_db),
):
    """Retrieve a single profile by ID with full classification detail."""
    profile = (
        db.query(models.BusinessProfile)
        .filter(models.BusinessProfile.id == profile_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return _build_profile_out(profile)


@app.delete("/api/profiles/{profile_id}", status_code=204)
def delete_profile(
    profile_id: int,
    db:         Session = Depends(database.get_db),
):
    """Delete a profile by ID."""
    profile = (
        db.query(models.BusinessProfile)
        .filter(models.BusinessProfile.id == profile_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    db.delete(profile)
    db.commit()


@app.get("/health")
def health():
    return {"status": "ok", "database": "sqlite", "orm": "sqlalchemy"}
