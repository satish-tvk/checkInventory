import Link from "next/link";

const footerCols = [
  {
    title: "Product",
    links: [
      { label: "Vendor Discovery",   href: "/vendors/discover" },
      { label: "Competitor Analysis", href: "/competitors" },
      { label: "Risk Audit",          href: "/audit" },
      { label: "Onboarding",          href: "/onboarding" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",    href: "#" },
      { label: "Blog",     href: "#" },
      { label: "Careers",  href: "#" },
      { label: "Contact",  href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy",   href: "#" },
      { label: "Terms",     href: "#" },
      { label: "Security",  href: "#" },
      { label: "Cookies",   href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(135deg, #0B1426 0%, #0D2060 100%)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-[28px] h-[28px] rounded-[6px] bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-black text-[12px] font-black">O</span>
              </div>
              <span className="font-serif text-[17px] font-semibold text-black">
                OneStop<span className="text-brand-300">SMB</span>
              </span>
            </Link>
            <p className="text-black/35 text-sm leading-relaxed max-w-[210px]">
              AI-powered vendor risk intelligence for modern procurement teams.
            </p>
            {/* Color accent dots */}
            <div className="flex gap-2 mt-6">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-400 opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 opacity-80" />
            </div>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="text-black/30 text-[10px] font-semibold uppercase tracking-[0.18em] mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-black/40 text-sm hover:text-black/85 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-black/20 text-xs">© 2026 OneStopSMB Inc.</p>
          <p className="text-black/15 text-[11px] tracking-widest uppercase">
            AI · Procurement Intelligence
          </p>
        </div>
      </div>
    </footer>
  );
}
