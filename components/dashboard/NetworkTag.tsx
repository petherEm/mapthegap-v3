"use client";

import type { NetworkName } from "@/types";

interface NetworkTagProps {
  network: string;
  count: number;
  selected: boolean;
  disabled: boolean;
  onClick: (network: NetworkName) => void;
}

export function NetworkTag({
  network,
  count,
  selected,
  disabled,
  onClick,
}: NetworkTagProps) {
  const handleClick = () => {
    if (!disabled && !selected) {
      onClick(network as NetworkName);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || selected}
      className={`
        px-4 py-2.5 rounded-lg border transition-all text-sm font-medium
        ${
          selected
            ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-50 cursor-default"
            : disabled
              ? "border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50"
              : "border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-700 dark:text-neutral-300 hover:border-violet-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className="truncate">{network}</span>
        <span className="text-xs opacity-60">({count.toLocaleString()})</span>
      </div>
    </button>
  );
}
