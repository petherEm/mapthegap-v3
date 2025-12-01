"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { Country, Location, NetworkName, AdvancedFilterState, FilterOption, IndustryCategory } from "@/types";
import { NetworkStats } from "./NetworkStats";
import { NetworkToggle } from "./NetworkToggle";
import { ViewModeToggle } from "./ViewModeToggle";
import { FilterPanel } from "./filters/FilterPanel";
import { SmartSearchBar } from "./SmartSearchBar";
import { SearchResults } from "./SearchResults";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { normalizeCityName, normalizeCountyName } from "@/lib/utils/normalize";
import { getLocationsInViewport, type BoundingBox } from "@/lib/supabase/queries";
import type { ViewportBounds } from "@/components/map/MapContainer";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

// Dynamically import MapContainer to avoid SSR issues with mapbox-gl
const MapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading map...</p>
        </div>
      </div>
    ),
  }
);

type CountryMapViewProps = {
  country: Country;
  locations: Location[];
  availableNetworks: NetworkName[];
};

export function CountryMapView({
  country,
  locations,
  availableNetworks,
}: CountryMapViewProps) {
  // Read URL parameters for pre-filtering
  const searchParams = useSearchParams();
  const industryParam = searchParams.get("industry");
  const networkParam = searchParams.get("network");
  const networksParam = searchParams.get("networks"); // Comma-separated list

  // Initialize with all networks active
  const [activeNetworks, setActiveNetworks] = useState<Set<NetworkName>>(
    new Set(availableNetworks)
  );
  const [viewMode, setViewMode] = useState<"clustered" | "individual">("clustered");
  const [mapKey, setMapKey] = useState(0);
  const [targetViewport, setTargetViewport] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  // Search state
  interface SearchResponse {
    type: "simple" | "nlp";
    locations: Location[];
    answer?: string;
    visualization?: "map" | "chart" | "table";
    metadata: {
      totalResults: number;
      executionTime: number;
      queryType?: string;
    };
    actions: {
      showOnMap: boolean;
      exportable: boolean;
      zoomTo?: { lat: number; lng: number; zoom: number };
    };
  }
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightedLocationIds, setHighlightedLocationIds] = useState<Set<string>>(new Set());

  // Track if user has manually interacted with subnetwork filters
  const userInteractedWithSubnetworks = useRef(false);

  // Viewport loading state
  const [isViewportLoading, setIsViewportLoading] = useState(false);
  const [viewportLocations, setViewportLocations] = useState<Location[]>([]);
  const [currentZoom, setCurrentZoom] = useState(country.zoom);
  const viewportFetchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Zoom threshold: < 8 = full country, >= 8 = viewport mode
  const VIEWPORT_MODE_ZOOM_THRESHOLD = 8;
  const useViewportMode = currentZoom >= VIEWPORT_MODE_ZOOM_THRESHOLD;

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    networks: new Set(availableNetworks),
    subnetworks: new Set(),
    cities: new Set(),
    zipCodes: new Set(),
    counties: new Set(),
    searchTerms: {
      city: "",
      zipCode: "",
    },
  });

  // Toggle network visibility (update both states for backwards compatibility)
  const handleNetworkToggle = (network: NetworkName) => {
    setActiveNetworks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(network)) {
        newSet.delete(network);
      } else {
        newSet.add(network);
      }
      return newSet;
    });
    setAdvancedFilters((prev) => {
      const newSet = new Set(prev.networks);
      if (newSet.has(network)) {
        newSet.delete(network);
      } else {
        newSet.add(network);
      }
      return { ...prev, networks: newSet };
    });
  };

  // Handle advanced filter toggle
  const handleAdvancedFilterToggle = (
    filterType: "subnetworks" | "cities" | "zipCodes" | "counties",
    value: string
  ) => {
    // Mark subnetwork interactions
    if (filterType === "subnetworks") {
      userInteractedWithSubnetworks.current = true;
    }

    setAdvancedFilters((prev) => {
      const newSet = new Set(prev[filterType]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [filterType]: newSet };
    });
  };

  // Bulk select all subnetworks
  const handleSelectAllSubnetworks = () => {
    userInteractedWithSubnetworks.current = true; // Mark as user interaction
    setAdvancedFilters((prev) => ({
      ...prev,
      subnetworks: new Set(filterOptions.allSubnetworks),
    }));
  };

  // Bulk deselect all subnetworks
  const handleDeselectAllSubnetworks = () => {
    userInteractedWithSubnetworks.current = true; // Mark as user interaction
    setAdvancedFilters((prev) => ({
      ...prev,
      subnetworks: new Set(), // Empty set = all deselected
    }));
  };

  // Handle search term changes
  const handleSearchChange = (
    filterType: "city" | "zipCode",
    value: string
  ) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      searchTerms: { ...prev.searchTerms, [filterType]: value },
    }));
  };

  // Clear all advanced filters (but keep network filters)
  const handleClearAllFilters = () => {
    setAdvancedFilters((prev) => ({
      ...prev,
      subnetworks: new Set(filterOptions.allSubnetworks), // Reset to all (opt-out default)
      cities: new Set(), // Clear (opt-in default)
      zipCodes: new Set(), // Clear (opt-in default)
      counties: new Set(), // Clear (opt-in default)
      searchTerms: { city: "", zipCode: "" },
    }));
  };

  // Handle viewport change (debounced)
  const handleViewportChange = useCallback(
    (bounds: ViewportBounds) => {
      // Update current zoom
      setCurrentZoom(bounds.zoom);

      // Only fetch viewport if zoomed in enough
      if (bounds.zoom < VIEWPORT_MODE_ZOOM_THRESHOLD) {
        // Zoomed out - use full country dataset
        setViewportLocations([]);
        return;
      }

      // Clear existing timeout
      if (viewportFetchTimeout.current) {
        clearTimeout(viewportFetchTimeout.current);
      }

      // Debounce viewport fetch (500ms after last move)
      viewportFetchTimeout.current = setTimeout(async () => {
        setIsViewportLoading(true);

        try {
          const boundingBox: BoundingBox = {
            west: bounds.west,
            south: bounds.south,
            east: bounds.east,
            north: bounds.north,
          };

          const result = await getLocationsInViewport(country.code, boundingBox);

          if (result.error) {
            console.error("Viewport fetch error:", result.error);
          } else if (result.data) {
            setViewportLocations(result.data);
          }
        } catch (error) {
          console.error("Viewport fetch failed:", error);
        } finally {
          setIsViewportLoading(false);
        }
      }, 500);
    },
    [country.code, VIEWPORT_MODE_ZOOM_THRESHOLD]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (viewportFetchTimeout.current) {
        clearTimeout(viewportFetchTimeout.current);
      }
    };
  }, []);

  // Apply URL parameters to filters on initial mount
  useEffect(() => {
    // Priority 1: Handle "networks" parameter (comma-separated list from dashboard)
    if (networksParam) {
      const networkList = networksParam
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      if (networkList.length > 0) {
        const networkSet = new Set(networkList as NetworkName[]);
        setActiveNetworks(networkSet);
        setAdvancedFilters((prev) => ({
          ...prev,
          networks: networkSet,
        }));
        return; // Stop here, don't process other params
      }
    }

    // Priority 2: Filter by industry if provided
    if (industryParam) {
      // Filter locations by industry_category
      const industryFilteredLocations = locations.filter(
        (loc) => loc.industry_category === industryParam
      );

      // Get unique networks in this industry
      const networksInIndustry = Array.from(
        new Set(industryFilteredLocations.map((loc) => loc.network_name))
      );

      // Set active networks to only those in the industry
      if (networksInIndustry.length > 0) {
        const networkSet = new Set(networksInIndustry as NetworkName[]);
        setActiveNetworks(networkSet);
        setAdvancedFilters((prev) => ({
          ...prev,
          networks: networkSet,
        }));
      }
    }

    // Priority 3: Further filter by specific network if provided (legacy support)
    if (networkParam) {
      const networkSet = new Set([networkParam as NetworkName]);
      setActiveNetworks(networkSet);
      setAdvancedFilters((prev) => ({
        ...prev,
        networks: networkSet,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount (empty dependency array intentional)

  // Calculate filter options based on active networks
  const filterOptions = useMemo(() => {
    const cityMap = new Map<string, number>();
    const zipMap = new Map<string, number>();
    const countyMap = new Map<string, number>();
    const subnetworkMap = new Map<string, number>();

    // Only count locations from active networks
    locations.forEach((loc) => {
      if (!advancedFilters.networks.has(loc.network_name)) return;

      // Normalize city names for case-insensitive filtering
      const normalizedCity = normalizeCityName(loc.city);
      cityMap.set(normalizedCity, (cityMap.get(normalizedCity) || 0) + 1);

      zipMap.set(loc.zip, (zipMap.get(loc.zip) || 0) + 1);

      if (loc.county) {
        // Normalize county names too
        const normalizedCounty = normalizeCountyName(loc.county);
        countyMap.set(normalizedCounty, (countyMap.get(normalizedCounty) || 0) + 1);
      }

      if (loc.subnetwork_name) {
        subnetworkMap.set(
          loc.subnetwork_name,
          (subnetworkMap.get(loc.subnetwork_name) || 0) + 1
        );
      }
    });

    return {
      cities: Array.from(cityMap.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending (most locations first)
        .map(([name, count]) => ({ name, count })),
      zipCodes: Array.from(zipMap.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending (most locations first)
        .map(([name, count]) => ({ name, count })),
      counties: Array.from(countyMap.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending (most locations first)
        .map(([name, count]) => ({ name, count })),
      subnetworks: Array.from(subnetworkMap.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending (most locations first)
        .map(([name, count]) => ({ name, count })),
      allSubnetworks: Array.from(subnetworkMap.keys()), // All available subnetwork names
    };
  }, [locations, advancedFilters.networks]);

  // Initialize subnetworks with all available options (opt-out approach)
  // Only runs on initial load or when available subnetworks change (not when user deselects)
  useEffect(() => {
    // Only auto-initialize if:
    // 1. We have subnetworks available
    // 2. Current filter is empty
    // 3. User hasn't manually interacted with subnetwork filters yet
    if (
      filterOptions.allSubnetworks.length > 0 &&
      advancedFilters.subnetworks.size === 0 &&
      !userInteractedWithSubnetworks.current
    ) {
      setAdvancedFilters((prev) => ({
        ...prev,
        subnetworks: new Set(filterOptions.allSubnetworks),
      }));
    }
  }, [filterOptions.allSubnetworks, advancedFilters.subnetworks.size]);

  // Determine which locations to use based on viewport mode
  const locationsToFilter = useViewportMode && viewportLocations.length > 0
    ? viewportLocations
    : locations;

  // Apply all filters (single-pass for performance)
  const filteredLocations = useMemo(() => {
    return locationsToFilter.filter((location) => {
      // 1. Network filter
      if (!advancedFilters.networks.has(location.network_name)) return false;

      // 2. Subnetwork filter (opt-out: only filter locations that have a subnetwork)
      // Locations without subnetworks are always shown
      if (location.subnetwork_name) {
        // If this subnetwork is NOT in the "allowed" set, hide the location
        if (!advancedFilters.subnetworks.has(location.subnetwork_name)) {
          return false;
        }
      }

      // 3. City filter (only if any selected) - normalize for case-insensitive matching
      if (advancedFilters.cities.size > 0) {
        const normalizedCity = normalizeCityName(location.city);
        if (!advancedFilters.cities.has(normalizedCity)) {
          return false;
        }
      }

      // 4. ZIP code filter (only if any selected)
      if (
        advancedFilters.zipCodes.size > 0 &&
        !advancedFilters.zipCodes.has(location.zip)
      ) {
        return false;
      }

      // 5. County filter (only if any selected) - normalize for case-insensitive matching
      if (advancedFilters.counties.size > 0) {
        if (!location.county) {
          return false;
        }
        const normalizedCounty = normalizeCountyName(location.county);
        if (!advancedFilters.counties.has(normalizedCounty)) {
          return false;
        }
      }

      return true;
    });
  }, [locationsToFilter, advancedFilters]);

  // Restore map to initial viewport
  const restoreView = () => {
    setTargetViewport(null);
    setMapKey((prev) => prev + 1);
  };

  // Search handlers
  const handleSearchResults = (results: SearchResponse | null) => {
    setSearchResults(results);
    if (results && results.locations.length > 0) {
      const locationIds = new Set(results.locations.map((loc) => loc.id));
      setHighlightedLocationIds(locationIds);
    } else {
      setHighlightedLocationIds(new Set());
    }
  };

  const handleSearchError = (error: string | null) => {
    setSearchError(error);
  };

  const handleShowOnMap = (zoomTo?: { lat: number; lng: number; zoom: number }) => {
    if (zoomTo) {
      // Set the target viewport and force map re-render
      setTargetViewport(zoomTo);
      setMapKey((prev) => prev + 1); // Trigger map re-render with new viewport
    }
  };

  const handleExport = (format: "csv" | "json") => {
    if (!searchResults || searchResults.locations.length === 0) return;

    const locations = searchResults.locations;

    if (format === "json") {
      const json = JSON.stringify(locations, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `search-results-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const headers = Object.keys(locations[0]);
      const csvRows = [headers.join(",")];

      for (const row of locations) {
        const values = headers.map((header) => {
          const value = (row as any)[header];
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value;
        });
        csvRows.push(values.join(","));
      }

      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `search-results-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCloseResults = () => {
    setSearchResults(null);
    setSearchError(null);
    setHighlightedLocationIds(new Set());
    setTargetViewport(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <SidebarProvider defaultOpen={true} className="flex h-full w-full">
        {/* Collapsible Sidebar */}
        <Sidebar collapsible="icon" className="border-neutral-200 dark:border-neutral-800 h-full">
          <SidebarHeader className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-label={country.name}>
                {country.flag}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate group-data-[collapsible=icon]:hidden">
                  {country.name}
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 group-data-[collapsible=icon]:hidden">
                  {locations.length} location{locations.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            {/* View Mode Toggle Section */}
            <SidebarGroup>
              <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-4 bg-neutral-200 dark:bg-neutral-800 group-data-[collapsible=icon]:hidden" />

            {/* Statistics Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs text-neutral-600 dark:text-neutral-400 group-data-[collapsible=icon]:hidden">
                Statistics
              </SidebarGroupLabel>
              <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
                <NetworkStats
                  locations={filteredLocations}
                  originalTotal={locations.length}
                />
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-4 bg-neutral-200 dark:bg-neutral-800 group-data-[collapsible=icon]:hidden" />

            {/* Network Filter Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs text-neutral-600 dark:text-neutral-400 group-data-[collapsible=icon]:hidden">
                Filter Networks
              </SidebarGroupLabel>
              <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
                <NetworkToggle
                  availableNetworks={availableNetworks}
                  activeNetworks={activeNetworks}
                  onToggle={handleNetworkToggle}
                />
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-4 bg-neutral-200 dark:bg-neutral-800 group-data-[collapsible=icon]:hidden" />

            {/* Advanced Filters Section */}
            <SidebarGroup>
              <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
                <FilterPanel
                  filters={advancedFilters}
                  options={{
                    ...filterOptions,
                    allSubnetworks: filterOptions.allSubnetworks,
                  }}
                  onFilterToggle={handleAdvancedFilterToggle}
                  onSearchChange={handleSearchChange}
                  onClearAll={handleClearAllFilters}
                  onSelectAllSubnetworks={handleSelectAllSubnetworks}
                  onDeselectAllSubnetworks={handleDeselectAllSubnetworks}
                  totalCount={locations.length}
                  filteredCount={filteredLocations.length}
                />
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-4 bg-neutral-200 dark:bg-neutral-800 group-data-[collapsible=icon]:hidden" />

            {/* Help Section */}
            <SidebarGroup>
              <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
                <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Click markers for details. Clusters show location count - click to zoom.
                  </p>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col h-full overflow-hidden">
          {/* Header Bar */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4">
            <SidebarTrigger className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50" />
            <Separator orientation="vertical" className="h-6 bg-neutral-200 dark:bg-neutral-800" />
            <Link
              href="/maps"
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Maps</span>
            </Link>
            <div className="flex-1" />
            <Link
              href={`/${country.code}/stats`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="View statistics and analytics"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Statistics</span>
            </Link>
            <button
              onClick={restoreView}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Restore initial map view"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Restore View</span>
            </button>
          </header>

          {/* Search Bar */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <SmartSearchBar
              country={country.code}
              onResults={handleSearchResults}
              onError={handleSearchError}
            />
            {searchError && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                {searchError}
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="flex-1 relative overflow-hidden">
            <MapContainer
              key={mapKey}
              locations={filteredLocations}
              initialViewport={
                targetViewport
                  ? {
                      latitude: targetViewport.lat,
                      longitude: targetViewport.lng,
                      zoom: targetViewport.zoom,
                    }
                  : {
                      latitude: country.center[1],
                      longitude: country.center[0],
                      zoom: country.zoom,
                    }
              }
              activeNetworks={activeNetworks}
              viewMode={viewMode}
              onViewportChange={handleViewportChange}
              isViewportLoading={isViewportLoading}
            />

            {/* Floating Search Results */}
            {searchResults && (
              <SearchResults
                type={searchResults.type}
                locations={searchResults.locations}
                answer={searchResults.answer}
                metadata={searchResults.metadata}
                actions={searchResults.actions}
                onShowOnMap={handleShowOnMap}
                onExport={handleExport}
                onClose={handleCloseResults}
              />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
