"""
OneStopSMB — Business Profile API
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
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List

import auth
import classifier
import database
import models
import schemas

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="OneStopSMB Business Profile API",
    version="1.0.0",
    description="Stores onboarding questionnaires and classifies business types.",
)

# Ensure all tables exist on startup
models.Base.metadata.create_all(bind=database.engine)

# Add user_id column to existing business_profiles tables (idempotent migration)
with database.engine.connect() as _conn:
    try:
        _conn.execute(text("ALTER TABLE business_profiles ADD COLUMN user_id INTEGER REFERENCES users(id)"))
        _conn.commit()
    except Exception:
        pass  # Column already exists

# Allow Next.js dev server and production origin
import os

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production Cloudflare domain if set
_prod_origin = os.environ.get("FRONTEND_URL")
if _prod_origin:
    ALLOWED_ORIGINS.append(_prod_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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
        user_id                = body.user_id,
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


@app.post("/api/auth/register", response_model=schemas.TokenResponse, status_code=201)
def register(body: schemas.UserRegister, db: Session = Depends(database.get_db)):
    """Register a new user with a username and bcrypt-hashed password."""
    body.username = body.username.strip().lower()
    if not body.username or not body.password:
        raise HTTPException(status_code=400, detail="Username and password are required.")
    if db.query(models.User).filter(models.User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken.")
    user = models.User(username=body.username, hashed_password=auth.hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.TokenResponse(
        token=auth.create_token(user.id, user.username),
        user_id=user.id,
        username=user.username,
    )


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(body: schemas.UserLogin, db: Session = Depends(database.get_db)):
    """Validate credentials and return a JWT token."""
    body.username = body.username.strip().lower()
    user = db.query(models.User).filter(models.User.username == body.username).first()
    if not user or not auth.verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    return schemas.TokenResponse(
        token=auth.create_token(user.id, user.username),
        user_id=user.id,
        username=user.username,
    )


@app.get("/api/profiles/user/{user_id}", response_model=schemas.ProfilePersonal)
def get_profile_by_user(
    user_id: int,
    db:      Session = Depends(database.get_db),
):
    """Return the most recent business profile for a given user_id."""
    profile = (
        db.query(models.BusinessProfile)
        .filter(models.BusinessProfile.user_id == user_id)
        .order_by(models.BusinessProfile.created_at.desc())
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="No profile found for this user.")
    return profile


@app.get("/health")
def health():
    return {"status": "ok", "database": "sqlite", "orm": "sqlalchemy"}
