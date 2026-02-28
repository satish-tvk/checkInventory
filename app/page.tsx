"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ErrorBanner from "@/components/ErrorBanner";
import ReportCard from "@/components/ReportCard";
import type { AuditReport } from "@/lib/types";

export default function Home() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAudit(csvText: string) {
    setError(null);
    setReport(null);
    setLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Audit failed. Please try again.");
        return;
      }

      setReport(data as AuditReport);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Supplier Risk Auditor
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Upload a CSV of up to 10 suppliers and get an instant AI-powered risk
          report.
        </p>

        <UploadForm onAudit={handleAudit} loading={loading} />

        {error && <ErrorBanner message={error} />}

        {report && <ReportCard report={report} />}
      </div>
    </main>
  );
}
