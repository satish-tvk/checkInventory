import Link from "next/link";
import { TESTIMONIALS } from "@/lib/mockVendors";

const modules = [
  {
    title: "Vendor Discovery",
    description:
      "Find real vendors by category and geography with country/state filters and optional city or ZIP.",
    href: "/vendors/discover",
    tag: "Live Search",
  },
  {
    title: "Competitor Analysis",
    description:
      "Map local competitors around your business location and surface strategic threats and opportunities.",
    href: "/competitors",
    tag: "Mistral + Tavily",
  },
  {
    title: "Supply Risk Auditor",
    description:
      "Upload supplier CSVs or search vendors, then get review-validated risk scores and backup suggestions.",
    href: "/audit",
    tag: "Risk Intelligence",
  },
  {
    title: "Business Onboarding",
    description:
      "Capture your business profile once and auto-prefill location-aware workflows across the app.",
    href: "/onboarding",
    tag: "Personalized Setup",
  },
];

const steps = [
  {
    id: "01",
    title: "Set Your Operating Context",
    body: "Create your business profile so location, category, and procurement context stay consistent.",
  },
  {
    id: "02",
    title: "Discover and Validate Vendors",
    body: "Search vendors by market, run AI checks, and verify external review trust signals before selection.",
  },
  {
    id: "03",
    title: "Audit and Decide Fast",
    body: "Use scored metrics, risk reasoning, and alternatives to make procurement decisions with confidence.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <section className="relative pt-28 pb-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900" />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 14%, rgba(198,167,94,0.14), transparent 35%), radial-gradient(circle at 84% 70%, rgba(198,167,94,0.10), transparent 42%)",
          }}
        />

        <div className="relative container-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-gold text-gold text-xs font-semibold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              AI Procurement Intelligence
            </span>

            <h1 className="font-serif text-5xl md:text-7xl leading-[1.03] mt-6 text-white">
              Spot Risk.
              <br />
              Pick Winners.
              <br />
              <span className="text-gold-gradient">Move Faster.</span>
            </h1>

            <p className="text-white/55 text-lg mt-6 max-w-xl leading-relaxed">
              VendorIQ combines discovery, competitor mapping, and risk auditing into one location-aware workflow
              for modern procurement teams.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/vendors/discover"
                className="px-6 py-3 rounded-xl bg-gold text-navy-900 font-semibold text-sm hover:bg-gold-300 transition-all glow-gold-sm"
              >
                Start Discovering
              </Link>
              <Link
                href="/audit"
                className="px-6 py-3 rounded-xl glass border-gold text-white font-semibold text-sm hover:bg-white/5 transition-all"
              >
                Run Risk Audit
              </Link>
              <Link
                href="/competitors"
                className="px-6 py-3 rounded-xl glass border border-white/15 text-white/80 font-semibold text-sm hover:text-white hover:border-gold/30 transition-all"
              >
                Analyze Competitors
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass border-gold rounded-3xl p-6 shadow-card">
              <p className="text-white/35 text-xs uppercase tracking-widest mb-4">Decision Panel</p>
              <div className="space-y-4">
                {[
                  { label: "Portfolio Safety", value: "78 / 100", trend: "Up 6% this week" },
                  { label: "Review Validation", value: "84%", trend: "Cross-source consistent" },
                  { label: "High Risk Vendors", value: "2 flagged", trend: "Backups available" },
                  { label: "Markets Covered", value: "12 regions", trend: "Location-aware search" },
                ].map((item) => (
                  <div key={item.label} className="glass rounded-xl p-4 border border-white/8">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-white/50 text-xs uppercase tracking-wide">{item.label}</p>
                      <p className="font-serif text-2xl text-gold leading-none">{item.value}</p>
                    </div>
                    <p className="text-white/35 text-xs mt-2">{item.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="container-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { k: "1", v: "Unified Workflow" },
              { k: "2", v: "Review Validation Metric" },
              { k: "3", v: "Country/State Location Model" },
              { k: "4", v: "Mistral + Tavily Agents" },
            ].map((chip) => (
              <div key={chip.k} className="glass rounded-xl px-4 py-3 border border-white/8 text-center">
                <p className="text-white/30 text-[10px] uppercase tracking-widest">Capability {chip.k}</p>
                <p className="text-white/75 text-sm mt-1">{chip.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy-950">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Platform Modules</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mt-3">Everything You Actually Use</h2>
            <p className="text-white/45 text-lg mt-4 max-w-2xl mx-auto">
              Built around your active product surface: discovery, competitor intelligence, risk audit, and onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modules.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="group glass rounded-2xl p-6 border border-white/8 hover:border-gold/35 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-gold/85 text-[11px] uppercase tracking-widest font-semibold">{m.tag}</p>
                    <h3 className="font-serif text-2xl text-white mt-1 group-hover:text-gold transition-colors">{m.title}</h3>
                  </div>
                  <span className="text-gold/70 text-sm">↗</span>
                </div>
                <p className="text-white/55 text-sm mt-3 leading-relaxed">{m.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy-900">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Workflow</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mt-3">From Data to Decision in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s) => (
              <div key={s.id} className="relative glass rounded-2xl p-6 border border-white/8">
                <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gold text-navy-900 text-[10px] font-bold">
                  {s.id}
                </span>
                <h3 className="font-serif text-2xl text-white mt-4">{s.title}</h3>
                <p className="text-white/50 text-sm mt-3 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy-950">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Voice of Customer</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mt-3">What Teams Say After Switching</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="glass-gold rounded-2xl p-6 border-gold-bright">
                <p className="text-gold text-xs mb-3">★★★★★</p>
                <p className="text-white/70 text-sm leading-relaxed italic">“{t.quote}”</p>
                <div className="mt-5 pt-4 border-t border-gold/20">
                  <p className="text-white font-semibold text-sm">{t.author}</p>
                  <p className="text-white/35 text-xs mt-0.5">
                    {t.title} · {t.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy-900">
        <div className="container-xl text-center">
          <h2 className="font-serif text-5xl md:text-6xl text-white leading-tight">
            Procurement Intelligence
            <br />
            <span className="text-gold-gradient">Without the Guesswork</span>
          </h2>
          <p className="text-white/45 text-lg mt-5 max-w-2xl mx-auto">
            Bring vendor discovery, competitor context, and risk validation into a single operating rhythm.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/onboarding"
              className="px-8 py-3.5 rounded-xl bg-gold text-navy-900 font-semibold text-sm hover:bg-gold-300 transition-all glow-gold-sm"
            >
              Start Setup
            </Link>
            <Link
              href="/vendors/discover"
              className="px-8 py-3.5 rounded-xl glass border-gold text-white font-semibold text-sm hover:bg-white/5 transition-all"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
