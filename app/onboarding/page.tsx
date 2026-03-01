"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Country, State, City } from "country-state-city";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OnboardingData {
  businessName: string;
  ownerName: string;
  industry: string;
  customIndustry: string;
  website: string;
  businessType: string;
  addressCountry: string;
  addressState: string;
  addressCity: string;
  yearsInOperation: string;
  employeeCount: string;
  annualRevenue: string;
  operatingLocations: string;
  supplierCount: string;
  procurementCategories: string[];
  monthlySpend: string;
  sourcingRegions: string[];
  supplyChainConcerns: string[];
  currentRiskMethod: string;
  biggestPainPoint: string;
  primaryGoals: string[];
  howHeard: string;
}

interface Classification {
  business_archetype:      string;
  archetype_description:   string;
  archetype_icon:          string;
  supply_chain_complexity: string;
  complexity_description:  string;
  risk_profile:            string;
  risk_description:        string;
  risk_score:              number;
  recommended_features:    string[];
  key_insight:             string;
  urgency_level:           "low" | "medium" | "high" | "critical";
}

interface ProfileResult {
  id:                      number;
  created_at:              string;
  business_name:           string;
  owner_name:              string;
  industry:                string;
  business_archetype:      string;
  supply_chain_complexity: string;
  risk_profile:            string;
  risk_score:              number;
  classification:          Classification;
}

const INITIAL: OnboardingData = {
  businessName: "", ownerName: "", industry: "", customIndustry: "", website: "", businessType: "",
  addressCountry: "US", addressState: "", addressCity: "",
  yearsInOperation: "", employeeCount: "", annualRevenue: "", operatingLocations: "",
  supplierCount: "", procurementCategories: [], monthlySpend: "", sourcingRegions: [],
  supplyChainConcerns: [], currentRiskMethod: "", biggestPainPoint: "",
  primaryGoals: [], howHeard: "",
};

const ADDRESS_PRIORITY_COUNTRIES = ["US", "GB", "CA", "AU", "DE", "FR", "IN", "SG", "JP", "AE"];

// ── Static option lists ────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Manufacturing", "Retail & E-commerce", "Food & Beverage", "Healthcare & Pharma",
  "Construction & Real Estate", "Technology & Software", "Logistics & Transportation",
  "Apparel & Textile", "Agriculture & Farming", "Automotive", "Energy & Utilities",
  "Professional Services", "Other",
];

const BUSINESS_TYPES = [
  { value: "sole_proprietor", label: "Sole Proprietor", desc: "I run the business alone" },
  { value: "partnership",     label: "Partnership",     desc: "Two or more owners" },
  { value: "llc",             label: "LLC",             desc: "Limited liability company" },
  { value: "corporation",     label: "Corporation",     desc: "C-Corp or S-Corp" },
  { value: "nonprofit",       label: "Non-Profit",      desc: "Mission-driven entity" },
];

const YEARS_OPTIONS = [
  { value: "0-1",  label: "< 1 year",   desc: "Just getting started" },
  { value: "1-3",  label: "1–3 years",  desc: "Early growth stage" },
  { value: "3-10", label: "3–10 years", desc: "Established business" },
  { value: "10+",  label: "10+ years",  desc: "Industry veteran" },
];

const EMPLOYEE_OPTIONS = [
  { value: "solo",   label: "Just me", desc: "Solo operator" },
  { value: "2-10",   label: "2–10",    desc: "Micro team" },
  { value: "11-50",  label: "11–50",   desc: "Small team" },
  { value: "51-200", label: "51–200",  desc: "Growing team" },
  { value: "200+",   label: "200+",    desc: "Mid-market" },
];

const REVENUE_OPTIONS = [
  { value: "under100k", label: "< $100K",      desc: "Pre-revenue or early stage" },
  { value: "100k-500k", label: "$100K – $500K", desc: "Small but growing" },
  { value: "500k-2m",   label: "$500K – $2M",   desc: "Established revenue" },
  { value: "2m-10m",    label: "$2M – $10M",    desc: "Strong mid-market" },
  { value: "10m+",      label: "$10M+",         desc: "Large enterprise" },
];

