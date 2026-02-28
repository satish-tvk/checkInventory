"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { SAMPLE_CSV } from "@/lib/mockData";

interface UploadFormProps {
  onAudit: (csvText: string) => void;
  loading: boolean;
}

const REQUIRED_COLUMNS = ["name", "category", "spend_pct", "country"];
const MAX_ROWS = 10;

export default function UploadForm({ onAudit, loading }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  function handleDownloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_suppliers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = Papa.parse<Record<string, string>>(text.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        setClientError("Could not parse CSV: " + parsed.errors[0].message);
        return;
      }

      // Column check
      const headers = parsed.meta.fields ?? [];
      const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
      if (missing.length > 0) {
        setClientError(`CSV is missing columns: ${missing.join(", ")}`);
        return;
      }

      // Row count
      if (parsed.data.length === 0) {
        setClientError("CSV has no data rows.");
        return;
      }
      if (parsed.data.length > MAX_ROWS) {
        setClientError(`Maximum ${MAX_ROWS} rows allowed (found ${parsed.data.length}).`);
        return;
      }

      // Spend total
      const total = parsed.data.reduce((sum, row) => {
        return sum + (parseFloat(row.spend_pct) || 0);
      }, 0);
      if (total > 100.01) {
        setClientError(`spend_pct values sum to ${total.toFixed(1)}% — must be ≤ 100%.`);
        return;
      }

      onAudit(text);
    };
    reader.readAsText(file);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Upload supplier CSV</span>
        <button
          type="button"
          onClick={handleDownloadSample}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          Download sample CSV
        </button>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-10 hover:bg-gray-100">
        <svg
          className="mb-2 h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className="text-sm text-gray-500">
          {loading ? "Auditing…" : "Click to select a CSV file"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
        />
      </label>

      {clientError && (
        <p className="mt-3 text-sm text-red-600">{clientError}</p>
      )}
    </div>
  );
}
