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
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleDownloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_suppliers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function processFile(file: File) {
    setClientError(null);
    setFileName(file.name);
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

      const headers = parsed.meta.fields ?? [];
      const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
      if (missing.length > 0) {
        setClientError(`CSV is missing columns: ${missing.join(", ")}`);
        return;
      }

      if (parsed.data.length === 0) {
        setClientError("CSV has no data rows.");
        return;
      }
      if (parsed.data.length > MAX_ROWS) {
        setClientError(`Maximum ${MAX_ROWS} rows allowed (found ${parsed.data.length}).`);
        return;
      }

      const total = parsed.data.reduce((sum, row) => sum + (parseFloat(row.spend_pct) || 0), 0);
      if (total > 100.01) {
        setClientError(`spend_pct values sum to ${total.toFixed(1)}% — must be ≤ 100%.`);
        return;
      }

      onAudit(text);
    };
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-black/40 text-xs">Accepts .csv files up to 10 rows</span>
        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 text-gold text-xs font-medium hover:text-gold-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download sample CSV
        </button>
      </div>

      <label
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 cursor-pointer transition-all ${
          dragging
            ? "border-gold bg-gold/5"
            : loading
            ? "border-white/10 bg-white/[0.02] cursor-not-allowed opacity-60"
            : "border-white/10 bg-white/[0.02] hover:border-gold/40 hover:bg-gold/[0.03]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {fileName && !clientError ? (
          <>
            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-black font-medium text-sm">{fileName}</p>
            <p className="text-gold text-xs mt-1">File loaded — running audit…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-black/60 text-sm font-medium">
              {loading ? "Processing…" : "Drop your CSV here or click to browse"}
            </p>
            <p className="text-black/25 text-xs mt-1.5">CSV · max 10 suppliers · columns: name, category, spend_pct, country</p>
          </>
        )}
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
        <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-red-400 text-sm">{clientError}</p>
        </div>
      )}
    </div>
  );
}
