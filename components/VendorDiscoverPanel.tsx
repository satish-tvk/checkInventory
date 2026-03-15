"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { useAuth } from "@/contexts/AuthContext";
import type { DiscoveryResult, DiscoveredVendor } from "@/lib/mistralVendorAgent";
import type { VendorComparisonReport, VendorScorecard, RiskColor } from "@/lib/types";

// ── Constants ─────────────────────────────────────────────────────────────────
const PRIORITY_COUNTRIES = ["US", "GB", "CA", "AU", "DE", "FR", "IN", "SG", "JP", "AE"];

const CATEGORY_PRESETS = [
  "Electronics supplier", "Raw materials", "Logistics & freight", "IT services",
  "Packaging manufacturer", "Chemical supplier", "Food & beverage distributor", "Textile manufacturer",
];

const MAX_SELECTION = 3;

// ── Shared helpers ─────────────────────────────────────────────────────────────

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-ink/8">
        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
      </div>
      <span className="text-gold font-semibold text-sm w-10 text-right">{value}</span>
    </div>
  );
}

function WinnerBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold text-navy-900 text-[10px] font-bold whitespace-nowrap">
      ★ {label}
    </span>
  );
}

const riskColor = (color: RiskColor) =>
  color === "GREEN" ? "text-gold" : color === "YELLOW" ? "text-ink-muted" : "text-ink-faint";

