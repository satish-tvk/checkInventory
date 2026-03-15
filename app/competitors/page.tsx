"use client";

import { useEffect, useMemo, useState } from "react";
import { City, Country, State } from "country-state-city";
import type { CompetitorAnalysisResult } from "@/lib/mistralCompetitorAgent";
import { useAuth } from "@/contexts/AuthContext";

const PRIORITY_COUNTRIES = ["US", "GB", "CA", "AU", "DE", "FR", "IN", "SG", "JP", "AE"];

const INDUSTRY_PRESETS = [
  "Retail & E-commerce",
  "Food & Beverage",
  "Logistics",
  "Technology Services",
  "Manufacturing",
  "Healthcare",
  "Construction",
  "Automotive",
];

const SELECT_CLS =
  "w-full appearance-none px-4 py-2.5 rounded-xl text-ink text-sm focus:outline-none transition-all disabled:opacity-40 " +
  "bg-surface-1 border border-ink/[0.10] focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-xl text-ink placeholder-ink/25 text-sm focus:outline-none transition-all " +
  "bg-surface-1 border border-ink/[0.10] focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

function scoreColor(score: number) {
  if (score >= 75) return "text-teal-700 border-teal-200 bg-teal-50";
  if (score >= 45) return "text-amber-700 border-amber-200 bg-amber-50";
  return "text-rose-600 border-rose-200 bg-rose-50";
}

