import type { Location, CountryCode, NetworkName, CountryNetworkStat, IndustryBreakdown, NetworkInIndustry, IndustryCategory } from "@/types";
import { createCacheClient } from "./cache-client";
import { normalizeCityName } from "@/lib/utils/normalize";
import { getIndustryIcon, getIndustryLabel } from "@/lib/data/industries";
import { unstable_cache } from "next/cache";

// Type for Supabase response
type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Helper function - does pure data fetching without auth
async function getLocationsByCountryHelper(
  countryCode: CountryCode
): Promise<Location[]> {
  // Use cache client (service role or anon key, no cookies needed)
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

// Get locations by country (public function)
export async function getLocationsByCountry(
  countryCode: CountryCode,
  _isServer = false // Keep for backwards compatibility but unused
): Promise<SupabaseResponse<Location[]>> {
  try {
    const locations = await getLocationsByCountryHelper(countryCode);
    return {
      data: locations,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}


// Helper function - does pure data fetching without auth
async function getLocationsByCountryAndNetworksHelper(
  countryCode: CountryCode,
  networkNames: NetworkName[]
): Promise<Location[]> {

  // Use cache client (service role or anon key, no cookies needed)
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
      .in("network_name", networkNames)
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

// Get locations by country and networks (public function)
export async function getLocationsByCountryAndNetworks(
  countryCode: CountryCode,
  networkNames: NetworkName[],
  _isServer = false // Keep for backwards compatibility but unused
): Promise<SupabaseResponse<Location[]>> {
  try {
    const locations = await getLocationsByCountryAndNetworksHelper(
      countryCode,
      networkNames
    );
    return {
      data: locations,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Helper function - get statistics grouped by country and network
async function getCountryNetworkStatisticsHelper(): Promise<CountryNetworkStat[]> {

  const supabase = createCacheClient();

  // Fetch all active locations with pagination (Supabase 1000-row limit)
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

  // Group by country and network manually
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

// Get country/network statistics (public function)
export async function getCountryNetworkStatistics(): Promise<SupabaseResponse<CountryNetworkStat[]>> {
  try {
    const stats = await getCountryNetworkStatisticsHelper();
    return {
      data: stats,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

// ============================================
// STATISTICS DAL FUNCTIONS
// ============================================

// Types for statistics
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

export interface CoverageData {
  total_locations: number;
  coverage_area_sqkm: number;
  country_area_sqkm: number;
  coverage_percentage: number;
}

// Helper - Get country stats overview with PAGINATION
async function getCountryStatsOverviewHelper(
  countryCode: CountryCode
): Promise<CountryStatsOverview> {

  const supabase = createCacheClient();

  // Fetch ALL locations with pagination (not just 1,000)
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

  // Calculate statistics
  const totalLocations = allLocations.length;

  // Network breakdown (normalize network names)
  const networkCounts = new Map<string, number>();
  allLocations.forEach((loc) => {
    // Use normalized network name as key
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

  // Top cities (normalize to Title Case: "LONDON" + "London" → "London")
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

// Public function
export async function getCountryStatsOverview(
  countryCode: CountryCode
): Promise<SupabaseResponse<CountryStatsOverview>> {
  try {
    const stats = await getCountryStatsOverviewHelper(countryCode);
    return {
      data: stats,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Helper - Get density by city (PostGIS RPC)
async function getDensityByCityHelper(
  countryCode: CountryCode
): Promise<DensityData[]> {

  const supabase = createCacheClient();

  const { data, error } = await supabase.rpc("get_density_by_city", {
    p_country: countryCode,
  });

  if (error) {
    throw error;
  }

  return (data || []) as DensityData[];
}

// Public function
export async function getDensityByCity(
  countryCode: CountryCode
): Promise<SupabaseResponse<DensityData[]>> {
  try {
    const data = await getDensityByCityHelper(countryCode);
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Helper - Get network comparison (PostGIS RPC)
async function getNetworkComparisonHelper(
  countryCode: CountryCode
): Promise<NetworkComparisonData[]> {

  const supabase = createCacheClient();

  const { data, error } = await supabase.rpc("compare_network_coverage", {
    p_country: countryCode,
  });

  if (error) {
    throw error;
  }

  return (data || []) as NetworkComparisonData[];
}

// Public function
export async function getNetworkComparison(
  countryCode: CountryCode
): Promise<SupabaseResponse<NetworkComparisonData[]>> {
  try {
    const data = await getNetworkComparisonHelper(countryCode);
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Helper - Get coverage percentage (PostGIS RPC)
async function getCoveragePercentageHelper(
  countryCode: CountryCode,
  bufferKm: number = 5.0
): Promise<CoverageData> {

  const supabase = createCacheClient();

  const { data, error } = await supabase.rpc("get_coverage_percentage", {
    p_country: countryCode,
    p_buffer_km: bufferKm,
  });

  if (error) {
    throw error;
  }

  return (data?.[0] || null) as CoverageData;
}

// Public function
export async function getCoveragePercentage(
  countryCode: CountryCode,
  bufferKm: number = 5.0
): Promise<SupabaseResponse<CoverageData>> {
  try {
    const data = await getCoveragePercentageHelper(countryCode, bufferKm);
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

// ============================================
// VIEWPORT LOADING FUNCTIONS
// ============================================

// Bounding box type
export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

// Get locations in viewport (client-side fetch, no cache)
// Note: No "use cache" because this is called from client components with dynamic bounds
export async function getLocationsInViewport(
  countryCode: CountryCode,
  bounds: BoundingBox
): Promise<SupabaseResponse<Location[]>> {
  try {
    const supabase = createCacheClient();

    const { data, error } = await supabase.rpc("get_locations_in_viewport", {
      p_country: countryCode,
      p_west: bounds.west,
      p_south: bounds.south,
      p_east: bounds.east,
      p_north: bounds.north,
    });

    if (error) {
      throw error;
    }

    return {
      data: (data || []) as Location[],
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

// ============================================================================
// Dashboard Queries - Industry Breakdown (Optimized with SQL aggregation + caching)
// ============================================================================

// Type for SQL function return
type IndustryStatsRow = {
  industry_category: string;
  industry_count: number;
  networks: Array<{ name: string; count: number }>;
};

// Helper function - uses SQL aggregation instead of fetching all rows
// This reduces 8,000+ row fetches to ~10-20 aggregated rows
async function getCountryIndustryBreakdownHelper(
  countryCode: CountryCode
): Promise<IndustryBreakdown[]> {
  const supabase = createCacheClient();

  // Use SQL function for aggregation (requires migration 006)
  const { data, error } = await supabase.rpc("get_country_industry_stats", {
    p_country: countryCode,
  });

  if (error) {
    // Fallback to old method if SQL function doesn't exist
    console.warn("SQL function not found, falling back to client-side aggregation:", error.message);
    return getCountryIndustryBreakdownFallback(countryCode);
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
async function getCountryIndustryBreakdownFallback(
  countryCode: CountryCode
): Promise<IndustryBreakdown[]> {
  const supabase = createCacheClient();

  // Query to get industry → network breakdown with pagination
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
      allData.push(...data); // Use push instead of spread for better performance
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

    // Sort networks by count (descending)
    networks.sort((a, b) => b.count - a.count);

    industries.push({
      category: industryCategory as IndustryCategory,
      label: getIndustryLabel(industryCategory as IndustryCategory),
      icon: getIndustryIcon(industryCategory as IndustryCategory),
      count: totalCount,
      networks,
    });
  });

  // Sort industries by count (descending)
  industries.sort((a, b) => b.count - a.count);

  return industries;
}

// Cached version of industry breakdown - revalidates every 5 minutes
// Shared across all pages (dashboard, maps) for instant navigation
const getCachedCountryIndustryBreakdown = unstable_cache(
  async (countryCode: CountryCode) => {
    return getCountryIndustryBreakdownHelper(countryCode);
  },
  ["country-industry-breakdown"],
  {
    revalidate: 300, // 5 minutes
    tags: ["industry-stats"],
  }
);

// Public wrapper - get industry breakdown for a country (with caching)
export async function getCountryIndustryBreakdown(
  countryCode: CountryCode
): Promise<SupabaseResponse<IndustryBreakdown[]>> {
  try {
    const industries = await getCachedCountryIndustryBreakdown(countryCode);
    return { data: industries, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
