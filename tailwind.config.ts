import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand primary: Violet ──
        brand: {
          DEFAULT: "#0D5CFF",
          50:  "#ECF3FF",
          100: "#D7E7FF",
          200: "#B4D2FF",
          300: "#82B5FF",
          400: "#4E95FF",
          500: "#2378FF",
          600: "#0D5CFF",
          700: "#0046D6",
          800: "#0038AB",
          900: "#022C84",
        },
        // ── Light surface tokens ──
        surface: {
          DEFAULT: "#FFFFFF",
          1: "#D8E2EF",
          2: "#C8D5E6",
          3: "#B8C8DC",
        },
        // ── Ink (text) tokens ──
        ink: {
          DEFAULT: "#0B1426",
          muted:   "#44516B",
          faint:   "#7B879F",
          subtle:  "#B2BDD2",
        },
        // ── Keep navy/gold for backward compat (VendorDiscoverPanel, onboarding) ──
        navy: {
          DEFAULT: "#0C0C22",
          50:  "#EBEBF8",
          100: "#CDCDF0",
          200: "#9999DC",
          300: "#6666C0",
          400: "#4444A8",
          500: "#282880",
          600: "#1C1C60",
          700: "#121240",
          800: "#0C0C28",
          900: "#07071A",
          950: "#040410",
        },
        gold: {
          DEFAULT: "#F2B233",
          50:  "#FFF7E8",
          100: "#FFEBC1",
          200: "#FFDA84",
          300: "#FFC84D",
          400: "#F4B43F",
          500: "#F2B233",
          600: "#D79217",
          700: "#AB720F",
          800: "#7A510A",
          900: "#4B3206",
        },
      },
      fontFamily: {
        serif: ["var(--font-heading)", "Georgia", "serif"],
        sans:  ["var(--font-body)", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-in-up":  "fadeInUp 0.6s ease-out forwards",
        "fade-in":     "fadeIn 0.4s ease-out forwards",
        "slide-right": "slideRight 0.5s ease-out forwards",
        "float":       "float 6s ease-in-out infinite",
        "shimmer":     "shimmer 2.5s infinite",
        "glow":        "glow 3s ease-in-out infinite",
        "spin-slow":   "spin 20s linear infinite",
        "pulse-slow":  "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 16px rgba(13,92,255,0.18)" },
          "50%":      { boxShadow: "0 0 40px rgba(13,92,255,0.42)" },
        },
      },
      boxShadow: {
        "brand":    "0 4px 24px rgba(13,92,255,0.30)",
        "brand-lg": "0 8px 48px rgba(13,92,255,0.35)",
        "card":     "0 2px 16px rgba(19,16,58,0.06)",
        "card-lg":  "0 8px 40px rgba(19,16,58,0.10)",
        "card-xl":  "0 20px 80px rgba(19,16,58,0.14)",
        "gold":     "0 0 24px rgba(198,167,94,0.18)",
        "gold-lg":  "0 0 48px rgba(198,167,94,0.28)",
        "navy":     "0 20px 60px rgba(4,4,16,0.90)",
      },
    },
  },
  plugins: [],
};

export default config;
