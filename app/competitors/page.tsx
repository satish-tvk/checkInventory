"use client";

import { useEffect, useMemo, useState } from "react";
import { City, Country, State } from "country-state-city";
import type { CompetitorAnalysisResult } from "@/lib/mistralCompetitorAgent";

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

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (score >= 45) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  return "text-red-400 border-red-500/30 bg-red-500/10";
}

export default function CompetitorAnalysisPage() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [locationOverride, setLocationOverride] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompetitorAnalysisResult | null>(null);

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
    const country = Country.getCountryByCode(countryCode)?.name ?? countryCode;
    const stateName = states.find((s) => s.isoCode === stateCode)?.name ?? "";
    return [cityName, stateName, country].filter(Boolean).join(", ");
  }, [locationOverride, countryCode, stateCode, cityName, states]);

  const canSubmit =
    businessName.trim().length > 0 &&
    industry.trim().length > 0 &&
    stateCode.trim().length > 0 &&
    locationString.trim().length > 0;

  useEffect(() => {
    const raw = localStorage.getItem("vendoriq_business_address");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        countryCode?: string;
        stateCode?: string;
        cityName?: string;
      };
      if (parsed.countryCode) setCountryCode(parsed.countryCode);
      if (parsed.stateCode) setStateCode(parsed.stateCode);
      if (parsed.cityName) setCityName(parsed.cityName);
    } catch {
      // Ignore malformed localStorage
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          industry: industry.trim(),
          location: locationString.trim(),
        }),
      });
      const data = (await res.json()) as CompetitorAnalysisResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to analyze competitors.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error while running competitor analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Mistral Agent + Tavily</span>
          <h1 className="font-serif text-5xl font-bold text-white mt-2">Competitor Analysis</h1>
          <p className="text-white/45 text-lg mt-3 max-w-2xl mx-auto">
            Analyze businesses competing with you in your local market.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-gold border-gold rounded-3xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                Business Name
              </label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme Supply Co."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                Industry
              </label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Retail & E-commerce"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {INDUSTRY_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setIndustry(p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      industry === p
                        ? "bg-gold/15 border-gold/40 text-gold"
                        : "bg-white/[0.04] border-white/8 text-white/40 hover:text-white/70 hover:border-white/20"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                Country
              </label>
              <select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setStateCode("");
                  setCityName("");
                }}
                className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50"
              >
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode} className="bg-navy-900">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                State / Province
              </label>
              <select
                value={stateCode}
                onChange={(e) => {
                  setStateCode(e.target.value);
                  setCityName("");
                }}
                disabled={states.length === 0}
                className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm disabled:opacity-40 focus:outline-none focus:border-gold/50"
              >
                <option value="" className="bg-navy-900 text-white/40">
                  {states.length ? "Select state..." : "No states available"}
                </option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode} className="bg-navy-900">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                City (Optional)
              </label>
              <select
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                disabled={!stateCode || cities.length === 0}
                className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm disabled:opacity-40 focus:outline-none focus:border-gold/50"
              >
                <option value="" className="bg-navy-900 text-white/40">
                  {!stateCode ? "Select state first" : cities.length ? "Select city (optional)..." : "No cities available"}
                </option>
                {cities.map((c) => (
                  <option key={`${c.name}-${c.stateCode}`} value={c.name} className="bg-navy-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
              Location Override (Optional)
            </label>
            <input
              value={locationOverride}
              onChange={(e) => setLocationOverride(e.target.value)}
              placeholder="Example: Downtown Austin, TX"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50"
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-white/35 text-xs">Searching in:</span>
            <span className="text-gold/80 text-sm">{locationString || "Set location first"}</span>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="mt-6 w-full py-3.5 rounded-xl bg-gold text-navy-900 font-bold text-sm hover:bg-gold-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing local competitors..." : "Run Competitor Analysis"}
          </button>
        </form>

        {error && (
          <div className="px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-8">
            <p className="text-red-400 font-semibold text-sm">Analysis Failed</p>
            <p className="text-red-300/70 text-sm mt-0.5">{error}</p>
          </div>
        )}

        {result && (
          <section className="space-y-6">
            <div className="glass border border-white/8 rounded-2xl p-6">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Market Summary</p>
              <p className="text-white/70 text-sm leading-relaxed">{result.market_summary}</p>
              <p className="text-white/20 text-xs mt-4">
                {result.industry} in {result.location} · {new Date(result.generated_at).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass border border-white/8 rounded-2xl p-5">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Competitive Threats</p>
                <div className="space-y-2">
                  {result.threats.length === 0 && <p className="text-white/30 text-sm">No major threats identified.</p>}
                  {result.threats.map((t) => (
                    <p key={t} className="text-white/70 text-sm">• {t}</p>
                  ))}
                </div>
              </div>

              <div className="glass border border-white/8 rounded-2xl p-5">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Opportunities</p>
                <div className="space-y-2">
                  {result.opportunities.length === 0 && <p className="text-white/30 text-sm">No opportunities identified.</p>}
                  {result.opportunities.map((o) => (
                    <p key={o} className="text-white/70 text-sm">• {o}</p>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-white mb-4">Local Competitors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {result.competitors.map((c) => (
                  <article key={`${c.name}-${c.location}`} className="glass border border-white/8 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-semibold text-sm">{c.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${scoreColor(c.confidence)}`}>
                        {c.confidence}%
                      </span>
                    </div>
                    <p className="text-white/35 text-xs mb-3">{c.location}</p>
                    <p className="text-white/65 text-sm leading-relaxed mb-3">{c.why_competitor}</p>
                    <p className="text-white/45 text-xs leading-relaxed mb-4">
                      <span className="text-white/65">Differentiator:</span> {c.differentiator}
                    </p>
                    {c.website ? (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold text-xs hover:underline"
                      >
                        {c.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <p className="text-white/20 text-xs">Website not found</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
