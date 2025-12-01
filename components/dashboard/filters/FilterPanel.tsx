"use client";

import { useState } from "react";
import { ChevronDownIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { AdvancedFilterState, FilterOption } from "@/types";
import { CheckboxFilter } from "./CheckboxFilter";
import { SearchableFilter } from "./SearchableFilter";

type FilterPanelProps = {
  filters: AdvancedFilterState;
  options: {
    subnetworks: FilterOption[];
    cities: FilterOption[];
    zipCodes: FilterOption[];
    counties: FilterOption[];
    allSubnetworks: string[];
  };
  onFilterToggle: (
    filterType: "subnetworks" | "cities" | "zipCodes" | "counties",
    value: string
  ) => void;
  onSearchChange: (filterType: "city" | "zipCode", value: string) => void;
  onClearAll: () => void;
  onSelectAllSubnetworks: () => void;
  onDeselectAllSubnetworks: () => void;
  totalCount: number;
  filteredCount: number;
};

type CollapsibleSectionProps = {
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function CollapsibleSection({
  title,
  count,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</span>
          {count > 0 && (
            <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-medium rounded">
              {count}
            </span>
          )}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-neutral-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function FilterPanel({
  filters,
  options,
  onFilterToggle,
  onSearchChange,
  onClearAll,
  onSelectAllSubnetworks,
  onDeselectAllSubnetworks,
  totalCount,
  filteredCount,
}: FilterPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    subnetworks: false,
    cities: false,
    zipCodes: false,
    counties: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate total active filters
  // For subnetworks (opt-out): count how many are EXCLUDED (unchecked)
  // For others (opt-in): count how many are INCLUDED (checked)
  const excludedSubnetworksCount = options.allSubnetworks.length - filters.subnetworks.size;
  const activeFiltersCount =
    excludedSubnetworksCount +
    filters.cities.size +
    filters.zipCodes.size +
    filters.counties.size;

  const hasActiveFilters = activeFiltersCount > 0;
  const isFiltered = filteredCount < totalCount;

  return (
    <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      {/* Header */}
      <div className="px-3 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Advanced Filters
            </h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-2 py-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 hover:bg-violet-500/10 rounded transition-colors"
            >
              <XMarkIcon className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Filter Summary */}
        {isFiltered && (
          <div className="mt-2 text-xs text-neutral-500">
            Showing{" "}
            <span className="font-semibold text-neutral-600 dark:text-neutral-400">
              {filteredCount.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-neutral-600 dark:text-neutral-400">
              {totalCount.toLocaleString()}
            </span>{" "}
            locations
            {hasActiveFilters && (
              <span className="text-violet-600 dark:text-violet-400">
                {" "}
                · {activeFiltersCount} filter
                {activeFiltersCount !== 1 ? "s" : ""} active
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter Sections */}
      <div>
        {/* Subnetwork Filter */}
        {options.subnetworks.length > 0 && (
          <CollapsibleSection
            title="Subnetwork"
            count={excludedSubnetworksCount}
            isOpen={openSections.subnetworks}
            onToggle={() => toggleSection("subnetworks")}
          >
            <div className="space-y-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-500 italic px-2">
                Uncheck to hide subnetwork
              </p>
              <CheckboxFilter
                options={options.subnetworks}
                selected={filters.subnetworks}
                onChange={(value) => onFilterToggle("subnetworks", value)}
                showSelectAll={true}
                onSelectAll={onSelectAllSubnetworks}
                onDeselectAll={onDeselectAllSubnetworks}
              />
            </div>
          </CollapsibleSection>
        )}

        {/* City Filter with Search */}
        <CollapsibleSection
          title="City"
          count={filters.cities.size}
          isOpen={openSections.cities}
          onToggle={() => toggleSection("cities")}
        >
          <SearchableFilter
            options={options.cities}
            selected={filters.cities}
            searchTerm={filters.searchTerms.city}
            onSearchChange={(term) => onSearchChange("city", term)}
            onChange={(value) => onFilterToggle("cities", value)}
            placeholder="Search cities..."
          />
        </CollapsibleSection>

        {/* ZIP Code Filter with Search */}
        <CollapsibleSection
          title="ZIP Code"
          count={filters.zipCodes.size}
          isOpen={openSections.zipCodes}
          onToggle={() => toggleSection("zipCodes")}
        >
          <SearchableFilter
            options={options.zipCodes}
            selected={filters.zipCodes}
            searchTerm={filters.searchTerms.zipCode}
            onSearchChange={(term) => onSearchChange("zipCode", term)}
            onChange={(value) => onFilterToggle("zipCodes", value)}
            placeholder="Search ZIP codes..."
          />
        </CollapsibleSection>

        {/* County Filter */}
        {options.counties.length > 0 && (
          <CollapsibleSection
            title="County"
            count={filters.counties.size}
            isOpen={openSections.counties}
            onToggle={() => toggleSection("counties")}
          >
            <CheckboxFilter
              options={options.counties}
              selected={filters.counties}
              onChange={(value) => onFilterToggle("counties", value)}
            />
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
