"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ReportCard from "@/components/ReportCard";
import ErrorBanner from "@/components/ErrorBanner";
import VendorDiscoverPanel from "@/components/VendorDiscoverPanel";
import type { AuditReport } from "@/lib/types";

const HOW_IT_WORKS = [
  { step: "01", label: "Input Data",  desc: "Upload your supplier CSV — name, category, spend, country.", color: "bg-brand-600" },
  { step: "02", label: "AI Research", desc: "Agents validate risk via live web data and Tavily review signals.", color: "bg-teal-600" },
  { step: "03", label: "Risk Report", desc: "Receive scored ratings and backup vendor recommendations.", color: "bg-rose-500" },
];

export default function AuditPage() {
  const [loading,   setLoading]   = useState(false);
  const [report,    setReport]    = useState<AuditReport | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "discover">("upload");

  async function handleAudit(csvText: string) {
    setLoading(true);
    setReport(null);
    setError(null);
    try {
      const res  = await fetch("/api/audit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ csvText }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Audit failed. Please try again.");
      else         setReport(data);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-1 pt-[60px]">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-ink/[0.07] px-6 py-14" style={{ boxShadow: "0 1px 0 rgba(19,16,58,0.06)" }}>
        <div className="max-w-4xl mx-auto">
          <span className="tag-rose mb-5 inline-flex">AI-Powered Risk</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-semibold text-ink mb-4 leading-tight">
            Supply Risk Auditor
          </h1>
          <p className="text-ink/65 text-base max-w-xl leading-relaxed">
            Upload your supplier list or discover new vendors to get an instant AI-driven
            risk assessment with backup vendor recommendations.
          </p>

          {/* Colorful underline tabs */}
          <div className="flex gap-0 mt-10 border-b border-ink/[0.09]">
            {(["upload", "discover"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 pb-3 pt-1 text-sm font-semibold transition-all duration-150 border-b-2 -mb-px ${
                  activeTab === tab
                    ? tab === "upload"
                      ? "text-brand-600 border-brand-500"
                      : "text-teal-700 border-teal-500"
                    : "text-ink/40 border-transparent hover:text-ink/65"
                }`}
              >
                {tab === "upload" ? "Upload CSV" : "Discover New Vendors"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-6 py-10">
        <div className="max-w-4xl mx-auto">

          {activeTab === "upload" ? (
            <>
              {/* How it works */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {HOW_IT_WORKS.map((item) => (
                  <div key={item.step} className="p-5 rounded-2xl bg-white border border-ink/[0.07] shadow-card">
                    <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                      <span className="text-black font-mono text-xs font-bold">{item.step}</span>
                    </div>
                    <p className="text-ink/90 text-sm font-semibold mb-1.5">{item.label}</p>
                    <p className="text-ink/65 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Upload area */}
              <div className="rounded-2xl p-7 mb-8 bg-white border border-brand-200 shadow-card">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-ink font-semibold text-base">Upload Supplier Data</h2>
                    <p className="text-ink/65 text-sm mt-0.5">
                      CSV required:{" "}
                      <code className="text-brand-600 font-mono text-xs bg-brand-50 px-1.5 py-0.5 rounded">
                        name, category, spend_pct, country
                      </code>
                      {" "}— up to 10 suppliers
                    </p>
                  </div>
                </div>
                <UploadForm onAudit={handleAudit} loading={loading} />
              </div>

              {/* Loading */}
              {loading && (
                <div className="rounded-2xl p-12 text-center mb-8 bg-white border border-brand-200 shadow-card">
                  <div
                    className="w-14 h-14 rounded-full border-2 border-brand-100 border-t-brand-500 animate-spin mx-auto mb-6"
                  />
                  <h3 className="text-ink font-semibold text-base mb-2">Auditing your suppliers…</h3>
                  <p className="text-ink/65 text-sm max-w-sm mx-auto leading-relaxed">
                    AI agents are researching each supplier via live web data and review sources.
                    This may take 30–60 seconds.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                    {["Searching news & filings", "Analysing geopolitical risk", "Scoring financial stability"].map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                        <span className="text-ink/60 text-xs">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error  && <ErrorBanner message={error} />}
              {report && <ReportCard report={report} />}

              {/* CSV guide */}
              {!report && !loading && (
                <div className="rounded-2xl p-6 mt-8 bg-white border border-ink/[0.07] shadow-card">
                  <h3 className="text-ink/55 text-[10px] font-semibold uppercase tracking-[0.18em] mb-5">
                    CSV Format Guide
                  </h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-ink/[0.07]">
                        {["Column", "Type", "Description", "Example"].map((h) => (
                          <th key={h} className="text-left text-ink/55 text-[10px] font-semibold pb-3 pr-6 uppercase tracking-widest">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { col: "name",      type: "string", desc: "Supplier company name",        ex: "Acme Corp",  color: "text-brand-600" },
                        { col: "category",  type: "string", desc: "Product or service category",  ex: "Electronics", color: "text-teal-700" },
                        { col: "spend_pct", type: "number", desc: "% of total spend (sum ≤ 100)", ex: "35.5",         color: "text-amber-700" },
                        { col: "country",   type: "string", desc: "Country of operations",        ex: "China",        color: "text-rose-600" },
                      ].map((row, i) => (
                        <tr key={row.col} className={i < 3 ? "border-b border-ink/[0.05]" : ""}>
                          <td className={`py-3 pr-6 font-mono text-xs font-semibold ${row.color}`}>{row.col}</td>
                          <td className="py-3 pr-6 text-ink/55 text-xs">{row.type}</td>
                          <td className="py-3 pr-6 text-ink/75 text-xs">{row.desc}</td>
                          <td className="py-3 text-ink/55 text-xs font-mono">{row.ex}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="max-w-7xl mx-auto w-full">
              <VendorDiscoverPanel />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
