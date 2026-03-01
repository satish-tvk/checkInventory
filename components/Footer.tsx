import Link from "next/link";

const footerCols = [
  {
    title: "Product",
    links: [
      { label: "Vendor Discovery", href: "/vendors/discover" },
      { label: "Competitor Analysis", href: "/competitors" },
      { label: "Risk Audit", href: "/audit" },
      { label: "Get Profiled", href: "/onboarding" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                <span className="text-navy-900 text-sm font-bold">V</span>
              </div>
              <span className="font-serif text-xl font-bold text-white">
                Vendor<span className="text-gold">IQ</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              AI-powered vendor risk intelligence for modern businesses. Discover faster, validate better, decide with confidence.
            </p>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-semibold mb-4 tracking-wide">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/35 text-sm hover:text-gold transition-colors duration-150">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">© 2026 VendorIQ Inc. All rights reserved.</p>
          <p className="text-white/15 text-xs">Powered by AI · Built for modern procurement</p>
        </div>
      </div>
    </footer>
  );
}
