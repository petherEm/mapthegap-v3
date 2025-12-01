"use client";

import { Switch } from "@/components/ui/switch";
import type { NetworkName } from "@/types";
import { NETWORKS } from "@/lib/data/networks";

type NetworkToggleProps = {
  availableNetworks: NetworkName[];
  activeNetworks: Set<NetworkName>;
  onToggle: (network: NetworkName) => void;
};

export function NetworkToggle({
  availableNetworks,
  activeNetworks,
  onToggle,
}: NetworkToggleProps) {
  return (
    <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Active Networks
        </h3>
        <span className="text-xs text-neutral-500">
          {activeNetworks.size}/{availableNetworks.length}
        </span>
      </div>

      <div className="space-y-2">
        {availableNetworks.map((networkName) => {
          const network = NETWORKS[networkName];
          const isActive = activeNetworks.has(networkName);

          return (
            <div
              key={networkName}
              className="flex items-center justify-between py-1.5"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-opacity"
                  style={{
                    backgroundColor: network.color,
                    opacity: isActive ? 1 : 0.3,
                  }}
                />
                <p
                  className={`text-xs font-medium transition-colors truncate ${
                    isActive ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-500"
                  }`}
                >
                  {networkName}
                </p>
              </div>

              <Switch
                checked={isActive}
                onCheckedChange={() => onToggle(networkName)}
                aria-label={`Toggle ${networkName}`}
                className="scale-75"
              />
            </div>
          );
        })}
      </div>

      {/* Select All / Deselect All */}
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
        <button
          onClick={() => {
            availableNetworks.forEach((network) => {
              if (!activeNetworks.has(network)) {
                onToggle(network);
              }
            });
          }}
          className="flex-1 px-2 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-md transition-colors"
        >
          All
        </button>
        <button
          onClick={() => {
            availableNetworks.forEach((network) => {
              if (activeNetworks.has(network)) {
                onToggle(network);
              }
            });
          }}
          className="flex-1 px-2 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-md transition-colors"
        >
          None
        </button>
      </div>
    </div>
  );
}
