"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon, MapIcon } from "@heroicons/react/24/outline";
import type { NetworkName, CountryCode } from "@/types";

// Selection key format: "countryCode:networkName"
type SelectionKey = `${CountryCode}:${NetworkName}`;

interface GlobalNetworkSelectionProps {
  selectedKeys: Set<SelectionKey>;
  onRemoveNetwork: (key: SelectionKey) => void;
  maxNetworks: number;
  countryNameMap: Map<CountryCode, string>;
  parseSelectionKey: (key: SelectionKey) => { countryCode: CountryCode; network: NetworkName };
}

export function GlobalNetworkSelection({
  selectedKeys,
  onRemoveNetwork,
  maxNetworks,
  countryNameMap,
  parseSelectionKey,
}: GlobalNetworkSelectionProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const count = selectedKeys.size;
  const isDisabled = count === 0 || isNavigating;

  // Build the target URL for navigation (single country only)
  const getTargetUrl = () => {
    if (count === 0) return null;

    // All selections are from the same country now
    const firstKey = Array.from(selectedKeys)[0];
    const { countryCode } = parseSelectionKey(firstKey);

    // Collect all network names
    const networks: NetworkName[] = [];
    selectedKeys.forEach((key) => {
      const { network } = parseSelectionKey(key);
      networks.push(network);
    });

    const networksParam = networks.join(",");
    return `/${countryCode}?networks=${encodeURIComponent(networksParam)}`;
  };

  // Prefetch route on hover for faster navigation
  const handleMouseEnter = () => {
    const url = getTargetUrl();
    if (url) {
      router.prefetch(url);
    }
  };

  const handleShowOnMap = () => {
    const url = getTargetUrl();
    if (!url) return;

    setIsNavigating(true);
    router.push(url);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Selected Networks Display */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {count === 0 ? (
                <>
                  <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                    Selected (0/{maxNetworks}):
                  </span>
                  <span className="text-sm text-muted-foreground/60 italic">
                    Click networks above to select
                  </span>
                </>
              ) : (
                <>
                  {/* Show country name once since all selections are from same country */}
                  {(() => {
                    const firstKey = Array.from(selectedKeys)[0];
                    const { countryCode } = parseSelectionKey(firstKey);
                    const countryName = countryNameMap.get(countryCode) || countryCode;
                    return (
                      <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                        {countryName} ({count}/{maxNetworks}):
                      </span>
                    );
                  })()}
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(selectedKeys).map((key) => {
                      const { network } = parseSelectionKey(key);
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-700 dark:text-violet-300 rounded-md text-xs font-medium"
                        >
                          <span className="truncate max-w-[150px]">{network}</span>
                          <button
                            type="button"
                            onClick={() => onRemoveNetwork(key)}
                            className="p-0.5 hover:bg-violet-500/20 rounded transition-colors"
                            aria-label={`Remove ${network}`}
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Show on Map Button */}
          <button
            onClick={handleShowOnMap}
            onMouseEnter={handleMouseEnter}
            disabled={isDisabled}
            className={`
              flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${
                isDisabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-violet-500 hover:bg-violet-600 text-white shadow-sm hover:shadow"
              }
            `}
          >
            {isNavigating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {count === 0
                    ? "Select networks"
                    : count === 1
                    ? "Show on Map"
                    : `Show ${count} on Map`}
                </span>
                <span className="sm:hidden">
                  {count === 0 ? "Select" : "View"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