// ── Discovery sub-components ──────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-gold" : "text-ink/15"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, { label: string; cls: string }> = {
    OPERATIONAL:        { label: "Open",        cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
    CLOSED_TEMPORARILY: { label: "Temp Closed", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25" },
    CLOSED_PERMANENTLY: { label: "Closed",      cls: "text-red-400 bg-red-500/10 border-red-500/25" },
  };
  const s = map[status] ?? { label: status, cls: "text-ink-faint bg-ink/8 border-ink/10" };
  return <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function SelectBox({ label, value, onChange, disabled, children, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  disabled?: boolean; children: React.ReactNode; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-ink-muted text-xs font-semibold uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          className="w-full appearance-none px-4 py-3 rounded-xl bg-white border border-ink/10 text-ink text-sm focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ── Vendor Card (discovery grid) ──────────────────────────────────────────────

function VendorCard({ vendor, selected, onToggle, selectionFull, selectionIndex }: {
  vendor: DiscoveredVendor; selected: boolean; onToggle: () => void;
  selectionFull: boolean; selectionIndex: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const canSelect = selected || !selectionFull;

  return (
    <div className={`relative glass border rounded-2xl p-5 transition-all ${
      selected ? "border-gold/50 ring-1 ring-gold/20 shadow-[0_0_20px_rgba(198,167,94,0.08)]"
      : canSelect ? "border-ink/10 hover:border-ink/20"
      : "border-ink/8 opacity-50"
    }`}>
      {selected && (
        <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-gold text-navy-900 text-xs font-bold flex items-center justify-center shadow-lg z-10">
          {selectionIndex}
        </div>
      )}
      <div className="flex items-start gap-4">
        <button onClick={onToggle} disabled={!canSelect}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            selected ? "bg-gold border-gold"
            : canSelect ? "border-ink/20 hover:border-gold/60 bg-transparent"
            : "border-ink/10 bg-transparent cursor-not-allowed"
          }`}>
          {selected && (
            <svg className="w-3 h-3 text-navy-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
          <span className="font-serif text-gold text-lg font-bold">{vendor.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-ink font-semibold text-sm leading-snug">{vendor.name}</h3>
            <StatusBadge status={vendor.business_status} />
          </div>
          <p className="text-ink-faint text-xs mb-2 leading-relaxed">{vendor.address}</p>
          {vendor.rating && <RatingStars rating={vendor.rating} />}
          <p className="text-ink/55 text-xs mt-2.5 leading-relaxed italic">{vendor.summary}</p>
          <div className="mt-3">
            <span className="px-2.5 py-1 rounded-full bg-gold/8 border border-gold/20 text-gold text-xs font-medium">{vendor.category}</span>
          </div>
        </div>
      </div>

      <button onClick={() => setExpanded((p) => !p)}
        className="mt-4 w-full flex items-center justify-between text-ink-faint text-xs hover:text-ink-muted transition-colors pt-4 border-t border-ink/10">
        <span>{expanded ? "Hide details" : "Show contact & hours"}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-2.5">
          {vendor.phone && (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gold/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-ink/55 text-xs">{vendor.phone}</span>
            </div>
          )}
          {vendor.website && (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gold/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
              </svg>
              <a href={vendor.website} target="_blank" rel="noopener noreferrer"
                className="text-gold text-xs hover:underline truncate max-w-xs">
                {vendor.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {vendor.opening_hours && vendor.opening_hours.length > 0 && (
            <div className="mt-2">
              <p className="text-ink-subtle text-xs uppercase tracking-widest mb-1.5">Hours</p>
              {vendor.opening_hours.slice(0, 4).map((h) => (
                <p key={h} className="text-ink-faint text-xs">{h}</p>
              ))}
            </div>
          )}
          <a href={vendor.maps_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-1 text-xs text-ink-faint hover:text-gold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

// ── Audit / Compare Panel ──────────────────────────────────────────────────────

function AuditPanel({ report, vendors, onClose }: {
  report: VendorComparisonReport;
  vendors: DiscoveredVendor[];
  onClose: () => void;
}) {
  const cols = vendors.length === 2 ? "grid-cols-2" : "grid-cols-3";
  const tableCols = vendors.length === 2 ? "grid-cols-3" : "grid-cols-4";

  function scorecard(v: DiscoveredVendor): VendorScorecard | undefined {
    return report.scorecards.find((s) => s.name === v.name);
  }

  const metrics: Array<{
    label: string;
    desc: string;
    getValue: (v: DiscoveredVendor) => string | number;
    getBar:   (v: DiscoveredVendor) => number;
    winnerId: string;
    winnerLabel: string;
  }> = [
    {
      label: "Risk Score", desc: "Lower is better",
      getValue: (v) => scorecard(v)?.risk_score ?? 0,
      getBar:   (v) => 100 - (scorecard(v)?.risk_score ?? 0),
      winnerId: vendors.reduce((best, v) =>
        (scorecard(v)?.risk_score ?? 100) <= (scorecard(best)?.risk_score ?? 100) ? v : best
      ).place_id,
      winnerLabel: "Lowest Risk",
    },
    {
      label: "Reliability", desc: "Higher is better",
      getValue: (v) => `${scorecard(v)?.reliability ?? 0}%`,
      getBar:   (v) => scorecard(v)?.reliability ?? 0,
      winnerId: vendors.reduce((best, v) =>
        (scorecard(v)?.reliability ?? 0) >= (scorecard(best)?.reliability ?? 0) ? v : best
      ).place_id,
      winnerLabel: "Most Reliable",
    },
    {
      label: "Financial Stability", desc: "Higher is better",
      getValue: (v) => `${scorecard(v)?.financial_stability ?? 0}%`,
      getBar:   (v) => scorecard(v)?.financial_stability ?? 0,
      winnerId: vendors.reduce((best, v) =>
        (scorecard(v)?.financial_stability ?? 0) >= (scorecard(best)?.financial_stability ?? 0) ? v : best
      ).place_id,
      winnerLabel: "Most Stable",
    },
    {
      label: "Review Validation", desc: "Higher is better",
      getValue: (v) => `${scorecard(v)?.review_validation_score ?? 0}%`,
      getBar:   (v) => scorecard(v)?.review_validation_score ?? 0,
      winnerId: vendors.reduce((best, v) =>
        (scorecard(v)?.review_validation_score ?? 0) >= (scorecard(best)?.review_validation_score ?? 0) ? v : best
      ).place_id,
      winnerLabel: "Most Trusted Reviews",
    },
    {
      label: "Years in Business", desc: "Experience",
      getValue: (v) => `${scorecard(v)?.years_in_business ?? 0} yrs`,
      getBar:   (v) => Math.min((scorecard(v)?.years_in_business ?? 0) * 4, 100),
      winnerId: vendors.reduce((best, v) =>
        (scorecard(v)?.years_in_business ?? 0) >= (scorecard(best)?.years_in_business ?? 0) ? v : best
      ).place_id,
      winnerLabel: "Most Experienced",
    },
    {
      label: "Legal Disputes", desc: "Lower is better",
      getValue: (v) => scorecard(v)?.legal_disputes ?? 0,
      getBar:   (v) => Math.max(0, 100 - (scorecard(v)?.legal_disputes ?? 0) * 25),
      winnerId: vendors.reduce((best, v) =>
        (scorecard(v)?.legal_disputes ?? 999) <= (scorecard(best)?.legal_disputes ?? 999) ? v : best
      ).place_id,
      winnerLabel: "Cleanest Record",
    },
    {
      label: "Compliance Certs", desc: "Count",
      getValue: (v) => scorecard(v)?.compliance.length ?? 0,
      getBar:   (v) => Math.min((scorecard(v)?.compliance.length ?? 0) * 25, 100),
      winnerId: vendors.reduce((best, v) =>
        (scorecard(v)?.compliance.length ?? 0) >= (scorecard(best)?.compliance.length ?? 0) ? v : best
      ).place_id,
      winnerLabel: "Best Compliance",
    },
  ];

  const winCounts: Record<string, number> = Object.fromEntries(vendors.map((v) => [v.place_id, 0]));
  metrics.forEach((m) => { if (winCounts[m.winnerId] !== undefined) winCounts[m.winnerId]++; });
  const maxWins = Math.max(...vendors.map((v) => winCounts[v.place_id]));
  const bestVendorId = vendors.find((v) => winCounts[v.place_id] === maxWins)?.place_id ?? "";

  const topVendor = [...vendors].sort((a, b) => {
    const ra = scorecard(a), rb = scorecard(b);
    const rDiff = (ra?.risk_score ?? 100) - (rb?.risk_score ?? 100);
    if (rDiff !== 0) return rDiff;
    return (rb?.reliability ?? 0) - (ra?.reliability ?? 0);
  })[0];
  const topCard = scorecard(topVendor);

  const riskLevelLabel = (sc?: VendorScorecard) => {
    if (!sc) return "UNKNOWN";
    if (sc.color === "GREEN")  return "LOW";
    if (sc.color === "YELLOW") return "MEDIUM";
    return "HIGH";
  };

  const redCards = report.scorecards.filter((s) => s.color === "RED");

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Vendor Comparison</span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-ink mt-1">Compare Vendors</h2>
          <p className="text-ink/45 text-lg mt-1">AI-researched side-by-side analysis with live data.</p>
        </div>
        <button onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 glass border border-ink/10 rounded-xl text-xs text-ink-muted hover:text-ink hover:border-ink/20 transition-all shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      </div>

      <div className="glass border border-ink/8 rounded-2xl px-6 py-4 flex items-center gap-6 flex-wrap">
        <div>
          <p className="text-ink-faint text-xs uppercase tracking-widest">Portfolio Safety Score</p>
          <p className={`font-serif text-3xl font-bold ${report.overall_score >= 70 ? "text-emerald-400" : report.overall_score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
            {report.overall_score}<span className="text-ink/20 text-lg font-normal"> / 100</span>
          </p>
        </div>
        <div className="flex-1 h-2 rounded-full bg-ink/8 min-w-[120px]">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${report.overall_score}%` }} />
        </div>
        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${
          report.overall_score >= 70 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
          : report.overall_score >= 40 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
          : "text-red-400 bg-red-500/10 border-red-500/30"
        }`}>
          {report.overall_score >= 70 ? "✓ Safe to proceed" : report.overall_score >= 40 ? "⚠ Review needed" : "✗ Action required"}
        </span>
        <p className="text-ink/20 text-xs w-full sm:w-auto">
          Generated {new Date(report.generated_at).toLocaleString()} · ID {report.request_id.slice(0, 8)}
        </p>
      </div>

      <div className={`grid gap-5 ${cols}`}>
        {vendors.map((v) => {
          const sc = scorecard(v);
          const wins = winCounts[v.place_id];
          const isBest = v.place_id === bestVendorId && vendors.length > 1;
          return (
            <div key={v.place_id}
              className={`glass rounded-2xl p-5 text-center transition-all ${isBest ? "border-gold-bright glow-gold" : "border border-ink/8"}`}>
              {isBest && vendors.length > 1 && (
                <div className="mb-3"><WinnerBadge label="Best Overall" /></div>
              )}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-serif text-2xl font-bold text-gold">{v.name[0]}</span>
              </div>
              <h3 className="font-semibold text-ink text-sm mb-1">{v.name}</h3>
              <p className="text-ink/35 text-xs mb-3">{v.category}</p>
              <p className={`text-xs font-bold ${riskColor(sc?.color ?? "GREEN")}`}>{riskLevelLabel(sc)} RISK</p>
              <p className="text-ink-subtle text-[10px] mt-1">{wins} metric{wins !== 1 ? "s" : ""} won</p>
              <a href={v.maps_url} target="_blank" rel="noopener noreferrer"
                className="block mt-3 text-xs text-gold/60 hover:text-gold transition-colors">
                View on Maps →
              </a>
            </div>
          );
        })}
      </div>

      <div className="glass border border-ink/8 rounded-2xl overflow-hidden">
        <div className={`grid border-b border-ink/8 ${tableCols}`}>
          <div className="px-6 py-4">
            <p className="text-ink-faint text-xs uppercase tracking-widest">Metric</p>
          </div>
          {vendors.map((v) => (
            <div key={v.place_id} className="px-6 py-4 border-l border-ink/8 text-center">
              <p className="text-ink font-semibold text-sm truncate">{v.name}</p>
            </div>
          ))}
        </div>

        {metrics.map((m, idx) => (
          <div key={m.label}
            className={`grid border-b border-ink/8 last:border-b-0 ${tableCols} ${idx % 2 === 1 ? "bg-ink/[0.02]" : ""}`}>
            <div className="px-6 py-5">
              <p className="text-ink-muted text-sm font-medium">{m.label}</p>
              <p className="text-ink-faint text-xs mt-0.5">{m.desc}</p>
            </div>
            {vendors.map((v) => (
              <div key={v.place_id} className="px-6 py-5 border-l border-ink/8">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className="text-ink font-semibold text-sm">{m.getValue(v)}</span>
                  {m.winnerId === v.place_id && vendors.length > 1 && <WinnerBadge label={m.winnerLabel} />}
                </div>
                <ScoreBar value={m.getBar(v)} />
              </div>
            ))}
          </div>
        ))}

        <div className={`grid border-t border-ink/8 ${tableCols}`}>
          <div className="px-6 py-5">
            <p className="text-ink-muted text-sm font-medium">Certifications</p>
            <p className="text-ink-faint text-xs mt-0.5">Active compliance</p>
          </div>
          {vendors.map((v) => {
            const certs = scorecard(v)?.compliance ?? [];
            return (
              <div key={v.place_id} className="px-6 py-5 border-l border-ink/8">
                {certs.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {certs.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-md text-[10px] glass text-gold/70 border border-gold/20">{c}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-ink-subtle text-xs italic">None on record</span>
                )}
              </div>
            );
          })}
        </div>

        <div className={`grid border-t border-ink/8 ${tableCols}`}>
          <div className="px-6 py-5">
            <p className="text-ink-muted text-sm font-medium">AI Assessment</p>
            <p className="text-ink-faint text-xs mt-0.5">Research findings</p>
          </div>
          {vendors.map((v) => {
            const sc = scorecard(v);
            const riskBadgeClass =
              sc?.color === "GREEN"  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
            : sc?.color === "YELLOW" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
            :                          "text-red-400 bg-red-500/10 border-red-500/30";
            return (
              <div key={v.place_id} className="px-6 py-5 border-l border-ink/8">
                {sc && (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold mb-2 ${riskBadgeClass}`}>
                    {sc.color}
                  </span>
                )}
                <p className="text-ink/45 text-xs leading-relaxed">{sc?.reason ?? "—"}</p>
                <p className="text-ink-faint text-xs leading-relaxed mt-1.5">
                  Review signal: {sc?.review_validation_reason ?? "No validated review evidence found."}
                </p>
              </div>
            );
          })}
        </div>

        <div className={`grid border-t border-ink/8 ${tableCols}`}>
          <div className="px-6 py-5">
            <p className="text-ink-muted text-sm font-medium">Google Data</p>
            <p className="text-ink-faint text-xs mt-0.5">Rating · Reviews · Status</p>
          </div>
          {vendors.map((v) => (
            <div key={v.place_id} className="px-6 py-5 border-l border-ink/8 space-y-2">
              {v.rating != null && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} className={`w-3 h-3 ${s <= Math.round(v.rating!) ? "text-gold" : "text-ink/15"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-ink-muted text-xs font-medium">{v.rating.toFixed(1)}</span>
                  {v.total_ratings != null && <span className="text-ink-subtle text-xs">({v.total_ratings.toLocaleString()})</span>}
                </div>
              )}
              <StatusBadge status={v.business_status} />
              {v.phone && <p className="text-ink-faint text-xs">{v.phone}</p>}
            </div>
          ))}
        </div>
      </div>

      {redCards.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-gold" />
            <h3 className="text-ink font-semibold text-sm">Suggested Backup Vendors</h3>
          </div>
          <div className="space-y-3">
            {redCards.map((sc) => (
              <div key={sc.name} className="glass border border-red-500/15 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <p className="text-ink-muted text-sm font-medium">Alternatives for <span className="text-ink">{sc.name}</span></p>
                </div>
                {sc.backups.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sc.backups.map((b, i) => (
                      <div key={b} className="flex items-center gap-3 glass border border-ink/8 rounded-xl px-4 py-2.5">
                        <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                        <span className="text-ink-muted text-sm">{b}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-faint text-sm italic">No backup vendors suggested.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-gold border-gold rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-2xl shrink-0">✦</span>
          <div>
            <p className="text-ink font-semibold mb-1">AI Recommendation</p>
            <p className="text-ink/55 text-sm leading-relaxed">
              Based on the comparison,{" "}
              <strong className="text-gold">{topVendor.name}</strong> ranks as the
              lowest-risk option with a score of{" "}
              <strong className="text-gold">{topCard?.risk_score ?? 0}/100</strong>.
              {topCard && scorecard(vendors.find((v) => v.place_id !== topVendor.place_id && scorecard(v)?.reliability !== topCard.reliability) ?? vendors[0])?.reliability !== topCard.reliability && vendors.length > 1 && (
                ` It also leads on reliability at ${topCard.reliability}%.`
              )}
              {" "}Consider your specific procurement priorities when making the final decision.
            </p>
          </div>
        </div>
      </div>

      <div className="glass border border-ink/8 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </div>
        <p className="text-ink-faint text-sm">
          Select different vendors above and click <span className="text-gold/70 font-medium">Compare &amp; Audit</span> to run a new comparison.
        </p>
      </div>
    </div>
  );
}

// ── Main panel component ───────────────────────────────────────────────────────

export default function VendorDiscoverPanel() {
  const { profile } = useAuth();
  const [category, setCategory] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [locationMode, setLocationMode] = useState<"city" | "zipcode">("city");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<VendorComparisonReport | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  const auditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("onestopsmb_business_address");
      if (saved) {
        const addr = JSON.parse(saved) as { countryCode?: string; stateCode?: string; cityName?: string };
        if (addr.countryCode) setCountryCode(addr.countryCode);
        if (addr.stateCode)   setStateCode(addr.stateCode);
        if (addr.cityName)    setCityName(addr.cityName);
      }
    } catch { /* ignore invalid stored data */ }
  }, []);

  // Pre-fill category from user's procurement profile (runs once when profile loads)
  useEffect(() => {
    if (profile?.procurement_categories?.length && !category) {
      setCategory(profile.procurement_categories[0]);
    }
  }, [profile]);

  const allCountries = useMemo(() => {
    const all = Country.getAllCountries();
    const priority = PRIORITY_COUNTRIES.map((code) => all.find((c) => c.isoCode === code)).filter(Boolean) as typeof all;
    return [...priority, ...all.filter((c) => !PRIORITY_COUNTRIES.includes(c.isoCode))];
  }, []);

  const states = useMemo(() => State.getStatesOfCountry(countryCode), [countryCode]);
  const cities = useMemo(() => (stateCode ? City.getCitiesOfState(countryCode, stateCode) : []), [countryCode, stateCode]);

  const locationString = useMemo(() => {
    const country = Country.getCountryByCode(countryCode)?.name ?? countryCode;
    const stateName = states.find((s) => s.isoCode === stateCode)?.name ?? "";
    if (locationMode === "zipcode" && zipcode.trim()) return [zipcode.trim(), stateName, country].filter(Boolean).join(", ");
    if (locationMode === "city" && cityName) return [cityName, stateName, country].filter(Boolean).join(", ");
    if (stateName) return [stateName, country].filter(Boolean).join(", ");
    return country;
  }, [countryCode, stateCode, cityName, zipcode, locationMode, states]);

  const canSubmit = category.trim() && stateCode;

  function handleCountryChange(code: string) { setCountryCode(code); setStateCode(""); setCityName(""); setZipcode(""); }
  function handleStateChange(code: string)   { setStateCode(code); setCityName(""); }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true); setResult(null); setError(null);
    setSelectedIds([]); setAuditReport(null); setAuditError(null);
    try {
      const res = await fetch("/api/vendors/discover", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category.trim(), location: locationString }),
      });
      const data = await res.json() as DiscoveryResult & { error?: string };
      if (!res.ok) setError(data.error ?? "Discovery failed.");
      else setResult(data);
    } catch { setError("Network error — please check your connection."); }
    finally { setLoading(false); }
  }

  function toggleVendor(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_SELECTION ? prev : [...prev, id]);
    setAuditReport(null); setAuditError(null);
  }

  async function handleAudit() {
    if (!result || selectedIds.length === 0) return;
    const vendors = selectedIds.map((id) => result.vendors.find((v) => v.place_id === id)).filter(Boolean) as DiscoveredVendor[];
    setAuditLoading(true); setAuditReport(null); setAuditError(null);
    try {
      const res = await fetch("/api/vendors/audit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendors }),
      });
      const data = await res.json() as VendorComparisonReport & { error?: string };
      if (!res.ok) setAuditError(data.error ?? "Comparison failed.");
      else {
        setAuditReport(data);
        setTimeout(() => auditRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }
    } catch { setAuditError("Network error — please check your connection."); }
    finally { setAuditLoading(false); }
  }

  const selectedVendors = useMemo(
    () => selectedIds.map((id) => result?.vendors.find((v) => v.place_id === id)).filter(Boolean) as DiscoveredVendor[],
    [selectedIds, result],
  );

  return (
    <>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass border border-ink/10 rounded-full mb-5">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Mistral AI + Google Places + Tavily</span>
        </div>
        <h1 className="font-serif text-5xl lg:text-6xl font-bold text-ink mt-2 mb-4">Vendor Discovery</h1>
        <p className="text-ink/45 text-xl max-w-2xl mx-auto">
          Discover real vendors, select up to 3, and get a full AI-powered comparison with scored metrics.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="glass-gold border-gold rounded-3xl p-8 mb-10">
        <div className="mb-6">
          <label className="block text-ink-muted text-xs font-semibold uppercase tracking-widest mb-2">Vendor Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Electronics supplier"
            className="w-full px-4 py-3 rounded-xl bg-white border border-ink/10 text-ink placeholder-ink-subtle text-sm focus:outline-none focus:border-gold/50 transition-colors"
            disabled={loading} />
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {CATEGORY_PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setCategory(p)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  category === p ? "bg-gold/15 border-gold/40 text-gold" : "bg-white/60 border-ink/10 text-ink-faint hover:text-ink-muted hover:border-ink/20"
                }`}>{p}</button>
            ))}
          </div>
        </div>

        <div className="border-t border-ink/10 mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <SelectBox label="Country" value={countryCode} onChange={handleCountryChange} disabled={loading}>
            {allCountries.map((c) => <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>)}
          </SelectBox>
          <SelectBox label="State / Province" value={stateCode} onChange={handleStateChange}
            disabled={loading || states.length === 0} placeholder={states.length === 0 ? "No states available" : "Select state…"}>
            {states.map((s) => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
          </SelectBox>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-ink-muted text-xs font-semibold uppercase tracking-widest">Location by</span>
            <div className="inline-flex glass border border-ink/10 rounded-full p-0.5">
              {(["city", "zipcode"] as const).map((mode) => (
                <button key={mode} type="button"
                  onClick={() => { setLocationMode(mode); setCityName(""); setZipcode(""); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${locationMode === mode ? "bg-gold text-navy-900" : "text-ink-faint hover:text-ink-muted"}`}>
                  {mode === "city" ? "City" : "ZIP Code"}
                </button>
              ))}
            </div>
          </div>
          {locationMode === "city" ? (
            <SelectBox label="City (Optional)" value={cityName} onChange={setCityName}
              disabled={loading || !stateCode || cities.length === 0}
              placeholder={!stateCode ? "Select a state first" : cities.length === 0 ? "No cities available" : "Select city (optional)…"}>
              {cities.map((c) => <option key={`${c.name}-${c.stateCode}`} value={c.name}>{c.name}</option>)}
            </SelectBox>
          ) : (
            <div>
              <label className="block text-ink-muted text-xs font-semibold uppercase tracking-widest mb-2">ZIP / Postal Code (Optional)</label>
              <input type="text" value={zipcode} onChange={(e) => setZipcode(e.target.value)}
                placeholder="e.g. 94102" maxLength={10} disabled={loading || !stateCode}
                className="w-full sm:w-52 px-4 py-3 rounded-xl bg-white border border-ink/10 text-ink placeholder-ink-subtle text-sm focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-40" />
              {!stateCode && <p className="text-ink-subtle text-xs mt-1.5">Select a state first</p>}
            </div>
          )}
        </div>

        {stateCode && (
          <div className="mt-4 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-ink-faint text-xs">Searching near: <span className="text-gold/80 font-medium">{locationString}</span></span>
          </div>
        )}

        <button type="submit" disabled={loading || !canSubmit}
          className="mt-6 w-full py-3.5 rounded-xl bg-gold text-navy-900 font-bold text-sm hover:bg-gold-300 transition-all glow-gold-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading
            ? <><div className="w-4 h-4 rounded-full border-2 border-navy-900/30 border-t-navy-900 animate-spin" /> Discovering vendors…</>
            : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" /></svg> Discover Vendors</>}
        </button>
      </form>

      {/* Discovery loading */}
      {loading && (
        <div className="glass border border-ink/8 rounded-3xl p-10 text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-5 flex-wrap">
            {["Searching Google Places", "Fetching vendor details", "AI summarizing"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                <span className="text-ink-faint text-xs">{step}</span>
                {i < 2 && <span className="text-ink/15 mx-2">→</span>}
              </div>
            ))}
          </div>
          <p className="text-ink-subtle text-sm">Mistral AI is researching vendors near <span className="text-ink-muted">{locationString}</span>…</p>
        </div>
      )}

      {/* Discovery error */}
      {error && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-8">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-red-400 font-semibold text-sm">Discovery Failed</p>
            <p className="text-red-300/70 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-ink font-serif text-2xl font-bold">
                {result.total_found} vendor{result.total_found !== 1 ? "s" : ""} found
              </h2>
              <p className="text-ink/35 text-sm mt-1">
                <span className="text-gold/80">{result.query}</span> near <span className="text-ink-muted">{result.location}</span>
                <span className="text-ink/20 mx-2">·</span>
                <span className="text-ink-subtle">{new Date(result.generated_at).toLocaleTimeString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 px-4 py-3 glass border border-ink/10 rounded-xl">
            <svg className="w-4 h-4 text-gold/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-ink-faint text-sm">
              Check up to <span className="text-gold font-semibold">{MAX_SELECTION} vendors</span> then click <span className="text-gold font-semibold">Compare &amp; Audit</span> for a scored side-by-side analysis.
            </p>
          </div>

          {result.vendors.length === 0 ? (
            <div className="glass border border-ink/8 rounded-2xl p-10 text-center">
              <p className="text-ink-faint text-sm">No vendors found. Try a different category or location.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {result.vendors.map((vendor) => {
                const idx = selectedIds.indexOf(vendor.place_id);
                return (
                  <VendorCard key={vendor.place_id} vendor={vendor} selected={idx !== -1}
                    onToggle={() => toggleVendor(vendor.place_id)}
                    selectionFull={selectedIds.length >= MAX_SELECTION}
                    selectionIndex={idx + 1} />
                );
              })}
            </div>
          )}

          {auditLoading && (
            <div className="glass border border-ink/8 rounded-3xl p-10 text-center mt-8">
              <div className="flex items-center justify-center gap-4 mb-5 flex-wrap">
                {["Searching web for each vendor", "Validating reviews from external APIs", "Scoring 7 metrics"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
                    <span className="text-ink-faint text-xs">{step}</span>
                    {i < 2 && <span className="text-ink/15 mx-2">→</span>}
                  </div>
                ))}
              </div>
              <p className="text-ink-subtle text-sm">Mistral agents are auditing <span className="text-ink-muted">{selectedVendors.map((v) => v.name).join(", ")}</span>...</p>
            </div>
          )}

          {auditError && (
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 mt-6">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-red-400 font-semibold text-sm">Comparison Failed</p>
                <p className="text-red-300/70 text-sm mt-0.5">{auditError}</p>
              </div>
            </div>
          )}

          <div ref={auditRef}>
            {auditReport && (
              <AuditPanel report={auditReport} vendors={selectedVendors}
                onClose={() => { setAuditReport(null); setAuditError(null); }} />
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="glass border border-ink/8 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gold/8 border border-gold/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <p className="text-ink-faint text-sm">Select a country and state to discover real vendors. City is optional.</p>
          <p className="text-ink/20 text-xs mt-2">Powered by Mistral AI · Google Places · Tavily</p>
        </div>
      )}

      {/* Sticky selection bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="glass-gold border-gold rounded-2xl px-5 py-4 shadow-[0_8px_40px_rgba(198,167,94,0.2)] flex items-center gap-4">
            <div className="flex -space-x-2">
              {selectedVendors.map((v, i) => (
                <div key={v.place_id} className="w-8 h-8 rounded-full bg-navy-800 border-2 border-gold/40 flex items-center justify-center" style={{ zIndex: 10 - i }}>
                  <span className="font-serif text-gold text-xs font-bold">{v.name.charAt(0)}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink font-semibold text-sm">{selectedIds.length} / {MAX_SELECTION} vendors selected</p>
              <p className="text-ink-faint text-xs truncate">{selectedVendors.map((v) => v.name).join(" · ")}</p>
            </div>
            <button onClick={() => { setSelectedIds([]); setAuditReport(null); }}
              className="text-ink-faint hover:text-ink-muted transition-colors shrink-0 p-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button onClick={handleAudit} disabled={auditLoading}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gold text-navy-900 rounded-xl font-bold text-sm hover:bg-gold-300 transition-all glow-gold-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {auditLoading
                ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-navy-900/30 border-t-navy-900 animate-spin" /> Auditing…</>
                : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg> Compare &amp; Audit</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
