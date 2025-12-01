"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/data/countries";

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [network, setNetwork] = useState(""); // Start empty
  const [countryOverride, setCountryOverride] = useState("");
  const [replace, setReplace] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Known networks for suggestions
  const knownNetworks = ["Ria", "Western Union", "MoneyGram", "Poczta Polska", "Loombard"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a JSON file");
      return;
    }

    if (!network || network.trim() === "") {
      setError("Please enter a network name");
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      // Read file
      const text = await file.text();
      const locations = JSON.parse(text);

      // Call import API
      const response = await fetch("/api/seed/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locations,
          network,
          replace,
          countryOverride: countryOverride || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="h-full overflow-auto bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-2">Import Location Data</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Upload a JSON file containing location data to import into the database.
        </p>

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 space-y-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select JSON File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-neutral-600 dark:text-neutral-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-500 file:text-white
                hover:file:bg-violet-600
                file:cursor-pointer cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Network Name
              <span className="text-neutral-500 font-normal ml-2">(required)</span>
            </label>
            <input
              type="text"
              list="network-suggestions"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              placeholder="Enter network name (e.g., Loombard, Ria, Western Union)"
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-4 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <datalist id="network-suggestions">
              {knownNetworks.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
              You can enter any network name. Known networks will have custom colors and logos.
            </p>
          </div>

          {/* Country Override */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Country Override
              <span className="text-neutral-500 font-normal ml-2">(optional)</span>
            </label>
            <select
              value={countryOverride}
              onChange={(e) => setCountryOverride(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Use country from JSON data</option>
              {Object.values(COUNTRIES).map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            {countryOverride && (
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                All locations will be imported as <strong>{countryOverride}</strong>,
                ignoring country codes in the JSON file.
              </p>
            )}
          </div>

          {/* Replace Mode */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="replace"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-violet-500 focus:ring-violet-500"
            />
            <label htmlFor="replace" className="text-sm">
              Replace existing locations for this network & country
            </label>
          </div>

          {replace && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-md p-4">
              <p className="text-sm text-violet-400">
                ⚠️ Warning: This will delete all existing{" "}
                <strong>{network}</strong> locations for{" "}
                {countryOverride ? (
                  <strong>{countryOverride}</strong>
                ) : (
                  "the countries in your JSON file"
                )}{" "}
                before importing.
              </p>
            </div>
          )}

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!file || !network.trim() || importing}
            className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-500 text-white font-semibold py-3 px-4 rounded-md transition-colors"
          >
            {importing ? "Importing..." : "Import Data"}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4">
              <p className="text-sm text-red-400">❌ {error}</p>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div
              className={`${
                result.failed > 0
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-green-500/10 border-green-500/20"
              } border rounded-md p-4 space-y-2`}
            >
              <p
                className={`text-sm font-semibold ${
                  result.failed > 0 ? "text-yellow-400" : "text-green-400"
                }`}
              >
                {result.failed > 0 ? "⚠️" : "✅"} {result.message}
              </p>
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                <p>Network: {result.network}</p>
                <p>Total Received: {result.totalReceived || result.total}</p>
                {result.skipped > 0 && (
                  <p className="text-yellow-600 dark:text-yellow-400">
                    Skipped: {result.skipped} (invalid coordinates)
                  </p>
                )}
                <p>Valid Locations: {result.validLocations || result.total}</p>
                {result.deleted !== undefined && result.deleted > 0 && (
                  <p className="text-violet-600 dark:text-violet-400">Deleted (old): {result.deleted}</p>
                )}
                <p className="text-green-600 dark:text-green-400">Inserted (new): {result.inserted}</p>
                {result.failed > 0 && (
                  <p className="text-violet-600 dark:text-violet-400">Failed: {result.failed}</p>
                )}
              </div>
              {result.summary && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Summary by country:
                  </p>
                  <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                    {Object.entries(result.summary).map(([country, count]) => (
                      <li key={country}>
                        {country}: {count as number}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-violet-500/20">
                  <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-2">
                    Error Details:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.errors.map((err: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-xs bg-neutral-100 dark:bg-neutral-800/50 rounded p-2"
                      >
                        <p className="text-violet-600 dark:text-violet-400 font-semibold">
                          Batch {err.batch} (rows {err.startIndex}-
                          {err.endIndex}):
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-300 mt-1">{err.error}</p>
                        {err.hint && (
                          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                            Hint: {err.hint}
                          </p>
                        )}
                        {err.code && (
                          <p className="text-neutral-500 mt-1">
                            Code: {err.code}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white dark:bg-neutral-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Import Details</h2>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
            <li>
              • IDs are automatically prefixed with the network name (e.g.,
              ria-12345)
            </li>
            <li>
              • Subnetwork names are extracted from the network_name field if
              needed
            </li>
            <li>• Invalid phone numbers ("1", empty strings) are cleaned</li>
            <li>
              • Country codes are mapped (PL → poland) unless overridden
            </li>
            <li>
              • Country Override forces all locations to a specific country
            </li>
            <li>
              • <span className="text-yellow-400">Locations with null/invalid
              coordinates are automatically skipped</span>
            </li>
            <li>• Data is imported in batches of 1000 records</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
