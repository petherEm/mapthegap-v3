"use client";

import { useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { FilterOption } from "@/types";

type SearchableFilterProps = {
  options: FilterOption[];
  selected: Set<string>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: string;
};

export function SearchableFilter({
  options,
  selected,
  searchTerm,
  onSearchChange,
  onChange,
  placeholder = "Search...",
  maxHeight = "max-h-48",
}: SearchableFilterProps) {
  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.name.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Count selected items
  const selectedCount = selected.size;

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Selected count badge */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {selectedCount} selected
          </span>
          <button
            onClick={() => {
              // Clear all selections for this filter
              selected.forEach((item) => onChange(item));
            }}
            className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Options List */}
      <div className={`${maxHeight} overflow-y-auto space-y-1.5`}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map(({ name, count }) => (
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
              <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors flex-1 truncate">
                {name}
              </span>
              <span className="text-xs text-neutral-500 tabular-nums">
                {count.toLocaleString()}
              </span>
            </label>
          ))
        ) : (
          <p className="text-xs text-neutral-500 text-center py-4">
            {searchTerm ? "No matches found" : "No options available"}
          </p>
        )}
      </div>

      {/* Results count */}
      {searchTerm && filteredOptions.length > 0 && (
        <p className="text-xs text-neutral-500 px-2">
          Showing {filteredOptions.length} of {options.length}
        </p>
      )}
    </div>
  );
}