export default function CompetitorAnalysisPage() {
  const { profile } = useAuth();
  const [businessName,    setBusinessName]    = useState("");
  const [industry,        setIndustry]        = useState("");
  const [countryCode,     setCountryCode]     = useState("US");
  const [stateCode,       setStateCode]       = useState("");
  const [cityName,        setCityName]        = useState("");
  const [locationOverride,setLocationOverride]= useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [result,   setResult]   = useState<CompetitorAnalysisResult | null>(null);

  const countries = useMemo(() => {
    const all = Country.getAllCountries();
    const priority = PRIORITY_COUNTRIES.map((c) => all.find((x) => x.isoCode === c)).filter(Boolean) as typeof all;
    return [...priority, ...all.filter((c) => !PRIORITY_COUNTRIES.includes(c.isoCode))];
  }, []);

  const states = useMemo(() => State.getStatesOfCountry(countryCode), [countryCode]);
  const cities = useMemo(
    () => (stateCode ? City.getCitiesOfState(countryCode, stateCode) : []),
    [countryCode, stateCode],
  );

  const locationString = useMemo(() => {
    if (locationOverride.trim()) return locationOverride.trim();
    const country   = Country.getCountryByCode(countryCode)?.name ?? countryCode;
    const stateName = states.find((s) => s.isoCode === stateCode)?.name ?? "";
    return [cityName, stateName, country].filter(Boolean).join(", ");
  }, [locationOverride, countryCode, stateCode, cityName, states]);

  const canSubmit =
    businessName.trim().length > 0 &&
    industry.trim().length > 0 &&
    stateCode.trim().length > 0;

  useEffect(() => {
    if (profile?.business_name) setBusinessName(profile.business_name);
    if (profile?.industry)      setIndustry(profile.industry);
  }, [profile]);

  useEffect(() => {
    const raw = localStorage.getItem("onestopsmb_business_address");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { countryCode?: string; stateCode?: string; cityName?: string };
      if (parsed.countryCode) setCountryCode(parsed.countryCode);
      if (parsed.stateCode)   setStateCode(parsed.stateCode);
      if (parsed.cityName)    setCityName(parsed.cityName);
    } catch { /* ignore */ }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res  = await fetch("/api/competitors/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          businessName: businessName.trim(),
          industry:     industry.trim(),
          location:     locationString.trim(),
        }),
      });
      const data = (await res.json()) as CompetitorAnalysisResult & { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to analyze competitors."); return; }
      setResult(data);
    } catch {
      setError("Network error while running competitor analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-1 pt-[60px]">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-ink/[0.07] px-6 py-14" style={{ boxShadow: "0 1px 0 rgba(19,16,58,0.06)" }}>
        <div className="max-w-6xl mx-auto">
          <span className="tag-brand mb-5 inline-flex">Competitor Intelligence</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-semibold text-ink leading-tight mb-4">
            Competitor Analysis
          </h1>
          <p className="text-ink/65 text-base max-w-xl leading-relaxed">
            Analyze businesses competing with you in your local market — powered by live web intelligence.
          </p>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-7 bg-white border border-ink/[0.07] shadow-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-ink/70 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                  Business Name
                </label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Supply Co."
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="block text-ink/70 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                  Industry
                </label>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Retail & E-commerce"
                  className={INPUT_CLS}
                />
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {INDUSTRY_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setIndustry(p)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                        industry === p
                          ? "text-brand-700 bg-brand-100 border-brand-300"
                          : "text-ink/40 bg-surface-1 border-ink/[0.10] hover:text-ink/70 hover:border-ink/20"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-ink/[0.07] my-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-ink/70 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                  Country
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => { setCountryCode(e.target.value); setStateCode(""); setCityName(""); }}
                  className={SELECT_CLS}
                >
                  {countries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink/70 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                  State / Province
                </label>
                <select
                  value={stateCode}
                  onChange={(e) => { setStateCode(e.target.value); setCityName(""); }}
                  disabled={states.length === 0}
                  className={SELECT_CLS}
                >
                  <option value="">
                    {states.length ? "Select state…" : "No states available"}
                  </option>
                  {states.map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink/70 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                  City <span className="normal-case font-normal tracking-normal text-ink/30">(optional)</span>
                </label>
                <select
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  disabled={!stateCode || cities.length === 0}
                  className={SELECT_CLS}
                >
                  <option value="">
                    {!stateCode ? "Select state first" : cities.length ? "Select city…" : "No cities available"}
                  </option>
                  {cities.map((c) => (
                    <option key={`${c.name}-${c.stateCode}`} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-ink/70 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                Location Override <span className="normal-case font-normal tracking-normal text-ink/30">(optional)</span>
              </label>
              <input
                value={locationOverride}
                onChange={(e) => setLocationOverride(e.target.value)}
                placeholder="e.g. Downtown Austin, TX"
                className={INPUT_CLS}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-ink/60 text-xs">Searching in:</span>
              <span className="text-brand-700 text-sm font-semibold">{locationString || "Set a location above"}</span>
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="mt-6 w-full py-3 rounded-xl text-black font-semibold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: canSubmit && !loading
                  ? "linear-gradient(135deg, #0D5CFF, #0046D6)"
                  : "rgba(13,92,255,0.5)",
                boxShadow: canSubmit && !loading ? "0 4px 20px rgba(13,92,255,0.35)" : "none",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analyzing local competitors…
                </>
              ) : (
                "Run Competitor Analysis"
              )}
            </button>
          </form>

          {/* ── Error ── */}
          {error && (
            <div className="px-5 py-4 rounded-2xl bg-rose-50 border border-rose-200">
              <p className="text-rose-700 font-semibold text-sm">Analysis failed</p>
              <p className="text-rose-500 text-sm mt-0.5">{error}</p>
            </div>
          )}

          {/* ── Results ── */}
          {result && (
            <div className="space-y-5">
              {/* Market summary */}
              <div className="p-6 rounded-2xl border border-brand-200 bg-brand-50 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <p className="text-brand-700 text-[10px] font-semibold uppercase tracking-[0.18em]">
                    Market Summary
                  </p>
                </div>
                <p className="text-ink/80 text-sm leading-relaxed">{result.market_summary}</p>
                <p className="text-ink/55 text-xs mt-4">
                  {result.industry} · {result.location} · {new Date(result.generated_at).toLocaleString()}
                </p>
              </div>

              {/* Threats & Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 shadow-card">
                  <p className="text-rose-700 text-[10px] font-semibold uppercase tracking-[0.18em] mb-4">
                    Competitive Threats
                  </p>
                  <div className="space-y-2">
                    {result.threats.length === 0 && <p className="text-ink/35 text-sm">No major threats identified.</p>}
                    {result.threats.map((t) => (
                      <p key={t} className="text-ink/60 text-sm flex gap-2">
                        <span className="text-rose-400 shrink-0 font-bold">—</span>{t}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-2xl border border-teal-200 bg-teal-50 shadow-card">
                  <p className="text-teal-700 text-[10px] font-semibold uppercase tracking-[0.18em] mb-4">
                    Opportunities
                  </p>
                  <div className="space-y-2">
                    {result.opportunities.length === 0 && <p className="text-ink/35 text-sm">No opportunities identified.</p>}
                    {result.opportunities.map((o) => (
                      <p key={o} className="text-ink/60 text-sm flex gap-2">
                        <span className="text-teal-500 shrink-0 font-bold">+</span>{o}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Competitors */}
              <div>
                <h2 className="font-serif text-2xl text-ink mb-4">Local Competitors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {result.competitors.map((c) => (
                    <article
                      key={`${c.name}-${c.location}`}
                      className="p-5 rounded-2xl border border-ink/[0.07] bg-white shadow-card hover:shadow-card-lg transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-ink font-semibold text-sm">{c.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs border shrink-0 font-semibold ${scoreColor(c.confidence)}`}>
                          {c.confidence}%
                        </span>
                      </div>
                      <p className="text-ink/55 text-xs mb-3">{c.location}</p>
                      <p className="text-ink/75 text-sm leading-relaxed mb-2">{c.why_competitor}</p>
                      <p className="text-ink/60 text-xs leading-relaxed mb-4">
                        <span className="text-ink/80 font-medium">Differentiator:</span> {c.differentiator}
                      </p>
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 text-xs hover:text-brand-700 transition-colors font-medium"
                        >
                          {c.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <p className="text-ink/25 text-xs">Website not found</p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
