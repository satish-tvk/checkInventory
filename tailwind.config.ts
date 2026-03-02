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
        navy: {
          DEFAULT: "#1B3352",
          50:  "#E8EEF4",
          100: "#C5D4E2",
          200: "#9FB7CC",
          300: "#7899B6",
          400: "#5A80A4",
          500: "#3C6791",
          600: "#3B5F86",
          700: "#2E4D72",
          800: "#244160",
          900: "#1B3352",
          950: "#142A44",
        },
        gold: {
          DEFAULT: "#C6A75E",
          50:  "#FAF4E8",
          100: "#F2E5C3",
          200: "#E8D5A0",
          300: "#D4BB7A",
          400: "#C6A75E",
          500: "#B8933D",
          600: "#9A7A2F",
          700: "#7A6124",
          800: "#5C4819",
          900: "#3D300F",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans:  ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in-up":  "fadeInUp 0.7s ease-out forwards",
        "fade-in":     "fadeIn 0.5s ease-out forwards",
        "slide-right": "slideRight 0.6s ease-out forwards",
        "float":       "float 6s ease-in-out infinite",
        "shimmer":     "shimmer 2.5s infinite",
        "glow":        "glow 3s ease-in-out infinite",
        "spin-slow":   "spin 20s linear infinite",
        "pulse-slow":  "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-16px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(198,167,94,0.15)" },
          "50%":      { boxShadow: "0 0 50px rgba(198,167,94,0.45)" },
        },
      },
      boxShadow: {
        "gold":    "0 0 30px rgba(198,167,94,0.25)",
        "gold-lg": "0 0 60px rgba(198,167,94,0.35)",
        "navy":    "0 20px 60px rgba(6,14,23,0.8)",
        "card":    "0 4px 32px rgba(6,14,23,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
