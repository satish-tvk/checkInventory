"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function PersonalizedHero() {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <>
        <div className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          <span className="text-brand-700 text-[11px] font-semibold tracking-[0.14em] uppercase">
            AI Procurement Intelligence
          </span>
        </div>

        <h1
          className="font-serif font-semibold leading-[0.95] text-ink"
          style={{ fontSize: "clamp(52px, 8vw, 84px)" }}
        >
          Spot Risk.<br />
          Pick Winners.<br />
          <span className="text-violet-gradient">Move Fast.</span>
        </h1>

        <p className="text-ink/70 text-[16px] mt-7 max-w-[440px] leading-[1.75]">
          OneStopSMB combines vendor discovery, competitor mapping, and supply
          risk auditing into one location-aware workflow.
        </p>

        <div className="flex flex-wrap gap-3 mt-10">
          <Link
            href="/vendors/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-ink font-semibold text-sm transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #0D5CFF, #0046D6)", boxShadow: "0 4px 20px rgba(13,92,255,0.40)" }}
          >
            Start discovering
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/audit"
            className="px-5 py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-semibold text-sm hover:bg-teal-100 transition-all duration-150"
          >
            Run risk audit
          </Link>
          <Link
            href="/competitors"
            className="px-5 py-2.5 rounded-xl border border-ink/[0.20] text-ink/65 font-medium text-sm hover:text-ink hover:border-ink/35 transition-all duration-150"
          >
            Analyze competitors
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap gap-4 mt-8">
          {[
            { color: "bg-brand-500", label: "Vendor Discovery" },
            { color: "bg-teal-500",  label: "Risk Auditing"    },
            { color: "bg-amber-500", label: "Competitor Intel"  },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              <span className="text-ink/60 text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Personalized for logged-in users
  const firstName = profile?.owner_name?.split(" ")[0] ?? user.username;
  const category  = profile?.procurement_categories?.[0];
  const riskColor =
    profile?.risk_score != null && profile.risk_score >= 75 ? "text-rose-500"
    : profile?.risk_score != null && profile.risk_score >= 50 ? "text-amber-500"
    : profile?.risk_score != null && profile.risk_score >= 25 ? "text-yellow-500"
    : "text-teal-500";

  return (
    <>
      <div className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        <span className="text-teal-700 text-[11px] font-semibold tracking-[0.14em] uppercase">
          {profile?.business_archetype ?? "Your Dashboard"}
        </span>
      </div>

      <h1
        className="font-serif font-semibold leading-[1.02] text-ink"
        style={{ fontSize: "clamp(44px, 6.5vw, 70px)" }}
      >
        Welcome back,<br />
        <span className="text-violet-gradient">{firstName}.</span>
      </h1>

      {profile && (
        <p className="text-ink/70 text-[15px] mt-5 leading-relaxed">
          {profile.business_name}
          {profile.risk_profile && (
            <>
              {" · "}
              <span className={`font-medium ${riskColor}`}>{profile.risk_profile} risk</span>
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-8">
        <Link
          href={category ? `/vendors/discover?category=${encodeURIComponent(category)}` : "/vendors/discover"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-ink font-semibold text-sm transition-all duration-150"
          style={{ background: "linear-gradient(135deg, #0D5CFF, #0046D6)", boxShadow: "0 4px 20px rgba(13,92,255,0.40)" }}
        >
          {category ? `Find ${category} suppliers` : "Start discovering"}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
        <Link
          href="/audit"
          className="px-5 py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-semibold text-sm hover:bg-teal-100 transition-all duration-150"
        >
          Run risk audit
        </Link>
        <Link
          href="/competitors"
          className="px-5 py-2.5 rounded-xl border border-ink/[0.20] text-ink/65 font-medium text-sm hover:text-ink hover:border-ink/35 transition-all duration-150"
        >
          Analyze competitors
        </Link>
      </div>
    </>
  );
}
