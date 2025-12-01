"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IndustryBreakdown, NetworkName, CountryCode } from "@/types";
import { NetworkTagGrid } from "./NetworkTagGrid";
import { SelectedNetworksZone } from "./SelectedNetworksZone";
import { ShowOnMapButton } from "./ShowOnMapButton";
import { useAuth } from "@/context/AuthContext";

interface NetworkSelectionCardProps {
  industries: IndustryBreakdown[];
  countryCode: CountryCode;
}

const MAX_NETWORKS = 5;

export function NetworkSelectionCard({
  industries,
  countryCode,
}: NetworkSelectionCardProps) {
  const router = useRouter();
  const { isSuperAdmin } = useAuth();
  const [selectedNetworks, setSelectedNetworks] = useState<Set<NetworkName>>(
    new Set()
  );

  const maxReached = selectedNetworks.size >= MAX_NETWORKS;

  const handleSelectNetwork = (network: NetworkName) => {
    if (selectedNetworks.size < MAX_NETWORKS && !selectedNetworks.has(network)) {
      setSelectedNetworks((prev) => new Set([...prev, network]));
    }
  };

  const handleRemoveNetwork = (network: NetworkName) => {
    setSelectedNetworks((prev) => {
      const newSet = new Set(prev);
      newSet.delete(network);
      return newSet;
    });
  };

  if (industries.length === 0) {
    return (
      <div className="text-center py-12 bg-neutral-100 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          No location data available for this country yet.
        </p>
        {isSuperAdmin && (
          <button
            onClick={() => router.push("/import")}
            className="text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            Import Locations →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Networks */}
      <div>
        <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
          Available Networks (click to select, max {MAX_NETWORKS}):
        </h3>
        <NetworkTagGrid
          industries={industries}
          selectedNetworks={selectedNetworks}
          onSelectNetwork={handleSelectNetwork}
          maxReached={maxReached}
        />
      </div>

      {/* Selected Networks Zone */}
      <SelectedNetworksZone
        selectedNetworks={selectedNetworks}
        onRemoveNetwork={handleRemoveNetwork}
        maxNetworks={MAX_NETWORKS}
      />

      {/* Show on Map Button */}
      <ShowOnMapButton
        selectedNetworks={selectedNetworks}
        countryCode={countryCode}
        maxNetworks={MAX_NETWORKS}
      />
    </div>
  );
}
