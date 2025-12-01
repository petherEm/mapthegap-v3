"use client";

import { useState } from "react";
import { MapIcon, ArrowDownTrayIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import type { Location } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchResultsProps {
  type: "simple" | "nlp";
  locations: Location[];
  answer?: string;
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
  onShowOnMap: (zoomTo?: { lat: number; lng: number; zoom: number }) => void;
  onExport: (format: "csv" | "json") => void;
  onClose: () => void;
}

// Helper function to render markdown-style text
function MarkdownText({ text }: { text: string }) {
  const renderLine = (line: string, index: number) => {
    // Convert **bold** to <strong>
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const rendered = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-neutral-900 dark:text-neutral-50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });

    // Check if line starts with "- " for bullet point
    if (line.trim().startsWith("- ")) {
      return (
        <li key={index} className="ml-4">
          {rendered}
        </li>
      );
    }

    // Regular line
    return <div key={index}>{rendered}</div>;
  };

  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
}

export function SearchResults({
  type,
  locations,
  answer,
  metadata,
  actions,
  onShowOnMap,
  onExport,
  onClose,
}: SearchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate">
            {type === "nlp" ? "🤖 AI Search" : "🔍 Search"}
          </h3>
          <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded whitespace-nowrap">
            {metadata.totalResults} {metadata.totalResults === 1 ? "result" : "results"}
          </span>
          <span className="text-xs text-neutral-500">{metadata.executionTime}ms</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close results"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-3 max-h-96 overflow-y-auto">
          {/* NLP Answer */}
          {type === "nlp" && answer && (
            <div className="mb-3 p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded border border-neutral-200 dark:border-neutral-700">
              <div className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
                <MarkdownText text={answer} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-3">
        {actions.showOnMap && (
          <button
            onClick={() => onShowOnMap(actions.zoomTo)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded transition-colors"
          >
            <MapIcon className="w-4 h-4" />
            Show on Map
          </button>
        )}
        {actions.exportable && (
          <>
            <button
              onClick={() => onExport("csv")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium rounded transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => onExport("json")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium rounded transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export JSON
            </button>
          </>
        )}
      </div>

          {/* Location Preview (first 5) */}
          {locations.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                Showing {Math.min(5, locations.length)} of {locations.length}
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.slice(0, 5).map((location) => (
                  <div
                    key={location.id}
                    className="p-2 bg-neutral-100 dark:bg-neutral-800/50 rounded border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate">
                          {location.network_name}
                          {location.subnetwork_name && (
                            <span className="text-neutral-500 dark:text-neutral-400 font-normal"> • {location.subnetwork_name}</span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {location.street}, {location.city} {location.zip}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-neutral-500">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {locations.length > 5 && (
                <p className="text-xs text-neutral-500 mt-2 text-center">
                  +{locations.length - 5} more locations
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
