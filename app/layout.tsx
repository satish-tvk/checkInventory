import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OneStopSMB — Vendor Risk Intelligence Platform",
  description:
    "Know your vendors before they cost you. AI-powered vendor discovery, risk scoring, and comparison for modern businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmSans.variable}`}>
      <body className="bg-surface-1 text-ink antialiased font-sans">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