const LOCATION_OPTIONS = [
  { value: "single",      label: "Single location",   desc: "One office or facility" },
  { value: "multi_city",  label: "Multiple cities",   desc: "Offices in several cities" },
  { value: "multi_state", label: "Multiple states",   desc: "Across states or provinces" },
  { value: "global",      label: "Global operations", desc: "International presence" },
];

const SUPPLIER_COUNT_OPTIONS = [
  { value: "1-5",   label: "1–5",   desc: "Small, tight network" },
  { value: "6-20",  label: "6–20",  desc: "Core supplier base" },
  { value: "21-50", label: "21–50", desc: "Diversified supply chain" },
  { value: "50+",   label: "50+",   desc: "Complex network" },
];

const PROCUREMENT_CATEGORIES = [
  "Raw Materials", "Electronics & Components", "Packaging & Labeling",
  "Logistics & Freight", "IT & Software", "Office Supplies",
  "Manufacturing Equipment", "Food & Ingredients", "Chemical & Industrial",
  "Apparel & Textile", "Healthcare Supplies", "Marketing & Print",
];

const SPEND_OPTIONS = [
  { value: "under10k",  label: "< $10K/mo",      desc: "Light procurement" },
  { value: "10k-50k",   label: "$10K – $50K/mo",  desc: "Moderate spend" },
  { value: "50k-200k",  label: "$50K – $200K/mo", desc: "Significant spend" },
  { value: "200k+",     label: "$200K+/mo",       desc: "High-volume procurement" },
];

const SOURCING_REGIONS = [
  "United States", "Canada", "Mexico", "United Kingdom", "European Union",
  "China", "India", "Southeast Asia", "Japan & South Korea",
  "Middle East", "Latin America", "Africa",
];

const CONCERNS = [
  { value: "reliability",    label: "Supplier reliability",            icon: "⚠" },
  { value: "financial",      label: "Financial stability of suppliers", icon: "📉" },
  { value: "compliance",     label: "Compliance & certifications",      icon: "📋" },
  { value: "geo_risk",       label: "Geographic / political risk",      icon: "🌍" },
  { value: "single_source",  label: "Single-source dependency",         icon: "🔗" },
  { value: "price_volatile", label: "Price volatility",                 icon: "💲" },
  { value: "lead_time",      label: "Long or unpredictable lead times", icon: "⏱" },
  { value: "quality",        label: "Quality control issues",           icon: "🔍" },
];

const RISK_METHODS = [
  { value: "spreadsheet", label: "Manual spreadsheets", desc: "Excel / Google Sheets" },
  { value: "erp",         label: "ERP system",          desc: "SAP, Oracle, NetSuite, etc." },
  { value: "dedicated",   label: "Dedicated tool",      desc: "Risk platform or software" },
  { value: "none",        label: "No formal tracking",  desc: "Gut feel & experience" },
  { value: "other",       label: "Something else",      desc: "Custom or hybrid approach" },
];

const GOALS = [
  { value: "monitor",     label: "Monitor existing suppliers", icon: "👁" },
  { value: "discover",    label: "Discover new vendors",       icon: "🔭" },
  { value: "reduce_risk", label: "Reduce procurement risk",    icon: "🛡" },
  { value: "compliance",  label: "Compliance tracking",        icon: "✅" },
  { value: "cost",        label: "Cost optimisation",          icon: "💰" },
  { value: "backup",      label: "Find backup vendors",        icon: "🔄" },
];

const HOW_HEARD_OPTIONS = [
  "Search engine (Google, Bing)", "Social media", "Colleague or word-of-mouth",
  "Blog or article", "Industry event", "Online ad", "Other",
];

// ── Shared UI components ───────────────────────────────────────────────────────

