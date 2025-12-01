"use client";

import type { NetworkName } from "@/types";
import { SelectedNetworkChip } from "./SelectedNetworkChip";

interface SelectedNetworksZoneProps {
  selectedNetworks: Set<NetworkName>;
  onRemoveNetwork: (network: NetworkName) => void;
  maxNetworks: number;
}

export function SelectedNetworksZone({
  selectedNetworks,
  onRemoveNetwork,
  maxNetworks,
}: SelectedNetworksZoneProps) {
  const count = selectedNetworks.size;

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Selected Networks
        </h4>
        <span className="text-xs text-neutral-500">
          {count}/{maxNetworks}
        </span>
      </div>

      {/* Selected Chips */}
      {count === 0 ? (
        <div className="text-center py-8 text-neutral-500 text-sm">
          Click on networks above to select (max {maxNetworks})
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {Array.from(selectedNetworks).map((network) => (
            <SelectedNetworkChip
              key={network}
              network={network}
              onRemove={onRemoveNetwork}
            />
          ))}
        </div>
      )}
    </div>
  );
}
