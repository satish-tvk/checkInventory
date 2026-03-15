import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    desc: "Perfect for small teams getting started with vendor risk management.",
    features: [
      "Up to 50 vendors/month",
      "Basic AI risk scoring",
      "Email alerts",
      "CSV import & export",
      "Risk score history (30 days)",
      "Standard support",
    ],
    notIncluded: [
      "Real-time monitoring",
      "Vendor comparison",
      "API access",
      "Custom reports",
    ],
    cta: "Start Free Trial",
    ctaHref: "/audit",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    desc: "For growing businesses with active supply chains and procurement teams.",
    features: [
      "Up to 500 vendors/month",
      "Advanced AI risk analysis",
      "Real-time monitoring & alerts",
      "Vendor comparison (up to 5)",
      "Risk trend analytics",
      "API access",
      "Priority email & chat support",
      "Custom risk reports",
      "90-day history",
    ],
    notIncluded: [
      "Dedicated analyst",
      "White-label reports",
      "SSO / SAML",
    ],
    cta: "Start Free Trial",
    ctaHref: "/audit",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large organizations with complex supply chains and enterprise requirements.",
    features: [
      "Unlimited vendors",
      "Custom AI risk models",
      "Dedicated risk analyst",
      "White-label PDF reports",
      "SSO & SAML authentication",
      "Advanced API with webhooks",
      "Unlimited comparisons",
      "Full history & audit trail",
      "SLA guarantee (99.9% uptime)",
      "Custom data integrations",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    ctaHref: "#",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes. All Starter and Professional plans include a 14-day free trial with full access. No credit card required to start.",
  },
  {
    q: "How does vendor analysis work?",
    a: "Our AI researches each vendor via live web data, financial filings, compliance databases, and news sources to generate a comprehensive risk score in real time.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Absolutely. You can change your plan at any time. Upgrades take effect immediately; downgrades take effect at the next billing cycle.",
  },
  {
    q: "What data sources do you use?",
    a: "We aggregate data from 200+ sources including SEC filings, OFAC lists, news APIs, compliance databases (ISO, SOC, GDPR), and proprietary geopolitical risk models.",
  },
  {
    q: "Is my vendor data secure?",
    a: "Yes. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II compliant and never share your data with third parties.",
  },
  {
    q: "Do you offer custom pricing for large teams?",
    a: "Yes. Contact our sales team for volume discounts, custom feature requirements, and dedicated onboarding support.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Pricing</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-black mt-3 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-black/45 text-xl max-w-lg mx-auto">
            Start free. Scale as you grow. No hidden fees, no surprise bills.
          </p>
          {/* Toggle (visual only) */}
          <div className="inline-flex items-center gap-1 glass border border-white/8 rounded-full px-1.5 py-1.5 mt-8">
            <button className="px-5 py-2 rounded-full bg-gold text-navy-900 text-sm font-semibold">Monthly</button>
            <button className="px-5 py-2 rounded-full text-black/50 text-sm font-medium hover:text-black transition-colors">
              Annual <span className="text-gold text-xs ml-1">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col transition-all ${
                plan.highlight
                  ? "glass-gold border-gold-bright glow-gold"
                  : "glass border border-white/5 hover:border-white/10"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gold text-navy-900 text-xs font-bold shadow-gold whitespace-nowrap">
                  ★ Most Popular
                </div>
              )}

              {/* Plan name & price */}
              <div className="mb-8">
                <p className={`text-sm font-semibold tracking-wide mb-2 ${plan.highlight ? "text-gold" : "text-black/50"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-3">
                  <span className="font-serif text-5xl font-bold text-black">{plan.price}</span>
                  {plan.period && <span className="text-black/35 text-base mb-2">{plan.period}</span>}
                </div>
                <p className="text-black/40 text-sm leading-relaxed">{plan.desc}</p>
              </div>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`block text-center px-6 py-3.5 rounded-xl text-sm font-semibold transition-all mb-8 ${
                  plan.highlight
                    ? "bg-gold text-navy-900 hover:bg-gold-300 glow-gold-sm"
                    : "glass border-gold text-black hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Divider */}
              <div className="border-t border-white/8 mb-6"/>

              {/* Features */}
              <div className="space-y-3 flex-1">
                <p className="text-black/30 text-xs uppercase tracking-widest mb-4">What&apos;s included</p>
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-gold mt-0.5 shrink-0">✓</span>
                    <span className="text-black/65 text-sm">{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-start gap-3 opacity-40">
                    <span className="text-black/30 mt-0.5 shrink-0">✗</span>
                    <span className="text-black/40 text-sm line-through">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="mb-20">
          <h2 className="font-serif text-3xl font-bold text-black text-center mb-10">Full Feature Comparison</h2>
          <div className="glass border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 border-b border-white/5 bg-white/[0.02]">
              <div className="px-6 py-4 text-black/30 text-xs uppercase tracking-widest">Feature</div>
              {["Starter","Professional","Enterprise"].map((p) => (
                <div key={p} className="px-6 py-4 text-center border-l border-white/5">
                  <p className="text-black font-semibold text-sm">{p}</p>
                </div>
              ))}
            </div>
            {[
              {feature:"Vendors / month",      vals:["50","500","Unlimited"]},
              {feature:"AI risk analysis",      vals:["Basic","Advanced","Custom"]},
              {feature:"Real-time monitoring",  vals:["✗","✓","✓"]},
              {feature:"Vendor comparison",     vals:["✗","Up to 5","Unlimited"]},
              {feature:"API access",            vals:["✗","✓","✓ + Webhooks"]},
              {feature:"Custom reports",        vals:["✗","✓","White-label"]},
              {feature:"Data history",          vals:["30 days","90 days","Unlimited"]},
              {feature:"SSO / SAML",            vals:["✗","✗","✓"]},
              {feature:"Dedicated analyst",     vals:["✗","✗","✓"]},
              {feature:"SLA guarantee",         vals:["✗","99.5%","99.9%"]},
              {feature:"Support",               vals:["Email","Priority chat","Dedicated"]},
            ].map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-4 border-b border-white/5 last:border-b-0 ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`}>
                <div className="px-6 py-4 text-black/55 text-sm">{row.feature}</div>
                {row.vals.map((v, j) => (
                  <div key={j} className="px-6 py-4 text-center border-l border-white/5">
                    <span className={`text-sm ${v === "✗" ? "text-black/20" : v === "✓" ? "text-gold" : "text-black/70"}`}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="font-serif text-3xl font-bold text-black text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="glass border border-white/5 rounded-xl p-6 hover:border-gold/20 transition-colors">
                <p className="text-black font-semibold text-sm mb-2">{faq.q}</p>
                <p className="text-black/45 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center glass-gold border-gold rounded-3xl p-12 glow-gold">
          <h2 className="font-serif text-4xl font-bold text-black mb-4">Ready to protect your supply chain?</h2>
          <p className="text-black/45 text-lg mb-8">Start your 14-day free trial today. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/audit"  className="px-8 py-3.5 rounded-xl bg-gold text-navy-900 font-bold text-sm hover:bg-gold-300 transition-all glow-gold-sm">Start Free Trial</Link>
            <Link href="#"       className="px-8 py-3.5 rounded-xl glass border-gold text-black font-semibold text-sm hover:bg-white/5 transition-all">Talk to Sales</Link>
          </div>
        </div>

      </div>
    </main>
  );
}
