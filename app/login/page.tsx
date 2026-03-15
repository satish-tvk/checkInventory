"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router    = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail ?? data.error ?? "Login failed."); return; }
      login({ token: data.token, user_id: data.user_id, username: data.username });
      router.push("/");
    } catch {
      setError("Network error — please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{
        background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 40%, #E0F2FE 100%)",
      }}
    >
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0D5CFF, #0046D6)", boxShadow: "0 4px 16px rgba(13,92,255,0.40)" }}
            >
              <span className="text-black text-sm font-black">O</span>
            </div>
            <span className="font-serif text-lg font-semibold text-ink">
              OneStop<span className="text-brand-600">SMB</span>
            </span>
          </Link>

          <h1 className="font-serif text-[38px] font-semibold text-ink leading-tight">
            Welcome back
          </h1>
          <p className="text-ink/60 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl p-7 border border-ink/[0.07]" style={{ boxShadow: "0 20px 80px rgba(19,16,58,0.14)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-ink/70 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
                placeholder="your-username"
                autoComplete="username"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl text-ink placeholder-ink/25 text-sm focus:outline-none transition-all disabled:opacity-50 bg-surface-1 border border-ink/[0.10] focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-ink/70 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-ink placeholder-ink/25 text-sm focus:outline-none transition-all disabled:opacity-50 bg-surface-1 border border-ink/[0.10] focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
                >
                  {showPwd ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-rose-700 text-sm bg-rose-50 border border-rose-200">
                <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-black font-semibold text-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              style={{
                background: "linear-gradient(135deg, #0D5CFF, #0046D6)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(13,92,255,0.40)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-ink/[0.06] text-center">
            <p className="text-ink/60 text-sm">
              No account?{" "}
              <Link href="/onboarding" className="text-brand-600 hover:text-brand-700 transition-colors font-semibold">
                Create one during onboarding
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
