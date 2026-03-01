"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_VENDORS, Vendor } from "@/lib/mockVendors";

const riskColor = (level: "LOW" | "MEDIUM" | "HIGH") =>
  level === "LOW" ? "text-gold" : level === "MEDIUM" ? "text-white/60" : "text-white/40";

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/5">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gold font-semibold text-sm w-10 text-right">{value}</span>
    </div>
  );
}

function WinnerBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold text-navy-900 text-[10px] font-bold">
      ★ {label}
    </span>
  );
}

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>(["1", "5"]);

  const toggleVendor = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const compared: Vendor[] = selected
    .map((id) => MOCK_VENDORS.find((v) => v.id === id)!)
    .filter(Boolean);

  // Determine winners per metric
  const bestReliability = compared.reduce((best, v) => (v.reliabilityScore > (best?.reliabilityScore ?? 0) ? v : best), compared[0]);
  const lowestRisk      = compared.reduce((best, v) => (v.riskScore < (best?.riskScore ?? 999) ? v : best), compared[0]);
  const bestFinancial   = compared.reduce((best, v) => (v.financialStability > (best?.financialStability ?? 0) ? v : best), compared[0]);
  const bestReviewTrust = compared.reduce((best, v) => (v.reviewValidationScore > (best?.reviewValidationScore ?? 0) ? v : best), compared[0]);
  const mostCompliant   = compared.reduce((best, v) => (v.compliance.length > (best?.compliance.length ?? 0) ? v : best), compared[0]);

  const metrics = [
    {
      label: "Risk Score",
      desc: "Lower is better",
      getValue: (v: Vendor) => v.riskScore,
      getBar: (v: Vendor) => 100 - v.riskScore,
      winner: lowestRisk?.id,
      winnerLabel: "Lowest Risk",
    },
    {
      label: "Reliability",
      desc: "Higher is better",
      getValue: (v: Vendor) => `${v.reliabilityScore}%`,
      getBar: (v: Vendor) => v.reliabilityScore,
      winner: bestReliability?.id,
      winnerLabel: "Most Reliable",
    },
    {
      label: "Financial Stability",
      desc: "Higher is better",
      getValue: (v: Vendor) => `${v.financialStability}%`,
      getBar: (v: Vendor) => v.financialStability,
      winner: bestFinancial?.id,
      winnerLabel: "Most Stable",
    },
    {
      label: "Review Validation",
      desc: "Higher is better",
      getValue: (v: Vendor) => `${v.reviewValidationScore}%`,
      getBar: (v: Vendor) => v.reviewValidationScore,
      winner: bestReviewTrust?.id,
      winnerLabel: "Most Trusted Reviews",
    },
    {
      label: "Years in Business",
      desc: "Experience",
      getValue: (v: Vendor) => `${v.yearsInBusiness} yrs`,
      getBar: (v: Vendor) => Math.min(v.yearsInBusiness * 4, 100),
      winner: compared.reduce((b, v) => (v.yearsInBusiness > (b?.yearsInBusiness ?? 0) ? v : b), compared[0])?.id,
      winnerLabel: "Most Experienced",
    },
    {
      label: "Legal Disputes",
      desc: "Lower is better",
      getValue: (v: Vendor) => v.legalDisputes,
      getBar: (v: Vendor) => Math.max(0, 100 - v.legalDisputes * 25),
      winner: compared.reduce((b, v) => (v.legalDisputes < (b?.legalDisputes ?? 999) ? v : b), compared[0])?.id,
      winnerLabel: "Cleanest Record",
    },
    {
      label: "Compliance Certs",
      desc: "Count",
      getValue: (v: Vendor) => v.compliance.length,
      getBar: (v: Vendor) => Math.min(v.compliance.length * 25, 100),
      winner: mostCompliant?.id,
      winnerLabel: "Best Compliance",
    },
  ];

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Vendor Comparison</span>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mt-2 mb-3">Compare Vendors</h1>
          <p className="text-white/45 text-lg">Select up to 3 vendors to compare side by side.</p>
        </div>

        {/* Vendor selector */}
        <div className="glass border border-white/5 rounded-2xl p-5 mb-8">
          <p className="text-white/50 text-sm mb-4">Select vendors to compare ({selected.length}/3 selected):</p>
          <div className="flex flex-wrap gap-2">
            {MOCK_VENDORS.map((v) => {
              const isSelected = selected.includes(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVendor(v.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-gold text-navy-900 glow-gold-sm"
                      : "glass border border-white/8 text-white/60 hover:text-white hover:border-gold/30"
                  }`}
                >
                  <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold">
                    {v.name[0]}
                  </span>
                  {v.name}
                  {isSelected && <span className="text-navy-900">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {compared.length < 2 ? (
          <div className="text-center py-24 glass border border-white/5 rounded-2xl">
            <p className="text-4xl mb-4">⚖️</p>
            <p className="text-white/40 text-lg">Select at least 2 vendors to compare.</p>
          </div>
        ) : (
          <>
            {/* Vendor header cards */}
            <div className={`grid gap-5 mb-6 ${compared.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {compared.map((v) => {
                const wins = metrics.filter((m) => m.winner === v.id).length;
                const isOverallBest = wins === Math.max(...compared.map((c) => metrics.filter((m) => m.winner === c.id).length));
                return (
                  <div key={v.id} className={`glass rounded-2xl p-5 text-center transition-all ${isOverallBest ? "border-gold-bright glow-gold" : "border border-white/5"}`}>
                    {isOverallBest && compared.length > 1 && (
                      <div className="mb-3"><WinnerBadge label="Best Overall"/></div>
                    )}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-3">
                      <span className="font-serif text-2xl font-bold text-gold">{v.name[0]}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{v.name}</h3>
                    <p className="text-white/35 text-xs mb-3">{v.category}</p>
                    <p className={`text-xs font-bold ${riskColor(v.riskLevel)}`}>{v.riskLevel} RISK</p>
                    <p className="text-white/25 text-[10px] mt-1">{wins} metric{wins !== 1 ? "s" : ""} won</p>
                    <Link href={`/vendors/${v.id}`} className="block mt-3 text-xs text-gold/60 hover:text-gold transition-colors">View Full Profile →</Link>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="glass border border-white/5 rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className={`grid border-b border-white/5 ${compared.length === 2 ? "grid-cols-3" : "grid-cols-4"}`}>
                <div className="px-6 py-4">
                  <p className="text-white/30 text-xs uppercase tracking-widest">Metric</p>
                </div>
                {compared.map((v) => (
                  <div key={v.id} className="px-6 py-4 border-l border-white/5 text-center">
                    <p className="text-white font-semibold text-sm">{v.name}</p>
                  </div>
                ))}
              </div>

              {/* Metric rows */}
              {metrics.map((m, idx) => (
                <div key={m.label} className={`grid border-b border-white/5 last:border-b-0 ${compared.length === 2 ? "grid-cols-3" : "grid-cols-4"} ${idx % 2 === 0 ? "" : "bg-white/[0.015]"}`}>
                  <div className="px-6 py-5">
                    <p className="text-white/70 text-sm font-medium">{m.label}</p>
                    <p className="text-white/30 text-xs mt-0.5">{m.desc}</p>
                  </div>
                  {compared.map((v) => (
                    <div key={v.id} className="px-6 py-5 border-l border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">{m.getValue(v)}</span>
                        {m.winner === v.id && compared.length > 1 && <WinnerBadge label={m.winnerLabel}/>}
                      </div>
                      <ScoreBar value={m.getBar(v)}/>
                    </div>
                  ))}
                </div>
              ))}

              {/* Compliance row */}
              <div className={`grid border-t border-white/5 ${compared.length === 2 ? "grid-cols-3" : "grid-cols-4"}`}>
                <div className="px-6 py-5">
                  <p className="text-white/70 text-sm font-medium">Certifications</p>
                  <p className="text-white/30 text-xs mt-0.5">Active compliance</p>
                </div>
                {compared.map((v) => (
                  <div key={v.id} className="px-6 py-5 border-l border-white/5">
                    {v.compliance.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {v.compliance.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded-md text-[10px] glass text-gold/70 border border-gold/20">{c}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/25 text-xs italic">None on record</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            {compared.length >= 2 && (
              <div className="mt-6 glass-gold border-gold rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">✦</span>
                  <div>
                    <p className="text-white font-semibold mb-1">AI Recommendation</p>
                    <p className="text-white/55 text-sm leading-relaxed">
                      Based on the comparison, <strong className="text-gold">{lowestRisk?.name}</strong> ranks as the lowest-risk option with a score of <strong className="text-gold">{lowestRisk?.riskScore}/100</strong>.
                      {bestReliability?.id !== lowestRisk?.id
                        ? ` However, <strong>${bestReliability?.name}</strong> offers the highest reliability at ${bestReliability?.reliabilityScore}%.`
                        : " It also leads on reliability."}
                      {" "}Consider your specific procurement priorities when making the final decision.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
