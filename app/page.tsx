import Link from "next/link";
import { TESTIMONIALS } from "@/lib/mockVendors";
import PersonalizedHero from "@/components/PersonalizedHero";
import PersonalizedPanel from "@/components/PersonalizedPanel";

const modules = [
  {
    title:       "Vendor Discovery",
    description: "Find real vendors by category and geography with country/state filters and optional city or ZIP.",
    href:        "/vendors/discover",
    tag:         "Live Search",
    icon:        "🔍",
    accent: {
      tag:   "bg-teal-100 text-teal-700 border border-teal-200",
      hover: "hover:border-teal-300 hover:shadow-[0_8px_40px_rgba(13,148,136,0.14)]",
      title: "group-hover:text-teal-700",
      arrow: "text-teal-300 group-hover:text-teal-500",
      icon:  "bg-teal-50",
    },
  },
  {
    title:       "Competitor Analysis",
    description: "Map local competitors around your business location and surface strategic threats and opportunities.",
    href:        "/competitors",
    tag:         "Market Intel",
    icon:        "📊",
    accent: {
      tag:   "bg-brand-100 text-brand-700 border border-brand-200",
      hover: "hover:border-brand-300 hover:shadow-[0_8px_40px_rgba(124,58,237,0.14)]",
      title: "group-hover:text-brand-700",
      arrow: "text-brand-300 group-hover:text-brand-500",
      icon:  "bg-brand-50",
    },
  },
  {
    title:       "Supply Risk Auditor",
    description: "Upload supplier CSVs, get review-validated risk scores and backup vendor recommendations instantly.",
    href:        "/audit",
    tag:         "Risk Intelligence",
    icon:        "🛡️",
    accent: {
      tag:   "bg-rose-100 text-rose-700 border border-rose-200",
      hover: "hover:border-rose-300 hover:shadow-[0_8px_40px_rgba(244,63,94,0.12)]",
      title: "group-hover:text-rose-600",
      arrow: "text-rose-300 group-hover:text-rose-500",
      icon:  "bg-rose-50",
    },
  },
  {
    title:       "Business Onboarding",
    description: "Capture your profile once and auto-prefill location-aware workflows across the entire platform.",
    href:        "/onboarding",
    tag:         "Personalized Setup",
    icon:        "⚡",
    accent: {
      tag:   "bg-amber-100 text-amber-700 border border-amber-200",
      hover: "hover:border-amber-300 hover:shadow-[0_8px_40px_rgba(245,158,11,0.12)]",
      title: "group-hover:text-amber-700",
      arrow: "text-amber-300 group-hover:text-amber-500",
      icon:  "bg-amber-50",
    },
  },
];

const steps = [
  {
    id:    "01",
    title: "Set Your Context",
    body:  "Create your business profile so location, category, and procurement context stay consistent across every tool.",
    bg:    "bg-brand-600",
  },
  {
    id:    "02",
    title: "Discover & Validate",
    body:  "Search vendors by market, run AI checks, and verify external review trust signals before committing.",
    bg:    "bg-teal-600",
  },
  {
    id:    "03",
    title: "Audit & Decide",
    body:  "Use scored metrics, risk reasoning, and backup alternatives to make procurement decisions with confidence.",
    bg:    "bg-rose-500",
  },
];

