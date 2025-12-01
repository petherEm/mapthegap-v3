"use client";

import type { FilterOption } from "@/types";

type CheckboxFilterProps = {
  options: FilterOption[];
  selected: Set<string>;
  onChange: (value: string) => void;
  maxHeight?: string;
  showSelectAll?: boolean;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
};

export function CheckboxFilter({
  options,
  selected,
  onChange,
  maxHeight = "max-h-48",
  showSelectAll = false,
  onSelectAll,
  onDeselectAll,
}: CheckboxFilterProps) {
  if (options.length === 0) {
    return (
      <p className="text-xs text-neutral-500 text-center py-4">
        No options available
      </p>
    );
  }

  const allSelected = options.length === selected.size;
  const noneSelected = selected.size === 0;

  return (
    <div className="space-y-2">
      {/* Select All / Deselect All buttons */}
      {showSelectAll && onSelectAll && onDeselectAll && (
        <div className="flex items-center gap-2 px-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onSelectAll}
            disabled={allSelected}
            className="flex-1 px-2 py-1 text-xs rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            disabled={noneSelected}
            className="flex-1 px-2 py-1 text-xs rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Deselect All
          </button>
        </div>
      )}

      <div className={`${maxHeight} overflow-y-auto space-y-1.5`}>
      {options.map(({ name, count }) => (
        <label
          key={name}
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer group transition-colors"
        >
          <input
            type="checkbox"
            checked={selected.has(name)}
            onChange={() => onChange(name)}
            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-violet-500 focus:ring-violet-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900 cursor-pointer"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors flex-1">
            {name}
          </span>
          <span className="text-xs text-neutral-500 tabular-nums">
            {count.toLocaleString()}
          </span>
        </label>
      ))}
      </div>
    </div>
  );
}
