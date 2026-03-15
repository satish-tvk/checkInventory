import Link from "next/link";
import { MOCK_VENDORS } from "@/lib/mockVendors";
import { notFound } from "next/navigation";

function RiskGauge({ score }: { score: number }) {
  const r = 70; const cx = 100; const cy = 100;
  const circ = Math.PI * r;
  const fill = circ * (1 - score / 100);
  const color = score <= 30 ? "#C6A75E" : score <= 60 ? "#D4BB7A" : "#E8D5A0";
  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
      <path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round"/>
      <path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={fill}/>
      <text x={cx} y={cy-10} textAnchor="middle" fill="white" fontSize="28" fontWeight="700">{score}</text>
      <text x={cx} y={cy+8}  textAnchor="middle" fill="rgba(198,167,94,0.7)" fontSize="11">RISK SCORE</text>
      <text x={cx} y={cy+22} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9">Lower = Safer</text>
    </svg>
  );
}

function TrendChart({ data }: { data: number[] }) {
  const w = 240; const h = 60;
  const max = Math.max(...data); const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  const li = data.length - 1;
  const lx = w;
  const ly = h - ((data[li] - min) / range) * h;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C6A75E" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#C6A75E" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="#C6A75E" strokeWidth="2" strokeLinejoin="round"/>
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="3" fill={i === li ? "#C6A75E" : "rgba(198,167,94,0.4)"}/>;
      })}
    </svg>
  );
}

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const vendor = MOCK_VENDORS.find((v) => v.id === params.id);
  if (!vendor) notFound();

  const riskLabel = vendor.riskLevel === "LOW" ? "Low Risk" : vendor.riskLevel === "MEDIUM" ? "Medium Risk" : "High Risk";
  const riskBadge = vendor.riskLevel === "LOW"
    ? "bg-gold/15 text-gold border-gold/40"
    : vendor.riskLevel === "MEDIUM"
    ? "bg-white/10 text-black/70 border-white/20"
    : "bg-white/5 text-black/50 border-white/10";

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-black/30 text-sm mb-8">
          <Link href="/vendors" className="hover:text-gold transition-colors">Vendors</Link>
          <span>/</span>
          <span className="text-black/60">{vendor.name}</span>
        </div>

        {/* Hero header */}
        <div className="glass border border-white/5 rounded-3xl p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/25 to-gold/5 border border-gold/30 flex items-center justify-center shrink-0 glow-gold-sm">
              <span className="font-serif text-4xl font-bold text-gold">{vendor.name[0]}</span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="font-serif text-3xl lg:text-4xl font-bold text-black">{vendor.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskBadge}`}>{riskLabel}</span>
                {vendor.compliance.length > 0 && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/25">✓ Verified</span>}
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-black/45 mb-4">
                <span>📂 {vendor.category}</span>
                <span>📍 {vendor.location}</span>
                <span>🏢 {vendor.employees} employees</span>
                <span>📅 {vendor.yearsInBusiness} years in business</span>
                <span>💰 {vendor.revenue} revenue</span>
              </div>
              <p className="text-black/50 text-sm leading-relaxed max-w-2xl">{vendor.description}</p>
            </div>

            {/* CTA actions */}
            <div className="flex flex-col gap-3 shrink-0">
              <Link href="/compare" className="px-6 py-2.5 rounded-xl bg-gold text-navy-900 text-sm font-semibold hover:bg-gold-300 transition-all glow-gold-sm text-center">Compare</Link>
              <Link href="/audit"   className="px-6 py-2.5 rounded-xl glass border-gold text-black text-sm font-semibold hover:bg-white/5 transition-all text-center">Run Audit</Link>
            </div>
          </div>
        </div>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: Risk gauge + scores */}
          <div className="space-y-5">
            {/* Gauge card */}
            <div className="glass-gold border-gold rounded-2xl p-6 text-center glow-gold">
              <p className="text-black/40 text-xs uppercase tracking-widest mb-4">Overall Risk Score</p>
              <div className="flex justify-center mb-2">
                <RiskGauge score={vendor.riskScore}/>
              </div>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border ${riskBadge}`}>{riskLabel}</span>
            </div>

            {/* Key metrics */}
            <div className="glass border border-white/5 rounded-2xl p-5 space-y-4">
              <p className="text-black/30 text-xs uppercase tracking-widest">Key Metrics</p>
              {[
                {label:"Reliability Score",     value:`${vendor.reliabilityScore}%`, pct:vendor.reliabilityScore},
                {label:"Financial Stability",   value:`${vendor.financialStability}%`, pct:vendor.financialStability},
                {label:"Operational Safety",    value:`${100 - vendor.operationalRisk}%`, pct:100 - vendor.operationalRisk},
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-black/45">{m.label}</span>
                    <span className="text-gold font-semibold">{m.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-all" style={{width:`${m.pct}%`}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Legal */}
            <div className="glass border border-white/5 rounded-2xl p-5">
              <p className="text-black/30 text-xs uppercase tracking-widest mb-3">Legal Status</p>
              <div className="flex items-center justify-between">
                <span className="text-black/55 text-sm">Active Disputes</span>
                <span className={`font-bold text-xl font-serif ${vendor.legalDisputes === 0 ? "text-gold" : "text-black/60"}`}>
                  {vendor.legalDisputes}
                </span>
              </div>
              <p className="text-black/25 text-xs mt-2">
                {vendor.legalDisputes === 0 ? "✓ No known legal disputes" : `⚠ ${vendor.legalDisputes} dispute(s) on record`}
              </p>
            </div>
          </div>

          {/* Middle + right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Risk trend */}
            <div className="glass border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-black font-semibold">Risk Trend Analysis</p>
                  <p className="text-black/35 text-xs mt-0.5">Last 7 months · Lower score = safer</p>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold text-2xl font-serif">{vendor.riskTrend[vendor.riskTrend.length - 1]}</p>
                  <p className={`text-xs ${vendor.riskTrend[vendor.riskTrend.length-1] < vendor.riskTrend[0] ? "text-gold" : "text-black/40"}`}>
                    {vendor.riskTrend[vendor.riskTrend.length-1] < vendor.riskTrend[0] ? "↓ Improving" : "↑ Worsening"}
                  </p>
                </div>
              </div>
              <TrendChart data={vendor.riskTrend}/>
              <div className="flex justify-between text-[10px] text-black/25 mt-2 px-1">
                {["7mo ago","6mo","5mo","4mo","3mo","2mo","Now"].map((l) => <span key={l}>{l}</span>)}
              </div>
            </div>

            {/* Detailed risk breakdown */}
            <div className="glass border border-white/5 rounded-2xl p-6">
              <p className="text-black font-semibold mb-5">Detailed Risk Breakdown</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {icon:"🏦",label:"Financial Stability",   score:vendor.financialStability,  desc:"Balance sheet, cash flow, debt ratios"},
                  {icon:"⚖️",label:"Legal & Compliance",     score:100 - vendor.legalDisputes * 20, desc:"Disputes, certifications, regulatory"},
                  {icon:"⚙️",label:"Operational Risk",       score:100 - vendor.operationalRisk, desc:"Processes, capacity, delivery"},
                  {icon:"🌍",label:"Geopolitical Exposure",  score:vendor.country === "USA" ? 90 : 65, desc:"Country risk, supply chain location"},
                ].map((r) => (
                  <div key={r.label} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{r.icon}</span>
                      <div>
                        <p className="text-black text-xs font-semibold">{r.label}</p>
                        <p className="text-black/30 text-[10px]">{r.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex-1 mr-3">
                        <div className="h-1.5 rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-gold" style={{width:`${r.score}%`}}/>
                        </div>
                      </div>
                      <span className="text-gold font-bold text-sm shrink-0">{r.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="glass border border-white/5 rounded-2xl p-6">
              <p className="text-black font-semibold mb-4">Compliance & Certifications</p>
              {vendor.compliance.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {vendor.compliance.map((c) => (
                    <div key={c} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-gold border-gold">
                      <span className="text-gold text-xs">✓</span>
                      <span className="text-black text-sm font-medium">{c}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-black/30 text-sm">⚠ No compliance certifications on record</p>
                </div>
              )}
            </div>

            {/* Specialties */}
            <div className="glass border border-white/5 rounded-2xl p-6">
              <p className="text-black font-semibold mb-4">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {vendor.specialty.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-lg glass border border-white/8 text-black/60 text-sm">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight banner */}
        <div className="mt-6 glass-gold border-gold rounded-2xl p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
            <span className="text-xl">✦</span>
          </div>
          <div className="flex-1">
            <p className="text-black font-semibold text-sm">AI Risk Insight</p>
            <p className="text-black/50 text-sm mt-1">
              {vendor.riskLevel === "LOW"
                ? `${vendor.name} shows strong fundamentals with ${vendor.yearsInBusiness} years of operational history and ${vendor.compliance.length} compliance certifications. Low risk for procurement engagement.`
                : vendor.riskLevel === "MEDIUM"
                ? `${vendor.name} carries moderate risk. Monitor financial metrics closely and consider diversifying spend across alternative vendors.`
                : `${vendor.name} is flagged as HIGH risk. We recommend seeking alternative vendors and limiting exposure. See backup suggestions below.`}
            </p>
          </div>
          <Link href="/audit" className="shrink-0 px-5 py-2.5 rounded-xl bg-gold text-navy-900 text-sm font-semibold hover:bg-gold-300 transition-all">
            Full Audit →
          </Link>
        </div>

      </div>
    </main>
  );
}