const capabilities = [
  { label: "Unified Workflow",       cls: "bg-brand-100 text-brand-700 border border-brand-200" },
  { label: "Review Validation",      cls: "bg-teal-100 text-teal-700 border border-teal-200"   },
  { label: "Location Intelligence",  cls: "bg-sky-100 text-sky-700 border border-sky-200"       },
  { label: "Competitor Intelligence", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
];

const testimonialAccents = [
  "border-l-brand-400",
  "border-l-teal-400",
  "border-l-rose-400",
];

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 px-6 bg-white">
        {/* Colorful gradient blobs */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 900px 700px at 5% 15%, rgba(124,58,237,0.07), transparent 55%), " +
              "radial-gradient(ellipse 700px 600px at 90% 75%, rgba(13,148,136,0.06), transparent 55%), " +
              "radial-gradient(ellipse 500px 400px at 60% 5%, rgba(14,165,233,0.05), transparent 50%)",
          }}
        />
        <div className="relative container-xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <PersonalizedHero />
          </div>
          <div className="lg:col-span-5">
            <PersonalizedPanel />
          </div>
        </div>
      </section>

      {/* ── Capability chips ── */}
      <section className="px-6 py-5 bg-surface-2 border-y border-brand-100">
        <div className="container-xl">
          <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
            {capabilities.map((c) => (
              <span key={c.label} className={`px-4 py-2 rounded-full text-sm font-semibold ${c.cls}`}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform modules ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <div className="mb-14">
            <span className="tag-brand mb-5 inline-flex">Platform Modules</span>
            <h2 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
              Everything You Actually Use
            </h2>
            <p className="text-ink/65 text-base mt-4 max-w-xl leading-relaxed">
              Built around your active product surface — discovery, competitor intelligence,
              risk audit, and onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modules.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className={`group p-7 rounded-2xl border border-ink/[0.07] bg-white transition-all duration-200 shadow-card ${m.accent.hover}`}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${m.accent.icon}`}>
                    {m.icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m.accent.tag}`}>
                    {m.tag}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className={`font-serif text-2xl text-ink mb-2 transition-colors duration-200 ${m.accent.title}`}>
                      {m.title}
                    </h3>
                    <p className="text-ink/65 text-sm leading-relaxed">{m.description}</p>
                  </div>
                  <svg
                    className={`w-5 h-5 shrink-0 transition-colors ${m.accent.arrow}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-step workflow ── */}
      <section className="section-pad bg-surface-1">
        <div className="container-xl">
          <div className="mb-14">
            <span className="tag-teal mb-5 inline-flex">Workflow</span>
            <h2 className="font-serif text-4xl md:text-5xl text-ink">
              From Data to Decision in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s) => (
              <div
                key={s.id}
                className="p-7 rounded-2xl border border-ink/[0.07] bg-white shadow-card"
              >
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-5`}>
                  <span className="text-black font-mono text-sm font-bold">{s.id}</span>
                </div>
                <h3 className="font-serif text-xl text-ink mb-3">{s.title}</h3>
                <p className="text-ink/65 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <div className="mb-14">
            <span className="tag-amber mb-5 inline-flex">Voice of Customer</span>
            <h2 className="font-serif text-4xl md:text-5xl text-ink">
              What Teams Say After Switching
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.id}
                className={`p-7 rounded-2xl border border-ink/[0.07] bg-white shadow-card border-l-4 ${testimonialAccents[i % 3]}`}
              >
                <p className="text-amber-400 text-sm mb-4 tracking-widest">★★★★★</p>
                <p className="text-ink/75 text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-5 border-t border-ink/[0.06]">
                  <p className="text-ink font-semibold text-sm">{t.author}</p>
                  <p className="text-ink/55 text-xs mt-0.5">{t.title} · {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="section-pad"
        style={{ background: "linear-gradient(135deg, #0038AB 0%, #0D5CFF 45%, #059669 100%)" }}
      >
        <div className="container-xl">
          <div className="max-w-2xl">
            <p className="text-black/60 text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
              Get Started
            </p>
            <h2 className="font-serif text-5xl md:text-6xl text-black leading-tight mb-5">
              Procurement Intelligence{" "}
              <span style={{
                background: "linear-gradient(135deg, #C4B5FD, #5EEAD4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Without the Guesswork
              </span>
            </h2>
            <p className="text-black/75 text-base leading-relaxed mb-8 max-w-lg">
              Bring vendor discovery, competitor context, and risk validation into a single
              operating rhythm — built for how modern teams actually work.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/onboarding"
                className="px-6 py-3 rounded-xl bg-white text-brand-800 font-semibold text-sm hover:bg-surface-1 transition-colors duration-150"
              >
                Start setup
              </Link>
              <Link
                href="/vendors/discover"
                className="px-6 py-3 rounded-xl border border-white/25 text-black/80 font-medium text-sm hover:text-black hover:border-white/45 transition-all duration-150"
              >
                Explore features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
