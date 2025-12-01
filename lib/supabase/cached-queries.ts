/**
 * Cached Data Access Layer for Server Components
 *
 * Uses Next.js unstable_cache for data caching with tag-based revalidation.
 * Call revalidateTag('locations') or revalidateTag('stats') after data imports.
 */

import { unstable_cache } from "next/cache";
import type { Location, CountryCode, IndustryBreakdown, IndustryCategory, NetworkInIndustry } from "@/types";
import { createCacheClient } from "./cache-client";
import { getIndustryIcon, getIndustryLabel } from "@/lib/data/industries";
import { normalizeCityName } from "@/lib/utils/normalize";

// Cache duration: 6 hours (21600 seconds)
const CACHE_REVALIDATE = 21600;

// ============================================
// CACHED LOCATION QUERIES
// ============================================

// Helper function for fetching locations
async function fetchLocationsByCountry(countryCode: CountryCode): Promise<Location[]> {
  // This log only appears when cache MISS (data actually fetched from Supabase)
  console.log(`[Cache MISS] Fetching locations for ${countryCode} from Supabase...`);
  const supabase = createCacheClient();

  const PAGE_SIZE = 1000;
  let allLocations: Location[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("country", countryCode)
      .eq("is_active", true)
      .order("city")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allLocations = [...allLocations, ...data];
      hasMore = data.length === PAGE_SIZE;
      page++;
    } else {
      hasMore = false;
    }
  }

  return allLocations as Location[];
}

/**
 * Get all locations for a country (cached for 6 hours)
 */
export const getCachedLocationsByCountry = unstable_cache(
  async (countryCode: CountryCode) => {
    return fetchLocationsByCountry(countryCode);
  },
  ["locations-by-country"],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ["locations"],
  }
);

// ============================================
// CACHED STATISTICS QUERIES
// ============================================

export interface CountryStatsOverview {
  totalLocations: number;
  totalNetworks: number;
  totalCities: number;
  networkBreakdown: Array<{
    network: string;
    count: number;
    percentage: number;
  }>;
  topCities: Array<{
    city: string;
    count: number;
  }>;
}

// Helper function for stats overview
async function fetchCountryStatsOverview(countryCode: CountryCode): Promise<CountryStatsOverview> {
  console.log(`[Cache MISS] Fetching stats overview for ${countryCode} from Supabase...`);
  const supabase = createCacheClient();

  const PAGE_SIZE = 1000;
  let allLocations: Array<{ id: string; network_name: string; city: string }> = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("locations")
      .select("id, network_name, city")
      .eq("country", countryCode)
      .eq("is_active", true)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allLocations = [...allLocations, ...data];
      hasMore = data.length === PAGE_SIZE;
      page++;
    } else {
      hasMore = false;
    }
  }

  if (allLocations.length === 0) {
    return {
      totalLocations: 0,
      totalNetworks: 0,
      totalCities: 0,
      networkBreakdown: [],
      topCities: [],
    };
  }

  const totalLocations = allLocations.length;

  // Network breakdown
  const networkCounts = new Map<string, number>();
  allLocations.forEach((loc) => {
    const normalizedNetwork = loc.network_name.trim();
    networkCounts.set(
      normalizedNetwork,
      (networkCounts.get(normalizedNetwork) || 0) + 1
    );
  });

  const networkBreakdown = Array.from(networkCounts.entries())
    .map(([network, count]) => ({
      network,
      count,
      percentage: Math.round((count / totalLocations) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);

  // Top cities (normalize to Title Case)
  const cityCounts = new Map<string, number>();
  allLocations.forEach((loc) => {
    const normalizedCity = normalizeCityName(loc.city);
    cityCounts.set(normalizedCity, (cityCounts.get(normalizedCity) || 0) + 1);
  });

  const topCities = Array.from(cityCounts.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalLocations,
    totalNetworks: networkCounts.size,
    totalCities: cityCounts.size,
    networkBreakdown,
    topCities,
  };
}

/**
 * Get statistics overview for a country (cached for 6 hours)
 */
export const getCachedCountryStatsOverview = unstable_cache(
  async (countryCode: CountryCode) => {
    return fetchCountryStatsOverview(countryCode);
  },
  ["country-stats-overview"],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ["stats"],
  }
);

// ============================================
// CACHED INDUSTRY BREAKDOWN
// ============================================

// Type for SQL function return
type IndustryStatsRow = {
  industry_category: string;
  industry_count: number;
  networks: Array<{ name: string; count: number }>;
};

// Helper function for industry breakdown
async function fetchCountryIndustryBreakdown(countryCode: CountryCode): Promise<IndustryBreakdown[]> {
  console.log(`[Cache MISS] Fetching industry breakdown for ${countryCode} from Supabase...`);
  const supabase = createCacheClient();

  // Try SQL function first (more efficient)
  const { data, error } = await supabase.rpc("get_country_industry_stats", {
    p_country: countryCode,
  });

  if (error) {
    // Fallback to client-side aggregation
    console.warn("SQL function not found, falling back to client-side aggregation:", error.message);
    return fetchIndustryBreakdownFallback(countryCode);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Transform SQL result to IndustryBreakdown[]
  const industries: IndustryBreakdown[] = (data as IndustryStatsRow[]).map((row) => ({
    category: (row.industry_category || "money_transfer") as IndustryCategory,
    label: getIndustryLabel((row.industry_category || "money_transfer") as IndustryCategory),
    icon: getIndustryIcon((row.industry_category || "money_transfer") as IndustryCategory),
    count: Number(row.industry_count),
    networks: row.networks.map((n) => ({
      name: n.name,
      count: n.count,
    })),
  }));

  return industries;
}

// Fallback function - uses client-side aggregation if SQL function not available
async function fetchIndustryBreakdownFallback(countryCode: CountryCode): Promise<IndustryBreakdown[]> {
  const supabase = createCacheClient();

  const PAGE_SIZE = 1000;
  let allData: Array<{ industry_category: string; network_name: string }> = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("locations")
      .select("industry_category, network_name")
      .eq("country", countryCode)
      .eq("is_active", true)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allData.push(...data);
      hasMore = data.length === PAGE_SIZE;
      page++;
    } else {
      hasMore = false;
    }
  }

  if (allData.length === 0) {
    return [];
  }

  // Group by industry_category → network_name → count
  const industryMap = new Map<string, Map<string, number>>();

  for (const row of allData) {
    const industry = row.industry_category || "money_transfer";
    const network = row.network_name;

    if (!industryMap.has(industry)) {
      industryMap.set(industry, new Map());
    }

    const networkMap = industryMap.get(industry)!;
    networkMap.set(network, (networkMap.get(network) || 0) + 1);
  }

  // Transform to IndustryBreakdown[]
  const industries: IndustryBreakdown[] = [];

  industryMap.forEach((networkMap, industryCategory) => {
    const networks: NetworkInIndustry[] = [];
    let totalCount = 0;

    networkMap.forEach((count, networkName) => {
      networks.push({ name: networkName, count });
      totalCount += count;
    });

    networks.sort((a, b) => b.count - a.count);

    industries.push({
      category: industryCategory as IndustryCategory,
      label: getIndustryLabel(industryCategory as IndustryCategory),
      icon: getIndustryIcon(industryCategory as IndustryCategory),
      count: totalCount,
      networks,
    });
  });

  industries.sort((a, b) => b.count - a.count);

  return industries;
}

