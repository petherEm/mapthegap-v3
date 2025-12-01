"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import type { CountryCode, Location } from "@/types";

interface SearchResponse {
  type: "simple" | "nlp";
  locations: Location[];
  answer?: string;
  visualization?: "map" | "chart" | "table";
  metadata: {
    totalResults: number;
    executionTime: number;
    queryType?: string;
  };
  actions: {
    showOnMap: boolean;
    exportable: boolean;
    zoomTo?: { lat: number; lng: number; zoom: number };
  };
}

interface SmartSearchBarProps {
  country: CountryCode;
  onResults: (results: SearchResponse | null) => void;
  onError: (error: string | null) => void;
}

// Detect if query is natural language
function isNaturalLanguageQuery(query: string): boolean {
  const nlpPatterns = [
    /show me/i,
    /find all/i,
    /what is/i,
    /what's/i,
    /how many/i,
    /compare/i,
    /which/i,
    /where are/i,
    /nearest/i,
    /coverage/i,
    /density/i,
    /gap/i,
    /distance/i,
    /between/i,
  ];
  return nlpPatterns.some((pattern) => pattern.test(query));
}

export function SmartSearchBar({ country, onResults, onError }: SmartSearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNLP, setIsNLP] = useState(false);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setIsNLP(isNaturalLanguageQuery(value));
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      onError("Please enter a search query");
      return;
    }

    setLoading(true);
    onError(null);
    onResults(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          country,
          type: "auto", // Auto-detect
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onError(data.error || data.message || "Search failed");
      } else {
        onResults(data);
        if (data.locations.length === 0) {
          onError("No results found");
        }
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsNLP(false);
    onResults(null);
    onError(null);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isNLP ? (
            <ChatBubbleLeftIcon className="w-5 h-5 text-violet-500" />
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isNLP
              ? "Natural language query detected..."
              : 'Try "show me Ria locations in London" or simple keyword search'
          }
          className={`w-full pl-10 pr-24 py-2.5 bg-white dark:bg-neutral-800 border rounded-md text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 transition-all ${
            isNLP
              ? "border-violet-500/50 focus:ring-violet-500/50"
              : "border-neutral-300 dark:border-neutral-700 focus:ring-violet-500"
          }`}
          disabled={loading}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              disabled={loading}
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-3 py-1 bg-violet-500 hover:bg-violet-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-medium rounded transition-colors"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </div>
      {isNLP && query && (
        <p className="mt-1 text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1">
          <ChatBubbleLeftIcon className="w-3 h-3" />
          AI-powered search will analyze your question
        </p>
      )}
    </div>
  );
}
