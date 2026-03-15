"use client";

import { useAuth } from "@/contexts/AuthContext";

const STATIC_METRICS = [
  { label: "Portfolio Safety",   value: "78 / 100",  sub: "Up 6% this week",         color: "teal"   },
  { label: "Review Validation",  value: "84%",        sub: "Cross-source consistent", color: "brand"  },
  { label: "High Risk Vendors",  value: "2 flagged",  sub: "Backups available",       color: "rose"   },
  { label: "Markets Covered",    value: "12 regions", sub: "Location-aware search",   color: "sky"    },
];

const colorMap: Record<string, { bg: string; text: string; dot: string; ring: string }> = {
  brand: { bg: "bg-brand-50",  text: "text-brand-600",  dot: "bg-brand-500",  ring: "ring-brand-200"  },
  teal:  { bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-500",   ring: "ring-teal-200"   },
  rose:  { bg: "bg-rose-50",   text: "text-rose-600",   dot: "bg-rose-500",   ring: "ring-rose-200"   },
  sky:   { bg: "bg-sky-50",    text: "text-sky-700",    dot: "bg-sky-500",    ring: "ring-sky-200"    },
  amber: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500",  ring: "ring-amber-200"  },
};

export default function PersonalizedPanel() {
  const { profile } = useAuth();

  const metrics = profile
    ? [
        {
          label: "Risk Score",
          value: profile.risk_score != null ? `${profile.risk_score} / 100` : "—",
          sub:   profile.risk_profile ?? "Pending assessment",
          color: "teal",
        },
        {
          label: "Business Type",
          value: profile.business_archetype ?? "—",
          sub:   profile.industry,
          color: "brand",
        },
        {
          label: "Procurement Focus",
          value: profile.procurement_categories[0] ?? "—",
          sub:   profile.procurement_categories.length > 1
            ? `+ ${profile.procurement_categories.length - 1} more`
            : "Primary category",
          color: "amber",
        },
        {
          label: "Business",
          value: profile.business_name,
          sub:   profile.owner_name,
          color: "sky",
        },
      ]
    : STATIC_METRICS;

  return (
    <div className="rounded-2xl p-6 bg-white border border-ink/[0.07]" style={{ boxShadow: "0 8px 40px rgba(19,16,58,0.10)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-ink/55 text-[10px] font-semibold uppercase tracking-[0.18em]">
          {profile ? "Your Profile" : "Platform Metrics"}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-400" />
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span className="w-2 h-2 rounded-full bg-rose-400" />
        </div>
      </div>

      {/* Metric rows */}
      <div className="space-y-2">
        {metrics.map((item) => {
          const c = colorMap[item.color] ?? colorMap.brand;
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl ${c.bg}`}
            >
              <div className="min-w-0 flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                <div className="min-w-0">
                  <p className="text-ink/65 text-[11px] uppercase tracking-wider font-semibold">{item.label}</p>
                  <p className="text-ink/55 text-[11px] mt-0.5 truncate">{item.sub}</p>
                </div>
              </div>
              <p className={`font-serif text-[18px] leading-tight text-right shrink-0 max-w-[140px] truncate font-semibold ${c.text}`}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
