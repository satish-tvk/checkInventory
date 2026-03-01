"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",                 label: "Home" },
  { href: "/vendors/discover", label: "Discover" },
  { href: "/competitors",      label: "Competitors" },
  { href: "/audit",            label: "Risk Audit" },
  { href: "/onboarding",       label: "Get Profiled" },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-dark shadow-navy py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shrink-0 group-hover:glow-gold transition-all">
            <span className="text-navy-900 text-sm font-bold font-sans">V</span>
          </div>
          <span className="font-serif text-xl font-bold text-white tracking-tight">
            Vendor<span className="text-gold">IQ</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                pathname === link.href
                  ? "text-gold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/audit"
            className="px-5 py-2 rounded-lg bg-gold text-navy-900 text-sm font-semibold hover:bg-gold-300 transition-all duration-200 glow-gold-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden glass-dark border-t border-white/5 px-6 py-5 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-sm font-medium py-2.5 transition-colors ${
                pathname === link.href ? "text-gold" : "text-white/70 hover:text-white"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            <Link
              href="/audit"
              className="block text-center px-5 py-2.5 rounded-lg bg-gold text-navy-900 text-sm font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
