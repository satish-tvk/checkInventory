import type { AuditReport, RiskColor } from "@/lib/types";

const riskStyles: Record<RiskColor, { badge: string; dot: string; row: string }> = {
  RED:    { badge: "bg-red-500/15 text-red-400 border-red-500/30",    dot: "bg-red-400",    row: "bg-red-500/[0.04]" },
  YELLOW: { badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", dot: "bg-yellow-400", row: "bg-yellow-500/[0.04]" },
  GREEN:  { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400", row: "" },
};

const overallStyle = (score: number) => {
  if (score >= 70) return { label: "Low Risk",    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  if (score >= 40) return { label: "Medium Risk", badge: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" };
  return             { label: "High Risk",   badge: "text-red-400 bg-red-500/10 border-red-500/30" };
};

const scoreArc = (score: number) => {
  const r = 52, cx = 60, cy = 60;
  const circ = Math.PI * r;
  const fill = circ - (score / 100) * circ;
  return { r, cx, cy, circ, fill };
};

interface ReportCardProps {
  report: AuditReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  const redSuppliers = report.ratings.filter((r) => r.color === "RED");
  const overall = overallStyle(report.overall_score);
  const arc = scoreArc(report.overall_score);

  return (
    <div className="mt-8 space-y-6">

      {/* Overall score */}
      <div className="glass-gold border-gold rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* SVG gauge */}
          <div className="relative shrink-0">
            <svg width="120" height="70" viewBox="0 0 120 70">
              <path
                d={`M ${arc.cx - arc.r},${arc.cy} A ${arc.r},${arc.r} 0 0,1 ${arc.cx + arc.r},${arc.cy}`}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d={`M ${arc.cx - arc.r},${arc.cy} A ${arc.r},${arc.r} 0 0,1 ${arc.cx + arc.r},${arc.cy}`}
                fill="none"
                stroke="#C6A75E"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={arc.circ}
                strokeDashoffset={arc.fill}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 text-center">
              <p className="font-serif text-4xl font-bold text-white leading-none">{report.overall_score}</p>
              <p className="text-white/30 text-xs mt-1">/ 100</p>
            </div>
          </div>

          {/* Labels */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white/40 text-sm mb-1">Overall Supply Chain Risk Score</p>
            <div className="flex items-center gap-3 justify-center sm:justify-start mb-3">
              <span className={`text-2xl font-bold font-serif ${report.overall_score >= 70 ? "text-emerald-400" : report.overall_score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                {overall.label}
              </span>
              <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${overall.badge}`}>
                {report.overall_score >= 70 ? "✓ Safe to proceed" : report.overall_score >= 40 ? "⚠ Review needed" : "✗ Action required"}
              </span>
            </div>
            <p className="text-white/25 text-xs">
              Report generated {new Date(report.generated_at).toLocaleString()} · ID: {report.request_id.slice(0, 8)}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex sm:flex-col gap-4 sm:gap-3 shrink-0">
            {(["RED","YELLOW","GREEN"] as RiskColor[]).map((c) => {
              const count = report.ratings.filter((r) => r.color === c).length;
              return (
                <div key={c} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${riskStyles[c].dot}`} />
                  <span className="text-white/40 text-xs">{count} {c.charAt(0) + c.slice(1).toLowerCase()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Supplier ratings table */}
      <div className="glass border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-white font-semibold text-sm">Supplier Risk Ratings</h2>
        </div>
        <div className="divide-y divide-white/5">
          {report.ratings.map((r) => (
            <div key={r.name} className={`px-6 py-4 flex items-start gap-4 ${riskStyles[r.color].row}`}>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 text-white/50 font-semibold text-sm">
                {r.name.charAt(0).toUpperCase()}
              </div>
              {/* Name + badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="text-white font-medium text-sm">{r.name}</span>
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${riskStyles[r.color].badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskStyles[r.color].dot}`} />
                    {r.color}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full border text-xs font-bold text-gold bg-gold/10 border-gold/30">
                    Review Validation {r.review_validation_score}/100
                  </span>
                </div>
                <p className="text-white/45 text-sm leading-relaxed">{r.reason}</p>
                <p className="text-white/35 text-xs mt-1.5">{r.review_validation_reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup vendors for RED suppliers */}
      {redSuppliers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-gold" />
            <h2 className="text-white font-semibold text-sm">Suggested Backup Vendors</h2>
          </div>
          <div className="space-y-3">
            {redSuppliers.map((s) => (
              <div key={s.name} className="glass border border-red-500/15 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <p className="text-white/70 text-sm font-medium">Alternatives for <span className="text-white">{s.name}</span></p>
                </div>
                {s.backups.length > 0 ? (
                  <div className="space-y-2">
                    {s.backups.map((b, i) => (
                      <div key={b} className="flex items-center gap-3 glass border border-white/5 rounded-xl px-4 py-2.5">
                        <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs flex items-center justify-center font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-white/70 text-sm">{b}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm italic">No backup vendors suggested for this supplier.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Re-audit hint */}
      <div className="glass border border-white/5 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </div>
        <p className="text-white/40 text-sm">Upload a new CSV above to run another audit.</p>
      </div>

    </div>
  );
}
