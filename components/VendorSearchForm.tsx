"use client";

import { useMemo, useState } from "react";
import { City, Country, State } from "country-state-city";
import type { PlaceResult } from "@/lib/googlePlaces";

interface VendorSearchFormProps {
  onAudit: (csvText: string) => void;
  loading: boolean;
}

const PRIORITY_COUNTRIES = ["US", "GB", "CA", "AU", "DE", "FR", "IN", "SG", "JP", "AE"];

export default function VendorSearchForm({ onAudit, loading }: VendorSearchFormProps) {
  const [category, setCategory] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const countries = useMemo(() => {
    const all = Country.getAllCountries();
    const priority = PRIORITY_COUNTRIES.map((code) => all.find((c) => c.isoCode === code)).filter(Boolean) as typeof all;
    return [...priority, ...all.filter((c) => !PRIORITY_COUNTRIES.includes(c.isoCode))];
  }, []);

  const states = useMemo(() => State.getStatesOfCountry(countryCode), [countryCode]);
  const cities = useMemo(() => (stateCode ? City.getCitiesOfState(countryCode, stateCode) : []), [countryCode, stateCode]);

  const countryName = Country.getCountryByCode(countryCode)?.name ?? countryCode;
  const stateName = states.find((s) => s.isoCode === stateCode)?.name ?? "";
  const isSearchDisabled = !category.trim() || !countryCode || !stateCode;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResults([]);
    setSelectedIds(new Set());
    if (isSearchDisabled) return;

    setIsSearching(true);
    try {
      const res = await fetch("/api/vendors/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.trim(),
          country: countryName,
          state: stateName,
          city: cityName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to search vendors.");
      } else {
        setResults(data.places || []);
        if (data.places?.length === 0) {
          setError("No vendors found for that category and location.");
        }
      }
    } catch {
      setError("Network error occurred during search.");
    } finally {
      setIsSearching(false);
    }
  }

  function toggleSelection(placeId: string) {
    const next = new Set(selectedIds);
    if (next.has(placeId)) next.delete(placeId);
    else next.add(placeId);
    setSelectedIds(next);
  }

  function toggleAll() {
    if (selectedIds.size === results.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(results.map((r) => r.place_id)));
  }

  function handleAuditSelected() {
    if (selectedIds.size === 0) return;
    const selectedVendors = results.filter((r) => selectedIds.has(r.place_id));
    const header = "name, category, spend_pct, country\n";
    const rows = selectedVendors
      .map((vendor) => {
        let safeName = vendor.name;
        if (safeName.includes(",") || safeName.includes("\"")) {
          safeName = `"${safeName.replace(/"/g, "\"\"")}"`;
        }
        return `${safeName}, ${category}, 0, ${countryName}`;
      })
      .join("\n");
    onAudit(header + rows);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-white/60 text-xs font-semibold uppercase tracking-widest mb-1.5">
            Business Category <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Electronics, Catering, Logistics"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-white/60 text-xs font-semibold uppercase tracking-widest mb-1.5">
            Country <span className="text-red-400">*</span>
          </label>
          <select
            value={countryCode}
            onChange={(e) => {
              setCountryCode(e.target.value);
              setStateCode("");
              setCityName("");
            }}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
          >
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode} className="bg-navy-900">
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white/60 text-xs font-semibold uppercase tracking-widest mb-1.5">
            State / Province <span className="text-red-400">*</span>
          </label>
          <select
            value={stateCode}
            onChange={(e) => {
              setStateCode(e.target.value);
              setCityName("");
            }}
            disabled={states.length === 0}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all disabled:opacity-50"
          >
            <option value="" className="bg-navy-900 text-white/40">
              {states.length === 0 ? "No states available" : "Select state..."}
            </option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode} className="bg-navy-900">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/60 text-xs font-semibold uppercase tracking-widest mb-1.5">
            City (Optional)
          </label>
          <select
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            disabled={!stateCode || cities.length === 0}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all disabled:opacity-50"
          >
            <option value="" className="bg-navy-900 text-white/40">
              {!stateCode ? "Select state first" : cities.length === 0 ? "No cities available" : "Select city (optional)..."}
            </option>
            {cities.map((c) => (
              <option key={`${c.name}-${c.stateCode}`} value={c.name} className="bg-navy-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 mt-2">
          <button
            type="submit"
            disabled={isSearchDisabled || isSearching || loading}
            className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-3.5 rounded-xl border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching Google Places...
              </>
            ) : (
              "Search Vendors"
            )}
          </button>
        </div>
      </form>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-200 text-sm">{error}</div>}

      {results.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              Found {results.length} Vendors
              <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">{selectedIds.size} selected</span>
            </h3>
            <button type="button" onClick={toggleAll} className="text-gold/80 hover:text-gold text-sm transition-colors">
              {selectedIds.size === results.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {results.map((place) => (
              <label
                key={place.place_id}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedIds.has(place.place_id) ? "bg-gold/10 border-gold/40" : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(place.place_id)}
                    onChange={() => toggleSelection(place.place_id)}
                    className="w-4 h-4 rounded border-white/20 bg-black/20 text-gold focus:ring-gold/50 focus:ring-offset-black transition-all"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">{place.name}</p>
                  <p className="text-white/50 text-xs mb-2 leading-relaxed">{place.address}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleAuditSelected}
            disabled={selectedIds.size === 0 || loading}
            className="w-full mt-6 bg-gold hover:bg-gold-light text-black font-semibold py-4 rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.15)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Starting Audit...
              </>
            ) : (
              <>
                Audit {selectedIds.size} Selected Vendors
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
