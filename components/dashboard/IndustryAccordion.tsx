"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IndustryBreakdown, CountryCode } from "@/types";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";

interface IndustryAccordionProps {
  industries: IndustryBreakdown[];
  countryCode: CountryCode;
}

export function IndustryAccordion({
  industries,
  countryCode,
}: IndustryAccordionProps) {
  const router = useRouter();
  const { isSuperAdmin } = useAuth();
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);

  if (industries.length === 0) {
    return (
      <div className="text-center py-12 bg-neutral-900 rounded-lg">
        <p className="text-neutral-400">
          No location data available for this country yet.
        </p>
        {isSuperAdmin && (
          <button
            onClick={() => router.push("/import")}
            className="mt-4 text-violet-400 hover:text-violet-300 transition-colors"
          >
            Import Locations →
          </button>
        )}
      </div>
    );
  }

  const toggleIndustry = (category: string) => {
    setExpandedIndustry(expandedIndustry === category ? null : category);
  };

  const handleNetworkClick = (
    industryCategory: string,
    networkName: string
  ) => {
    // Navigate to country page with industry and network filters
    router.push(
      `/${countryCode}?industry=${encodeURIComponent(industryCategory)}&network=${encodeURIComponent(networkName)}`
    );
  };

  const handleIndustryViewAll = (industryCategory: string) => {
    // Navigate to country page with only industry filter
    router.push(`/${countryCode}?industry=${encodeURIComponent(industryCategory)}`);
  };

  return (
    <div className="space-y-3">
      {industries.map((industry) => {
        const isExpanded = expandedIndustry === industry.category;

        return (
          <div
            key={industry.category}
            className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden transition-all hover:border-neutral-700"
          >
            {/* Industry Header */}
            <button
              onClick={() => toggleIndustry(industry.category)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {industry.icon}
                </span>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-neutral-50">
                    {industry.label}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {industry.count.toLocaleString()} location
                    {industry.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500 hidden sm:inline">
                  {industry.networks.length} network
                  {industry.networks.length !== 1 ? "s" : ""}
                </span>
                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </button>

            {/* Expanded Networks List */}
            {isExpanded && (
              <div className="px-6 pb-4 pt-2 border-t border-neutral-800">
                <div className="space-y-2">
                  {/* View All Button */}
                  <button
                    onClick={() => handleIndustryViewAll(industry.category)}
                    className="w-full text-left px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-50 group-hover:text-violet-400 transition-colors">
                          View All {industry.label}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Show all {industry.count.toLocaleString()} locations
                        </p>
                      </div>
                      <span className="text-violet-400 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </button>

                  {/* Individual Networks */}
                  <div className="text-xs text-neutral-500 uppercase tracking-wider px-4 pt-2">
                    Or select a specific network:
                  </div>
                  {industry.networks.map((network) => (
                    <button
                      key={network.name}
                      onClick={() =>
                        handleNetworkClick(industry.category, network.name)
                      }
                      className="w-full text-left px-4 py-3 bg-neutral-800/50 hover:bg-neutral-700 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-50 group-hover:text-violet-400 transition-colors truncate">
                            {network.name}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {network.count.toLocaleString()} location
                            {network.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <span className="text-violet-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2">
                          →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
