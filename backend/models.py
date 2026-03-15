"""
SQLAlchemy ORM model for business owner profiles.
JSON lists (multi-select fields) are stored as serialised text in SQLite.
"""
import json
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.types import TypeDecorator

from database import Base


# ── Custom SQLite-compatible JSON list column ─────────────────────────────────

class JSONList(TypeDecorator):
    """Stores a Python list as a JSON string in a TEXT column."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        if isinstance(value, str):
            return value          # already serialised
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if not value:
            return []
        try:
            result = json.loads(value)
            return result if isinstance(result, list) else []
        except (json.JSONDecodeError, TypeError):
            return []


# ── ORM model ─────────────────────────────────────────────────────────────────

class BusinessProfile(Base):
    """Persists every completed onboarding questionnaire submission."""

    __tablename__ = "business_profiles"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    # ── Step 1: Business Identity ──────────────────────────────────────────────
    business_name    = Column(String(255), nullable=False)
    owner_name       = Column(String(255), nullable=False)
    industry         = Column(String(100), nullable=False)
    custom_industry  = Column(String(255), nullable=True)
    website          = Column(String(512), nullable=True)
    business_type    = Column(String(50),  nullable=False)
    address_country  = Column(String(10),  nullable=True)
    address_state    = Column(String(10),  nullable=True)
    address_city     = Column(String(100), nullable=True)

    # ── Step 2: Business Scale ────────────────────────────────────────────────
    years_in_operation  = Column(String(20), nullable=False)
    employee_count      = Column(String(20), nullable=False)
    annual_revenue      = Column(String(30), nullable=False)
    operating_locations = Column(String(30), nullable=False)

    # ── Step 3: Supply Chain Profile ──────────────────────────────────────────
    supplier_count          = Column(String(20), nullable=False)
    procurement_categories  = Column(JSONList,   nullable=False)
    monthly_spend           = Column(String(30), nullable=False)
    sourcing_regions        = Column(JSONList,   nullable=False)

    # ── Step 4: Risk & Challenges ─────────────────────────────────────────────
    supply_chain_concerns = Column(JSONList,   nullable=False)
    current_risk_method   = Column(String(50), nullable=False)
    biggest_pain_point    = Column(Text,       nullable=True)

    # ── Step 5: Goals ─────────────────────────────────────────────────────────
    primary_goals = Column(JSONList,    nullable=False)
    how_heard     = Column(String(100), nullable=True)

    # ── Computed at save time by classifier ───────────────────────────────────
    business_archetype        = Column(String(100), nullable=True)
    supply_chain_complexity   = Column(String(50),  nullable=True)
    risk_profile              = Column(String(30),  nullable=True)
    risk_score                = Column(Integer,     nullable=True)

    def __repr__(self) -> str:
        return (
            f"<BusinessProfile id={self.id} name={self.business_name!r} "
            f"archetype={self.business_archetype!r}>"
        )


class User(Base):
    """Stores login credentials for onboarded users."""

    __tablename__ = "users"

    id              = Column(Integer,     primary_key=True, index=True, autoincrement=True)
    username        = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at      = Column(DateTime,    default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r}>"
