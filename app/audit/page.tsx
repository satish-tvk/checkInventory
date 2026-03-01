"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import VendorSearchForm from "@/components/VendorSearchForm";
import ReportCard from "@/components/ReportCard";
import ErrorBanner from "@/components/ErrorBanner";
import type { AuditReport } from "@/lib/types";

export default function AuditPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"upload" | "search">("upload");

  async function handleAudit(csvText: string) {
    setLoading(true);
    setReport(null);
    setError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Audit failed. Please try again.");
      } else {
        setReport(data);
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">AI-Powered</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-white mt-3 mb-4">
            Supply Risk Auditor
          </h1>
          <p className="text-white/45 text-xl max-w-2xl mx-auto">
            Upload your supplier list or search for vendors to get an instant AI-driven risk assessment with backup vendor recommendations.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { step: "01", label: "Input Data", desc: "Upload CSV or search Google Places for vendors" },
            { step: "02", label: "AI Research", desc: "Agents validate risk + external review signals from Tavily" },
            { step: "03", label: "Risk Report", desc: "Receive ratings plus review-validation score per supplier" },
          ].map((item) => (
            <div key={item.step} className="glass border border-white/5 rounded-2xl p-5 text-center">
              <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-gold text-xs font-bold">{item.step}</span>
              </div>
              <p className="text-white text-sm font-semibold mb-1.5">{item.label}</p>
              <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Input section */}
        <div className="glass-gold border-gold rounded-3xl p-8 mb-8">

          <div className="flex bg-white/5 rounded-xl p-1 mb-8 w-fit">
            <button
              onClick={() => setSearchMode("upload")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${searchMode === "upload" ? "bg-gold text-black shadow-md" : "text-white/50 hover:text-white"}`}
            >
              Upload CSV
            </button>
            <button
              onClick={() => setSearchMode("search")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${searchMode === "search" ? "bg-gold text-black shadow-md" : "text-white/50 hover:text-white"}`}
            >
              Search Vendors
            </button>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
              {searchMode === "upload" ? (
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )}
            </div>
            <div>
              {searchMode === "upload" ? (
                <>
                  <h2 className="text-white font-semibold text-lg">Upload Supplier Data</h2>
                  <p className="text-white/40 text-sm mt-0.5">CSV format required: <span className="text-gold/70 font-mono text-xs">name, category, spend_pct, country</span> — up to 10 suppliers</p>
                </>
              ) : (
                <>
                  <h2 className="text-white font-semibold text-lg">Search for New Vendors</h2>
                  <p className="text-white/40 text-sm mt-0.5">Find alternative vendors by category and location to audit their risk profile.</p>
                </>
              )}
            </div>
          </div>

          {searchMode === "upload" ? (
            <UploadForm onAudit={handleAudit} loading={loading} />
          ) : (
            <VendorSearchForm onAudit={handleAudit} loading={loading} />
          )}

        </div>

        {/* Loading state */}
        {loading && (
          <div className="glass border border-white/5 rounded-3xl p-12 text-center mb-8">
            <div className="w-16 h-16 rounded-full border-2 border-gold/20 border-t-gold animate-spin mx-auto mb-6" />
            <h3 className="text-white font-semibold text-lg mb-2">Auditing your suppliers…</h3>
            <p className="text-white/40 text-sm max-w-sm mx-auto">
              AI agents are researching each supplier via live web data and review sources. This may take 30-60 seconds.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              {["Searching news & filings", "Analyzing geopolitical risk", "Scoring financial stability"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  <span className="text-white/30 text-xs">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <ErrorBanner message={error} />}

        {/* Report */}
        {report && <ReportCard report={report} />}

        {/* CSV format guide */}
        {!report && !loading && searchMode === "upload" && (
          <div className="glass border border-white/5 rounded-2xl p-6 mt-8">
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">CSV Format Guide</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Column", "Type", "Description", "Example"].map((h) => (
                      <th key={h} className="text-left text-white/25 text-xs font-medium pb-3 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {[
                    { col: "name", type: "string", desc: "Supplier company name", ex: "Acme Corp" },
                    { col: "category", type: "string", desc: "Product or service category", ex: "Electronics" },
                    { col: "spend_pct", type: "number", desc: "% of total spend (must sum ≤ 100)", ex: "35.5" },
                    { col: "country", type: "string", desc: "Country of operations", ex: "China" },
                  ].map((row) => (
                    <tr key={row.col}>
                      <td className="py-3 pr-6 font-mono text-gold/80 text-xs">{row.col}</td>
                      <td className="py-3 pr-6 text-white/30 text-xs">{row.type}</td>
                      <td className="py-3 pr-6 text-white/50 text-xs">{row.desc}</td>
                      <td className="py-3 text-white/30 text-xs font-mono">{row.ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
