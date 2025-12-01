"use client";

import type { IndustryBreakdown, NetworkName } from "@/types";
import { NetworkTag } from "./NetworkTag";

interface NetworkTagGridProps {
  industries: IndustryBreakdown[];
  selectedNetworks: Set<NetworkName>;
  onSelectNetwork: (network: NetworkName) => void;
  maxReached: boolean;
}

export function NetworkTagGrid({
  industries,
  selectedNetworks,
  onSelectNetwork,
  maxReached,
}: NetworkTagGridProps) {
  if (industries.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-600 dark:text-neutral-400 text-sm">
        No networks available for this country yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {industries.map((industry) => (
        <div key={industry.category}>
          {/* Industry Label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" aria-hidden="true">
              {industry.icon}
            </span>
            <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {industry.label}
            </h4>
          </div>

          {/* Network Tags */}
          <div className="flex flex-wrap gap-2">
            {industry.networks.map((network) => {
              const isSelected = selectedNetworks.has(network.name as NetworkName);
              const isDisabled = maxReached && !isSelected;

              return (
                <NetworkTag
                  key={network.name}
                  network={network.name}
                  count={network.count}
                  selected={isSelected}
                  disabled={isDisabled}
                  onClick={onSelectNetwork}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