function OptionCard({ selected, onClick, label, desc, icon }: {
  selected: boolean; onClick: () => void;
  label: string; desc?: string; icon?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
        selected
          ? "bg-gold/10 border-gold/50 ring-1 ring-gold/20"
          : "bg-white/[0.04] border-white/8 hover:border-white/20 hover:bg-white/[0.07]"
      }`}>
      <div className="flex items-center gap-3">
        {icon && <span className="text-lg leading-none shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${selected ? "text-gold" : "text-white/85"}`}>{label}</p>
          {desc && <p className="text-white/35 text-xs mt-0.5">{desc}</p>}
        </div>
        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
          selected ? "border-gold bg-gold" : "border-white/20"
        }`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-navy-900" />}
        </div>
      </div>
    </button>
  );
}

function CheckCard({ selected, onClick, label, icon }: {
  selected: boolean; onClick: () => void; label: string; icon?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all ${
        selected
          ? "bg-gold/10 border-gold/40 ring-1 ring-gold/15"
          : "bg-white/[0.03] border-white/8 hover:border-white/18 hover:bg-white/[0.06]"
      }`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
          selected ? "bg-gold border-gold" : "border-white/25"
        }`}>
          {selected && (
            <svg className="w-2.5 h-2.5 text-navy-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span className={`text-sm font-medium ${selected ? "text-gold" : "text-white/70"}`}>{label}</span>
      </div>
    </button>
  );
}

function TextInput({ label, value, onChange, placeholder, type = "text", optional }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; optional?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
        {label}
        {optional && <span className="text-white/25 font-normal normal-case tracking-normal">— optional</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all" />
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────────

const STEP_LABELS = ["Identity", "Scale", "Supply Chain", "Challenges", "Goals"];

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done   = n < current;
          const active = n === current;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                done ? "bg-gold border-gold text-navy-900"
                : active ? "border-gold text-gold bg-gold/10"
                : "border-white/15 text-white/25"
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : n}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${
                active ? "text-gold" : done ? "text-white/50" : "text-white/20"
              }`}>{label}</span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-gold rounded-full transition-all duration-500"
          style={{ width: `${((current - 1) / (total - 1)) * 100}%` }} />
      </div>
      <p className="text-white/25 text-xs mt-2 text-right">Step {current} of {total}</p>
    </div>
  );
}

// ── Step 1 — Business Identity ─────────────────────────────────────────────────

