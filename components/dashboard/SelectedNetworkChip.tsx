"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import type { NetworkName } from "@/types";

interface SelectedNetworkChipProps {
  network: string;
  onRemove: (network: NetworkName) => void;
}

export function SelectedNetworkChip({
  network,
  onRemove,
}: SelectedNetworkChipProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-50">
      <span className="text-sm font-medium">✓ {network}</span>
      <button
        onClick={() => onRemove(network as NetworkName)}
        className="ml-1 p-0.5 hover:bg-violet-500/20 dark:hover:bg-violet-600 rounded transition-colors"
        aria-label={`Remove ${network}`}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
