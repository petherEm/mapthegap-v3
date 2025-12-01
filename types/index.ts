// Location data structure
export interface Location {
  id: string;
  network_name: NetworkName;
  subnetwork_name?: string; // Optional subnetwork (e.g., "PEKAO SA" for Western Union, "Poczta Polska" for Ria)
  street: string;
  zip: string;
  city: string;
  county?: string;
  country: CountryCode;
  lat: number;
  lng: number;
  phone?: string; // Contact phone number
  description?: string;
  is_active: boolean;
  // Industry categorization fields
  industry_category?: IndustryCategory; // Primary business type
  brand_name?: string; // Store/location brand (e.g., Walmart, Target, Euronet)
  tags?: string[]; // Multi-select services/attributes
  created_at?: string;
  updated_at?: string;
}

// Country codes
export type CountryCode = "poland" | "lithuania" | "latvia" | "estonia" | "gb" | "france" | "honduras" | "usa";

// Industry categories for location classification
export type IndustryCategory =
  | "money_transfer"
  | "retail"
  | "atm"
  | "banking"
  | "grocery"
  | "postal"
  | "pharmacy"
  | "gas_station"
  | "convenience_store"
  | "pawn_shop"
  | "other";

// Known network names with full branding/configuration
export type KnownNetworkName =
  | "Western Union"
  | "MoneyGram"
  | "Ria"
  | "Poczta Polska";

// Network names can be any string (allows dynamic networks)
export type NetworkName = string;

// Country information
export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  networks: NetworkName[];
  center: [number, number]; // [lng, lat] for Mapbox
  zoom: number;
  bounds?: [[number, number], [number, number]]; // [[west, south], [east, north]]
}

// Network configuration
export interface NetworkConfig {
  name: NetworkName;
  color: string;
  logo: string;
  markerColor: string;
  enabled?: boolean;
}

// Network statistics
export interface NetworkStats {
  network_name: NetworkName;
  count: number;
  color: string;
  logo: string;
  percentage?: number;
}

// Map cluster
export interface MapCluster {
  id: string | number;
  latitude: number;
  longitude: number;
  pointCount: number;
  points?: Location[];
}

// Map viewport
export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

// Advanced filter state with Sets for O(1) lookup performance
export interface AdvancedFilterState {
  networks: Set<NetworkName>;
  subnetworks: Set<string>;
  cities: Set<string>;
  zipCodes: Set<string>;
  counties: Set<string>;
  searchTerms: {
    city: string;
    zipCode: string;
  };
}

// Filter option with count for UI display
export interface FilterOption {
  name: string;
  count: number;
}

// Legacy filter state (for backwards compatibility)
export interface FilterState {
  networks: Record<NetworkName, boolean>;
  searchQuery: string;
}

// Chart data point
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Country/Network statistics for dashboard
export interface CountryNetworkStat {
  country: CountryCode;
  network_name: NetworkName;
  count: number;
  last_updated: string; // ISO date string
}

// Dashboard table row data
export interface CountryDashboardRow {
  country: Country;
  totalLocations: number;
  networkCounts: Map<NetworkName, number>;
  lastUpdated: string; // ISO date string of most recent update
}

// Industry breakdown for dashboard
export interface NetworkInIndustry {
  name: string;
  count: number;
  topCities?: string[]; // Top 3 cities with most locations
}

export interface IndustryBreakdown {
  category: IndustryCategory;
  label: string; // Human-readable label (e.g., "Money Transfer")
  count: number;
  icon: string; // Emoji icon
  networks: NetworkInIndustry[];
}

export interface CountryDashboardStats {
  country: Country;
  totalLocations: number;
  industries: IndustryBreakdown[];
  lastUpdated: string; // ISO date string
}