function Step1({ data, update }: { data: OnboardingData; update: (d: Partial<OnboardingData>) => void }) {
  const allCountries = useMemo(() => {
    const all = Country.getAllCountries();
    const priority = ADDRESS_PRIORITY_COUNTRIES
      .map((code) => all.find((c) => c.isoCode === code))
      .filter(Boolean) as typeof all;
    return [...priority, ...all.filter((c) => !ADDRESS_PRIORITY_COUNTRIES.includes(c.isoCode))];
  }, []);

  const states = useMemo(() => State.getStatesOfCountry(data.addressCountry), [data.addressCountry]);
  const cities = useMemo(
    () => (data.addressState ? City.getCitiesOfState(data.addressCountry, data.addressState) : []),
    [data.addressCountry, data.addressState],
  );

  const chevron = (
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-gold text-xs font-semibold tracking-widest uppercase">Step 1</span>
        <h2 className="font-serif text-3xl font-bold text-white mt-1">Business Identity</h2>
        <p className="text-white/40 text-sm mt-2">Tell us who you are and what your business does.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput label="Business Name" value={data.businessName} onChange={(v) => update({ businessName: v })} placeholder="Acme Supply Co." />
        <TextInput label="Your Name"     value={data.ownerName}    onChange={(v) => update({ ownerName: v })}    placeholder="Jane Smith" />
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Industry</label>
        <div className="relative">
          <select value={data.industry} onChange={(e) => update({ industry: e.target.value })}
            className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 transition-all">
            <option value="" className="bg-navy-900 text-white/40">Select your industry…</option>
            {INDUSTRIES.map((ind) => <option key={ind} value={ind} className="bg-navy-900">{ind}</option>)}
          </select>
          {chevron}
        </div>
        {data.industry === "Other" && (
          <input type="text" value={data.customIndustry} onChange={(e) => update({ customIndustry: e.target.value })}
            placeholder="Describe your industry…"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50 transition-all" />
        )}
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Business Structure</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BUSINESS_TYPES.map((bt) => (
            <OptionCard key={bt.value} selected={data.businessType === bt.value}
              onClick={() => update({ businessType: bt.value })} label={bt.label} desc={bt.desc} />
          ))}
        </div>
      </div>
      <TextInput label="Business Website" value={data.website} onChange={(v) => update({ website: v })}
        placeholder="https://yourbusiness.com" type="url" optional />

      {/* ── Business Address ─────────────────────────────────────────────────── */}
      <div>
        <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
          Business Address
          <span className="text-white/25 font-normal normal-case tracking-normal">— optional</span>
        </label>
        <p className="text-white/25 text-xs mb-3">Saves your location so Vendor Discovery is pre-filled for you.</p>
        <div className="space-y-3">
          {/* Country */}
          <div className="relative">
            <select
              value={data.addressCountry}
              onChange={(e) => update({ addressCountry: e.target.value, addressState: "", addressCity: "" })}
              className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 transition-all">
              {allCountries.map((c) => (
                <option key={c.isoCode} value={c.isoCode} className="bg-navy-900">{c.flag} {c.name}</option>
              ))}
            </select>
            {chevron}
          </div>
          {/* State + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={data.addressState}
                onChange={(e) => update({ addressState: e.target.value, addressCity: "" })}
                disabled={states.length === 0}
                className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <option value="" className="bg-navy-900 text-white/40">
                  {states.length === 0 ? "No states available" : "State / Province…"}
                </option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode} className="bg-navy-900">{s.name}</option>
                ))}
              </select>
              {chevron}
            </div>
            <div className="relative">
              <select
                value={data.addressCity}
                onChange={(e) => update({ addressCity: e.target.value })}
                disabled={!data.addressState || cities.length === 0}
                className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <option value="" className="bg-navy-900 text-white/40">
                  {!data.addressState ? "Select state first" : cities.length === 0 ? "No cities available" : "City…"}
                </option>
                {cities.map((c) => (
                  <option key={`${c.name}-${c.stateCode}`} value={c.name} className="bg-navy-900">{c.name}</option>
                ))}
              </select>
              {chevron}
            </div>
          </div>
          {/* Location preview */}
          {data.addressState && (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gold/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-white/35 text-xs">
                {[data.addressCity, states.find((s) => s.isoCode === data.addressState)?.name, allCountries.find((c) => c.isoCode === data.addressCountry)?.name]
                  .filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 2 — Business Scale ────────────────────────────────────────────────────

function Step2({ data, update }: { data: OnboardingData; update: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-gold text-xs font-semibold tracking-widest uppercase">Step 2</span>
        <h2 className="font-serif text-3xl font-bold text-white mt-1">Business Scale</h2>
        <p className="text-white/40 text-sm mt-2">Help us understand the size and stage of your business.</p>
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Years in Operation</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {YEARS_OPTIONS.map((opt) => (
            <OptionCard key={opt.value} selected={data.yearsInOperation === opt.value}
              onClick={() => update({ yearsInOperation: opt.value })} label={opt.label} desc={opt.desc} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Number of Employees</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {EMPLOYEE_OPTIONS.map((opt) => (
            <OptionCard key={opt.value} selected={data.employeeCount === opt.value}
              onClick={() => update({ employeeCount: opt.value })} label={opt.label} desc={opt.desc} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Annual Revenue</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {REVENUE_OPTIONS.map((opt) => (
            <OptionCard key={opt.value} selected={data.annualRevenue === opt.value}
              onClick={() => update({ annualRevenue: opt.value })} label={opt.label} desc={opt.desc} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Operating Locations</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {LOCATION_OPTIONS.map((opt) => (
            <OptionCard key={opt.value} selected={data.operatingLocations === opt.value}
              onClick={() => update({ operatingLocations: opt.value })} label={opt.label} desc={opt.desc} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 3 — Supply Chain Profile ─────────────────────────────────────────────

function Step3({ data, update }: { data: OnboardingData; update: (d: Partial<OnboardingData>) => void }) {
  const toggleCategory = (cat: string) =>
    update({ procurementCategories: data.procurementCategories.includes(cat)
      ? data.procurementCategories.filter((c) => c !== cat)
      : [...data.procurementCategories, cat] });

  const toggleRegion = (r: string) =>
    update({ sourcingRegions: data.sourcingRegions.includes(r)
      ? data.sourcingRegions.filter((x) => x !== r)
      : [...data.sourcingRegions, r] });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-gold text-xs font-semibold tracking-widest uppercase">Step 3</span>
        <h2 className="font-serif text-3xl font-bold text-white mt-1">Supply Chain Profile</h2>
        <p className="text-white/40 text-sm mt-2">Tell us about your supplier network and procurement setup.</p>
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Active Supplier Count</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SUPPLIER_COUNT_OPTIONS.map((opt) => (
            <OptionCard key={opt.value} selected={data.supplierCount === opt.value}
              onClick={() => update({ supplierCount: opt.value })} label={opt.label} desc={opt.desc} />
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
          Procurement Categories
          <span className="text-white/25 font-normal normal-case tracking-normal">— select all that apply</span>
        </label>
        {data.procurementCategories.length > 0 && <p className="text-gold/70 text-xs mb-2">{data.procurementCategories.length} selected</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROCUREMENT_CATEGORIES.map((cat) => (
            <CheckCard key={cat} label={cat} selected={data.procurementCategories.includes(cat)} onClick={() => toggleCategory(cat)} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Monthly Procurement Spend</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SPEND_OPTIONS.map((opt) => (
            <OptionCard key={opt.value} selected={data.monthlySpend === opt.value}
              onClick={() => update({ monthlySpend: opt.value })} label={opt.label} desc={opt.desc} />
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
          Sourcing Regions
          <span className="text-white/25 font-normal normal-case tracking-normal">— where do you source from?</span>
        </label>
        {data.sourcingRegions.length > 0 && <p className="text-gold/70 text-xs mb-2">{data.sourcingRegions.length} selected</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SOURCING_REGIONS.map((r) => (
            <CheckCard key={r} label={r} selected={data.sourcingRegions.includes(r)} onClick={() => toggleRegion(r)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 4 — Risk & Challenges ─────────────────────────────────────────────────

function Step4({ data, update }: { data: OnboardingData; update: (d: Partial<OnboardingData>) => void }) {
  const toggleConcern = (val: string) =>
    update({ supplyChainConcerns: data.supplyChainConcerns.includes(val)
      ? data.supplyChainConcerns.filter((c) => c !== val)
      : [...data.supplyChainConcerns, val] });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-gold text-xs font-semibold tracking-widest uppercase">Step 4</span>
        <h2 className="font-serif text-3xl font-bold text-white mt-1">Risk & Challenges</h2>
        <p className="text-white/40 text-sm mt-2">Understanding your biggest pain points helps us tailor your experience.</p>
      </div>
      <div>
        <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
          Top Supply Chain Concerns
          <span className="text-white/25 font-normal normal-case tracking-normal">— select all that apply</span>
        </label>
        {data.supplyChainConcerns.length > 0 && <p className="text-gold/70 text-xs mb-2">{data.supplyChainConcerns.length} concern{data.supplyChainConcerns.length !== 1 ? "s" : ""} selected</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CONCERNS.map((c) => (
            <CheckCard key={c.value} label={c.label} icon={c.icon}
              selected={data.supplyChainConcerns.includes(c.value)} onClick={() => toggleConcern(c.value)} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">How Do You Currently Track Supplier Risk?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {RISK_METHODS.map((m) => (
            <OptionCard key={m.value} selected={data.currentRiskMethod === m.value}
              onClick={() => update({ currentRiskMethod: m.value })} label={m.label} desc={m.desc} />
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
          Describe Your Biggest Pain Point
          <span className="text-white/25 font-normal normal-case tracking-normal">— optional</span>
        </label>
        <textarea value={data.biggestPainPoint} onChange={(e) => update({ biggestPainPoint: e.target.value })}
          rows={3} placeholder="e.g. I have no visibility into whether my key suppliers are financially healthy before it's too late…"
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50 transition-all resize-none leading-relaxed" />
      </div>
    </div>
  );
}

// ── Step 5 — Goals ─────────────────────────────────────────────────────────────

function Step5({ data, update }: { data: OnboardingData; update: (d: Partial<OnboardingData>) => void }) {
  const toggleGoal = (val: string) =>
    update({ primaryGoals: data.primaryGoals.includes(val)
      ? data.primaryGoals.filter((g) => g !== val)
      : [...data.primaryGoals, val] });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-gold text-xs font-semibold tracking-widest uppercase">Step 5</span>
        <h2 className="font-serif text-3xl font-bold text-white mt-1">Your Goals</h2>
        <p className="text-white/40 text-sm mt-2">What do you most want to achieve with VendorIQ?</p>
      </div>
      <div>
        <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
          Primary Goals
          <span className="text-white/25 font-normal normal-case tracking-normal">— select all that matter</span>
        </label>
        {data.primaryGoals.length > 0 && <p className="text-gold/70 text-xs mb-2">{data.primaryGoals.length} goal{data.primaryGoals.length !== 1 ? "s" : ""} selected</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {GOALS.map((g) => (
            <CheckCard key={g.value} label={g.label} icon={g.icon}
              selected={data.primaryGoals.includes(g.value)} onClick={() => toggleGoal(g.value)} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">How Did You Hear About VendorIQ?</label>
        <div className="relative">
          <select value={data.howHeard} onChange={(e) => update({ howHeard: e.target.value })}
            className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 transition-all">
            <option value="" className="bg-navy-900 text-white/40">Select an option…</option>
            {HOW_HEARD_OPTIONS.map((opt) => <option key={opt} value={opt} className="bg-navy-900">{opt}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Completion / result screen ─────────────────────────────────────────────────

const RISK_COLOURS = {
  Low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Moderate: "text-yellow-400  bg-yellow-500/10  border-yellow-500/30",
  High:     "text-orange-400  bg-orange-500/10  border-orange-500/30",
  Critical: "text-red-400     bg-red-500/10     border-red-500/30",
} as const;

const COMPLEXITY_COLOURS: Record<string, string> = {
  Minimal:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Basic:      "text-gold        bg-gold/10        border-gold/30",
  Moderate:   "text-yellow-400  bg-yellow-500/10  border-yellow-500/30",
  Complex:    "text-orange-400  bg-orange-500/10  border-orange-500/30",
  Enterprise: "text-red-400     bg-red-500/10     border-red-500/30",
};

const RECOMMENDED_LINKS = [
  { href: "/vendors/discover", label: "Discover Vendors", icon: "🔭", desc: "Find real suppliers near you" },
  { href: "/audit",            label: "Run a Risk Audit", icon: "🛡", desc: "AI scorecard for your suppliers" },
  { href: "/compare",          label: "Compare Vendors",  icon: "⚖", desc: "Side-by-side analysis" },
] as const;

function CompletionScreen({ data, profile }: { data: OnboardingData; profile: ProfileResult }) {
  const c   = profile.classification;
  const firstName = data.ownerName.split(" ")[0] || "there";
  const riskCls   = RISK_COLOURS[c.risk_profile as keyof typeof RISK_COLOURS]       ?? RISK_COLOURS.Moderate;
  const cmpxCls   = COMPLEXITY_COLOURS[c.supply_chain_complexity] ?? COMPLEXITY_COLOURS.Moderate;

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center glow-gold">
              <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full animate-ping bg-gold/10" style={{ animationDuration: "2.5s" }} />
          </div>
        </div>
        <h2 className="font-serif text-4xl font-bold text-white">Welcome aboard, {firstName}!</h2>
        <p className="text-white/40 text-base mt-2">
          Profile saved · ID <span className="text-gold/70 font-mono">#{profile.id}</span>
        </p>
      </div>

      {/* ── Business archetype card ─────────────────────────────────────────── */}
      <div className="glass-gold border-gold rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-3xl shrink-0">
            {c.archetype_icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Business Type</p>
            <h3 className="font-serif text-2xl font-bold text-gold">{c.business_archetype}</h3>
            <p className="text-white/55 text-sm leading-relaxed mt-2">{c.archetype_description}</p>
          </div>
        </div>
      </div>

      {/* ── Complexity + Risk side by side ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Supply chain complexity */}
        <div className="glass border border-white/8 rounded-2xl p-5">
          <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-3">Supply Chain Complexity</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold mb-3 ${cmpxCls}`}>
            {c.supply_chain_complexity}
          </div>
          <p className="text-white/45 text-xs leading-relaxed">{c.complexity_description}</p>
        </div>

        {/* Risk profile */}
        <div className="glass border border-white/8 rounded-2xl p-5">
          <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-3">Risk Profile</p>
          <div className="flex items-center gap-3 mb-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${riskCls}`}>
              {c.risk_profile}
            </div>
            <span className="text-white/30 text-xs font-mono">{c.risk_score}/100</span>
          </div>
          {/* Mini risk bar */}
          <div className="h-1.5 rounded-full bg-white/5 mb-3">
            <div className={`h-full rounded-full transition-all ${
              c.risk_score >= 75 ? "bg-red-400" : c.risk_score >= 50 ? "bg-orange-400" : c.risk_score >= 25 ? "bg-yellow-400" : "bg-emerald-400"
            }`} style={{ width: `${c.risk_score}%` }} />
          </div>
          <p className="text-white/45 text-xs leading-relaxed">{c.risk_description}</p>
        </div>
      </div>

      {/* ── AI key insight ─────────────────────────────────────────────────── */}
      <div className="glass border border-white/8 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">✦</span>
          <div>
            <p className="text-white font-semibold text-sm mb-1">Key Insight</p>
            <p className="text-white/50 text-sm leading-relaxed">{c.key_insight}</p>
          </div>
        </div>
      </div>

      {/* ── Recommended features ───────────────────────────────────────────── */}
      {c.recommended_features.length > 0 && (
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Recommended for your profile</p>
          <div className="space-y-2">
            {c.recommended_features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 glass border border-white/[0.06] rounded-xl">
                <div className="w-5 h-5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-white/60 text-sm">{feat}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Next steps ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Get started</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RECOMMENDED_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className="glass border border-white/8 hover:border-gold/30 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-gold/5 group text-center">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-xl">
                {link.icon}
              </div>
              <p className="text-white text-sm font-semibold group-hover:text-gold transition-colors">{link.label}</p>
              <p className="text-white/30 text-xs">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-center text-white/20 text-sm">
        <Link href="/" className="hover:text-white/50 transition-colors">← Back to home</Link>
      </p>
    </div>
  );
}

// ── Validation ─────────────────────────────────────────────────────────────────

function validateStep(step: number, data: OnboardingData): string | null {
  if (step === 1) {
    if (!data.businessName.trim()) return "Please enter your business name.";
    if (!data.ownerName.trim())    return "Please enter your name.";
    if (!data.industry)            return "Please select an industry.";
    if (data.industry === "Other" && !data.customIndustry.trim()) return "Please describe your industry.";
    if (!data.businessType)        return "Please select your business structure.";
  }
  if (step === 2) {
    if (!data.yearsInOperation)    return "Please select how long you've been in operation.";
    if (!data.employeeCount)       return "Please select your team size.";
    if (!data.annualRevenue)       return "Please select your annual revenue range.";
    if (!data.operatingLocations)  return "Please select your operating locations.";
  }
  if (step === 3) {
    if (!data.supplierCount)                        return "Please select your approximate supplier count.";
    if (data.procurementCategories.length === 0)    return "Please select at least one procurement category.";
    if (!data.monthlySpend)                         return "Please select your monthly procurement spend.";
    if (data.sourcingRegions.length === 0)          return "Please select at least one sourcing region.";
  }
  if (step === 4) {
    if (data.supplyChainConcerns.length === 0) return "Please select at least one supply chain concern.";
    if (!data.currentRiskMethod)               return "Please tell us how you currently track supplier risk.";
  }
  if (step === 5) {
    if (data.primaryGoals.length === 0) return "Please select at least one goal.";
  }
  return null;
}

// ── Main page ──────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const [step,          setStep]          = useState(1);
  const [data,          setData]          = useState<OnboardingData>(INITIAL);
  const [error,         setError]         = useState<string | null>(null);
  const [submitting,    setSubmitting]     = useState(false);
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null);

  function update(patch: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...patch }));
    setError(null);
  }

  async function handleNext() {
    const err = validateStep(step, data);
    if (err) { setError(err); return; }
    setError(null);

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Final step — submit to Python backend via Next.js proxy
    setSubmitting(true);
    try {
      const res  = await fetch("/api/onboarding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json() as ProfileResult & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to save your profile.");
      setProfileResult(json);
      // Persist address so Vendor Discovery is pre-filled
      if (data.addressState) {
        localStorage.setItem(
          "vendoriq_business_address",
          JSON.stringify({ countryCode: data.addressCountry, stateCode: data.addressState, cityName: data.addressCity }),
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    setError(null);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Completion screen ────────────────────────────────────────────────────────
  if (profileResult) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <CompletionScreen data={data} profile={profileResult} />
        </div>
      </main>
    );
  }

  // ── Multi-step form ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass border border-white/8 rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Business Profile Setup</span>
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white">
            Let's get to know your business
          </h1>
          <p className="text-white/40 text-lg mt-3 max-w-md mx-auto">
            5 quick steps to personalise VendorIQ for your supply chain needs.
          </p>
        </div>

        {/* Main card */}
        <div className="glass border border-white/8 rounded-3xl p-8">
          <ProgressBar current={step} total={TOTAL_STEPS} />

          {step === 1 && <Step1 data={data} update={update} />}
          {step === 2 && <Step2 data={data} update={update} />}
          {step === 3 && <Step3 data={data} update={update} />}
          {step === 4 && <Step4 data={data} update={update} />}
          {step === 5 && <Step5 data={data} update={update} />}

          {/* Validation / submission error */}
          {error && (
            <div className="mt-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            <button type="button" onClick={handleBack} disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 glass border border-white/10 rounded-xl text-sm text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-0 disabled:pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button type="button" onClick={handleNext} disabled={submitting}
              className="flex items-center gap-2 px-7 py-2.5 bg-gold text-navy-900 rounded-xl font-bold text-sm hover:bg-gold-300 transition-all glow-gold-sm disabled:opacity-70 disabled:cursor-not-allowed">
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-navy-900/30 border-t-navy-900 animate-spin" />
                  Saving profile…
                </>
              ) : step === TOTAL_STEPS ? (
                <>
                  Complete Setup
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              ) : (
                <>
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-5 text-white/20 text-sm">
          Already set up?{" "}
          <Link href="/vendors/discover" className="text-white/40 hover:text-gold transition-colors underline underline-offset-2">
            Skip to Vendor Discovery
          </Link>
        </p>
      </div>
    </main>
  );
}
