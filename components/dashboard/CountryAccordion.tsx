"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { CountryFlag } from "@/components/ui/country-flag";
import type { IndustryBreakdown, NetworkName, Country } from "@/types";

interface CountryAccordionProps {
  country: Country;
  totalLocations: number;
  industries: IndustryBreakdown[];
  isExpanded: boolean;
  onToggle: () => void;
  selectedNetworks: Set<NetworkName>;
  onSelectNetwork: (network: NetworkName) => void;
  maxReached: boolean;
}

export function CountryAccordion({
  country,
  totalLocations,
  industries,
  isExpanded,
  onToggle,
  selectedNetworks,
  onSelectNetwork,
  maxReached,
}: CountryAccordionProps) {
  // Count how many networks from this country are selected
  const allNetworksInCountry = industries.flatMap((ind) =>
    ind.networks.map((n) => n.name)
  );
  const selectedFromThisCountry = allNetworksInCountry.filter((n) =>
    selectedNetworks.has(n as NetworkName)
  ).length;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card/30 hover:bg-card/50 transition-colors">
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
      >
        {/* Expand/Collapse Icon */}
        <ChevronRightIcon
          className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />

        {/* Flag */}
        <CountryFlag countryCode={country.code} size={28} className="flex-shrink-0" />

        {/* Country Name & Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">
              {country.name}
            </h3>
            {selectedFromThisCountry > 0 && (
              <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-medium rounded">
                {selectedFromThisCountry} selected
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalLocations > 0
              ? `${totalLocations.toLocaleString()} locations`
              : "No data yet"}
          </p>
        </div>

        {/* Network count badge */}
        <div className="flex-shrink-0 text-right">
          <span className="text-xs text-muted-foreground">
            {industries.reduce((sum, ind) => sum + ind.networks.length, 0)} networks
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && industries.length > 0 && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50">
          <div className="space-y-3">
            {industries.map((industry) => (
              <div key={industry.category}>
                {/* Industry Label - Compact */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm" aria-hidden="true">
                    {industry.icon}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {industry.label}
                  </span>
                </div>

                {/* Network Tags - Horizontal Flow */}
                <div className="flex flex-wrap gap-1.5">
                  {industry.networks.map((network) => {
                    const isSelected = selectedNetworks.has(
                      network.name as NetworkName
                    );
                    const isDisabled = maxReached && !isSelected;

                    return (
                      <button
                        key={network.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDisabled) {
                            onSelectNetwork(network.name as NetworkName);
                          }
                        }}
                        disabled={isDisabled}
                        className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                          ${
                            isSelected
                              ? "bg-violet-500 text-white shadow-sm"
                              : isDisabled
                              ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                              : "bg-muted hover:bg-muted/80 text-foreground hover:shadow-sm cursor-pointer"
                          }
                        `}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        <span className="truncate max-w-[120px]">{network.name}</span>
                        <span className="opacity-60">
                          {network.count.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isExpanded && industries.length === 0 && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center py-4">
            No location data available yet
          </p>
        </div>
      )}
    </div>
  );
}
