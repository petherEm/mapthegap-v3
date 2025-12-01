"use client";

import { useState, useMemo } from "react";
import type { CountryDashboardStats, NetworkName, CountryCode } from "@/types";
import { CountrySearchBar } from "./CountrySearchBar";
import { CountryAccordion } from "./CountryAccordion";
import { GlobalNetworkSelection } from "./GlobalNetworkSelection";

interface MapsPageClientProps {
  countryStats: CountryDashboardStats[];
}

const MAX_NETWORKS = 5;

// Selection key format: "countryCode:networkName"
type SelectionKey = `${CountryCode}:${NetworkName}`;

function createSelectionKey(countryCode: CountryCode, network: NetworkName): SelectionKey {
  return `${countryCode}:${network}`;
}

function parseSelectionKey(key: SelectionKey): { countryCode: CountryCode; network: NetworkName } {
  const [countryCode, ...networkParts] = key.split(":");
  return {
    countryCode: countryCode as CountryCode,
    network: networkParts.join(":") as NetworkName, // Handle network names with colons
  };
}

export function MapsPageClient({ countryStats }: MapsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCountry, setExpandedCountry] = useState<CountryCode | null>(
    // Auto-expand first country with data
    countryStats.find((s) => s.totalLocations > 0)?.country.code || null
  );
  // Track selections with compound key: "countryCode:networkName"
  const [selectedKeys, setSelectedKeys] = useState<Set<SelectionKey>>(
    new Set()
  );

  // Filter countries by search
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countryStats;

    const query = searchQuery.toLowerCase();
    return countryStats.filter(
      (stats) =>
        stats.country.name.toLowerCase().includes(query) ||
        stats.country.code.toLowerCase().includes(query)
    );
  }, [countryStats, searchQuery]);

  const handleToggleCountry = (countryCode: CountryCode) => {
    setExpandedCountry((prev) => (prev === countryCode ? null : countryCode));
  };

  const handleSelectNetwork = (countryCode: CountryCode, network: NetworkName) => {
    const key = createSelectionKey(countryCode, network);
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        // Deselect if already selected
        newSet.delete(key);
      } else if (newSet.size < MAX_NETWORKS) {
        // Select if under limit
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleRemoveNetwork = (key: SelectionKey) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  };

  // Get networks selected for a specific country
  const getSelectedNetworksForCountry = (countryCode: CountryCode): Set<NetworkName> => {
    const networks = new Set<NetworkName>();
    selectedKeys.forEach((key) => {
      const parsed = parseSelectionKey(key);
      if (parsed.countryCode === countryCode) {
        networks.add(parsed.network);
      }
    });
    return networks;
  };

  const maxReached = selectedKeys.size >= MAX_NETWORKS;

  // Calculate totals for header
  const totalLocations = countryStats.reduce(
    (sum, s) => sum + s.totalLocations,
    0
  );
  const totalNetworks = countryStats.reduce(
    (sum, s) =>
      sum + s.industries.reduce((iSum, ind) => iSum + ind.networks.length, 0),
    0
  );

  // Build country name lookup for display
  const countryNameMap = useMemo(() => {
    const map = new Map<CountryCode, string>();
    countryStats.forEach((stats) => {
      map.set(stats.country.code, stats.country.name);
    });
    return map;
  }, [countryStats]);

  return (
    <div className="pb-20">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Explore Network Locations
        </h1>
        <p className="mt-1 text-muted-foreground">
          {totalLocations.toLocaleString()} locations across {countryStats.length} countries · {totalNetworks} networks available
        </p>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <CountrySearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search countries..."
          />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {filteredCountries.length} countries
          </span>
          {selectedKeys.size > 0 && (
            <span className="px-2 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-md font-medium">
              {selectedKeys.size}/{MAX_NETWORKS} selected
            </span>
          )}
        </div>
      </div>

      {/* Country List */}
      <div className="space-y-2">
        {filteredCountries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No countries match "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-violet-500 hover:text-violet-600 transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          filteredCountries.map((stats) => (
            <CountryAccordion
              key={stats.country.code}
              country={stats.country}
              totalLocations={stats.totalLocations}
              industries={stats.industries}
              isExpanded={expandedCountry === stats.country.code}
              onToggle={() => handleToggleCountry(stats.country.code)}
              selectedNetworks={getSelectedNetworksForCountry(stats.country.code)}
              onSelectNetwork={(network) => handleSelectNetwork(stats.country.code, network)}
              maxReached={maxReached}
            />
          ))
        )}
      </div>

      {/* Quick Tips - Collapsible */}
      <details className="mt-6 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          Tips for selecting networks
        </summary>
        <div className="mt-2 pl-4 text-muted-foreground space-y-1">
          <p>• Click on a country to expand and see available networks</p>
          <p>• Click on network tags to select them (max {MAX_NETWORKS})</p>
          <p>• Selected networks appear in the bar below</p>
          <p>• Click "Show on Map" to view locations</p>
        </div>
      </details>

      {/* Global Selection Bar - Fixed at bottom */}
      <GlobalNetworkSelection
        selectedKeys={selectedKeys}
        onRemoveNetwork={handleRemoveNetwork}
        maxNetworks={MAX_NETWORKS}
        countryNameMap={countryNameMap}
        parseSelectionKey={parseSelectionKey}
      />
    </div>
  );
}
