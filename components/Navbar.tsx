"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/",            label: "Home" },
  { href: "/competitors", label: "Competitors" },
  { href: "/audit",       label: "VendorIQ" },
  { href: "/onboarding",  label: "Onboard" },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/96 backdrop-blur-2xl border-b border-ink/[0.08] shadow-card"
          : "bg-white/85 backdrop-blur-xl border-b border-ink/[0.04]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-[28px] h-[28px] rounded-[7px] bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-black text-[12px] font-black tracking-tight">O</span>
          </div>
          <span className="font-serif text-[17px] font-semibold text-ink tracking-tight">
            OneStop<span className="text-brand-600">SMB</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                pathname === link.href
                  ? "text-brand-700 bg-brand-50 font-semibold"
                  : "text-ink/65 hover:text-ink hover:bg-ink/[0.06]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <span className="text-ink/55 text-sm">
                <span className="text-ink/80 font-medium">{user.username}</span>
              </span>
              <button
                onClick={logout}
                className="px-3.5 py-1.5 rounded-lg border border-ink/[0.18] text-ink/65 text-sm font-medium hover:text-ink hover:border-ink/35 transition-all duration-150"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg border border-ink/[0.18] text-ink/65 text-sm font-medium hover:text-ink hover:border-ink/35 transition-all duration-150"
              >
                Sign in
              </Link>
              <Link
                href="/onboarding"
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-black text-sm font-semibold hover:bg-brand-700 transition-colors duration-150"
                style={{ boxShadow: "0 2px 12px rgba(124,58,237,0.35)" }}
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-ink/45 hover:text-ink transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-ink/[0.07] px-6 py-4 shadow-card-lg">
          <div className="space-y-0.5 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-brand-700 bg-brand-50 font-semibold"
                    : "text-ink/65 hover:text-ink hover:bg-ink/[0.05]"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-ink/[0.06] space-y-2">
            {user ? (
              <>
                <p className="text-ink/50 text-xs px-3">
                  Signed in as <span className="text-ink/80 font-medium">{user.username}</span>
                </p>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-ink/45 hover:text-ink transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-ink/50 hover:text-ink transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-2.5 rounded-xl bg-brand-600 text-black text-sm font-semibold hover:bg-brand-700 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