/**
 * Get industry breakdown for a country (cached for 6 hours)
 */
export const getCachedCountryIndustryBreakdown = unstable_cache(
  async (countryCode: CountryCode) => {
    return fetchCountryIndustryBreakdown(countryCode);
  },
  ["country-industry-breakdown"],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ["stats", "industry-stats"],
  }
);

// ============================================
// CACHED DENSITY AND NETWORK COMPARISON (PostGIS)
// ============================================

export interface DensityData {
  city: string;
  location_count: number;
  density_per_sqkm: number;
  networks: string[];
}

export interface NetworkComparisonData {
  network_name: string;
  location_count: number;
  coverage_area_sqkm: number;
  market_share_pct: number;
}

// Helper for density by city
async function fetchDensityByCity(countryCode: CountryCode): Promise<DensityData[]> {
  const supabase = createCacheClient();

  const { data, error } = await supabase.rpc("get_density_by_city", {
    p_country: countryCode,
  });

  if (error) {
    throw error;
  }

  return (data || []) as DensityData[];
}

/**
 * Get location density by city (cached for 6 hours)
 */
export const getCachedDensityByCity = unstable_cache(
  async (countryCode: CountryCode) => {
    return fetchDensityByCity(countryCode);
  },
  ["density-by-city"],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ["stats"],
  }
);

// Helper for network comparison
async function fetchNetworkComparison(countryCode: CountryCode): Promise<NetworkComparisonData[]> {
  const supabase = createCacheClient();

  const { data, error } = await supabase.rpc("compare_network_coverage", {
    p_country: countryCode,
  });

  if (error) {
    throw error;
  }

  return (data || []) as NetworkComparisonData[];
}

/**
 * Get network comparison data (cached for 6 hours)
 */
export const getCachedNetworkComparison = unstable_cache(
  async (countryCode: CountryCode) => {
    return fetchNetworkComparison(countryCode);
  },
  ["network-comparison"],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ["stats"],
  }
);

// ============================================
// CACHED GLOBAL STATISTICS
// ============================================

export interface CountryNetworkStat {
  country: CountryCode;
  network_name: string;
  count: number;
  last_updated: string;
}

// Helper for global stats
async function fetchCountryNetworkStatistics(): Promise<CountryNetworkStat[]> {
  const supabase = createCacheClient();

  const PAGE_SIZE = 1000;
  let allLocations: Array<{ country: string; network_name: string; updated_at: string }> = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("locations")
      .select("country, network_name, updated_at")
      .eq("is_active", true)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allLocations = [...allLocations, ...data];
      hasMore = data.length === PAGE_SIZE;
      page++;
    } else {
      hasMore = false;
    }
  }

  // Group by country and network
  const statsMap = new Map<string, { count: number; lastUpdated: string }>();

  for (const loc of allLocations) {
    const key = `${loc.country}:${loc.network_name}`;
    const existing = statsMap.get(key);

    if (existing) {
      existing.count += 1;
      if (loc.updated_at && loc.updated_at > existing.lastUpdated) {
        existing.lastUpdated = loc.updated_at;
      }
    } else {
      statsMap.set(key, {
        count: 1,
        lastUpdated: loc.updated_at || new Date().toISOString(),
      });
    }
  }

  // Convert to array
  const stats: CountryNetworkStat[] = [];
  for (const [key, value] of statsMap.entries()) {
    const [country, network_name] = key.split(':');
    stats.push({
      country: country as CountryCode,
      network_name,
      count: value.count,
      last_updated: value.lastUpdated,
    });
  }

  return stats;
}

/**
 * Get statistics for all countries and networks (cached for 6 hours)
 */
export const getCachedCountryNetworkStatistics = unstable_cache(
  async () => {
    return fetchCountryNetworkStatistics();
  },
  ["country-network-statistics"],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ["stats", "global-stats"],
  }
);
