"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_VENDORS, CATEGORIES } from "@/lib/mockVendors";

const riskColor = (level: "LOW" | "MEDIUM" | "HIGH") =>
  level === "LOW"
    ? "text-gold border-gold/40 bg-gold/10"
    : level === "MEDIUM"
    ? "text-white/70 border-white/20 bg-white/5"
    : "text-white/50 border-white/10 bg-white/5";

export default function VendorsPage() {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [riskFilter, setRiskFilter] = useState("All");
  const [view, setView]         = useState<"grid" | "list">("grid");

  const filtered = MOCK_VENDORS.filter((v) => {
    const matchSearch   = v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All Categories" || v.category === category;
    const matchRisk     = riskFilter === "All" || v.riskLevel === riskFilter;
    return matchSearch && matchCategory && matchRisk;
  });

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Vendor Database</span>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mt-2 mb-3">Discover Vendors</h1>
          <p className="text-white/45 text-lg">Browse and analyze vendors with AI-powered risk intelligence.</p>
        </div>

        {/* Filters */}
        <div className="glass border border-white/5 rounded-2xl p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, or keyword…"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-white/30 text-sm outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white text-sm outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Risk filter */}
            <div className="flex gap-2">
              {["All","LOW","MEDIUM","HIGH"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    riskFilter === r
                      ? "bg-gold text-navy-900 font-semibold"
                      : "glass border border-white/8 text-white/60 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex gap-1 glass rounded-xl p-1 border border-white/5">
              <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-gold/20 text-gold" : "text-white/40"}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/></svg>
              </button>
              <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-gold/20 text-gold" : "text-white/40"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          </div>

          <p className="text-white/30 text-xs mt-4">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""} found</p>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-white/40 text-lg">No vendors match your filters.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((v) => (
              <Link key={v.id} href={`/vendors/${v.id}`}>
                <div className="group glass border border-white/5 hover:border-gold/30 rounded-2xl p-6 transition-all duration-300 hover:glow-gold-sm hover:-translate-y-0.5 h-full">
                  {/* Avatar + name + risk */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center shrink-0">
                      <span className="font-serif text-xl font-bold text-gold">{v.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-gold transition-colors">{v.name}</h3>
                      <p className="text-white/40 text-xs mt-0.5">{v.category}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${riskColor(v.riskLevel)}`}>{v.riskLevel}</span>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center glass rounded-lg py-2">
                      <p className="text-gold font-bold text-sm">{v.reliabilityScore}%</p>
                      <p className="text-white/30 text-[10px]">Reliability</p>
                    </div>
                    <div className="text-center glass rounded-lg py-2">
                      <p className="text-gold font-bold text-sm">{v.yearsInBusiness}y</p>
                      <p className="text-white/30 text-[10px]">Est.</p>
                    </div>
                    <div className="text-center glass rounded-lg py-2">
                      <p className="text-gold font-bold text-sm">{v.legalDisputes}</p>
                      <p className="text-white/30 text-[10px]">Disputes</p>
                    </div>
                  </div>

                  {/* Location */}
                  <p className="text-white/35 text-xs mb-4">📍 {v.location}</p>

                  {/* Compliance */}
                  <div className="flex gap-1.5 flex-wrap">
                    {v.compliance.slice(0, 2).map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-md text-[10px] glass text-white/40 border border-white/5">{c}</span>
                    ))}
                    {v.compliance.length > 2 && <span className="text-[10px] text-white/25">+{v.compliance.length - 2}</span>}
                    {v.compliance.length === 0 && <span className="text-[10px] text-white/20 italic">No certs</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="space-y-3">
            {filtered.map((v) => (
              <Link key={v.id} href={`/vendors/${v.id}`}>
                <div className="group glass border border-white/5 hover:border-gold/30 rounded-xl px-6 py-4 transition-all duration-200 hover:glow-gold-sm flex items-center gap-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center shrink-0">
                    <span className="font-serif text-lg font-bold text-gold">{v.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm group-hover:text-gold transition-colors">{v.name}</p>
                    <p className="text-white/35 text-xs mt-0.5">{v.category} · {v.location}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-gold font-semibold">{v.reliabilityScore}%</p>
                      <p className="text-white/30 text-[10px]">Reliability</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60">{v.yearsInBusiness} yrs</p>
                      <p className="text-white/30 text-[10px]">Est.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60">{v.employees}</p>
                      <p className="text-white/30 text-[10px]">Employees</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${riskColor(v.riskLevel)}`}>{v.riskLevel}</span>
                  <svg className="w-4 h-4 text-white/20 group-hover:text-gold transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
