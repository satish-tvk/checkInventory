# VendorIQ

AI-powered procurement intelligence platform for vendor discovery, competitor analysis, and risk auditing.

## What This App Does

VendorIQ helps teams:
- discover vendors by location and category
- audit supplier risk with AI-generated scorecards
- validate external review signals (cross-source)
- analyze local competitors by business location
- onboard business context for personalized workflows

## Core Features

### 1. Vendor Discovery
- Location-aware vendor lookup using Google Places
- Country + state required, city/ZIP optional in key flows
- Enriched vendor cards (ratings, address, contact, maps)

### 2. Supply Risk Audit
- CSV upload or vendor search input
- AI risk ratings (`RED`, `YELLOW`, `GREEN`)
- Backup vendor suggestions for high-risk suppliers
- Review validation metric from external sources

### 3. Vendor Comparison
- Side-by-side scoring across metrics like:
  - risk score
  - reliability
  - financial stability
  - review validation score
  - years in business
  - legal disputes
  - compliance

### 4. Competitor Analysis
- Mistral agent + Tavily web research
- Local-market competitor mapping by industry/location
- Threats, opportunities, and confidence-scored competitors

### 5. Business Onboarding (Python Backend)
- Captures company profile and operating context
- Stores records in SQLite via SQLAlchemy
- Returns profile classification/risk metadata

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
- AI/Agents:
  - Mistral (`@mistralai/mistralai`)
  - Anthropic SDK (`@anthropic-ai/sdk`)
  - Tavily (`@tavily/core`)
- Data/API:
  - Google Places API
  - FastAPI + SQLAlchemy + SQLite (for onboarding profiles)

## Project Structure

- `app/` - Next.js pages + API routes
- `components/` - UI components
- `lib/` - agents, utilities, types, external API integrations
- `backend/` - FastAPI service for onboarding profiles/classification

## Environment Variables

Create `.env.local` from `.env.local.example`.

Required for major features:
- `MISTRAL_API_KEY`
- `TAVILY_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `ANTHROPIC_API_KEY`
- `BACKEND_URL` (defaults to `http://localhost:8000`)

Optional:
- `USE_MOCK_GPT=true` to return fixture audit data
- Upstash keys (if rate limiting is used)

## Local Setup

## 1) Frontend (Next.js)

```bash
npm install
npm run dev
```

App runs at: `http://localhost:3000`

## 2) Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

## Key App Routes

- `/` - landing page
- `/vendors/discover` - discover + compare/audit vendors
- `/audit` - supply risk audit
- `/competitors` - competitor analysis
- `/onboarding` - business profile setup

## Key API Routes (Next.js)

- `POST /api/vendors/discover`
- `POST /api/vendors/search`
- `POST /api/vendors/audit`
- `POST /api/audit`
- `POST /api/competitors/analyze`
- `POST /api/onboarding` (proxy to Python backend)

## Python Backend Routes

- `POST /api/profiles`
- `GET /api/profiles`
- `GET /api/profiles/{id}`
- `DELETE /api/profiles/{id}`
- `GET /health`

## Notes

- This repository currently includes generated/backend runtime artifacts (e.g. `backend/vendoriq.db`, `backend/__pycache__/...`).
- `npm run lint` may require adjustment depending on your local Next.js CLI behavior; `npx tsc --noEmit` is used for type checks.
