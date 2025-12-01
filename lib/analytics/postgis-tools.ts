// PostGIS function wrappers for Claude LLM function calling

import { createClient } from "@/lib/supabase/server";
import type { PostGISFunctionCall } from "@/types/analytics";

/**
 * Execute a PostGIS analytics function
 * This is called by Claude when it needs to query the database
 */
export async function executePostGISFunction(
  functionCall: PostGISFunctionCall
): Promise<{ data: any[] | null; error: Error | null }> {
  const supabase = await createClient();
  const { name, params } = functionCall;

  try {
    switch (name) {
      case "get_locations_in_viewport":
        return await supabase.rpc("get_locations_in_viewport", params);

      case "find_nearest_locations":
        return await supabase.rpc("find_nearest_locations", params);

      case "get_density_by_city":
        return await supabase.rpc("get_density_by_city", params);

      case "compare_network_coverage":
        return await supabase.rpc("compare_network_coverage", params);

      case "get_coverage_grid":
        return await supabase.rpc("get_coverage_grid", params);

      case "get_coverage_percentage":
        return await supabase.rpc("get_coverage_percentage", params);

      default:
        return {
          data: null,
          error: new Error(`Unknown PostGIS function: ${name}`),
        };
    }
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

/**
 * Tool definitions for Claude function calling
 * These describe the PostGIS functions available to Claude
 */
export const POSTGIS_TOOLS = [
  {
    name: "get_locations_in_viewport",
    description:
      "Get all locations within a geographic bounding box (viewport). Use this when user asks about a specific region or area.",
    input_schema: {
      type: "object" as const,
      properties: {
        p_country: {
          type: "string",
          description: "Country code (e.g., 'poland', 'gb', 'lithuania')",
        },
        p_west: {
          type: "number",
          description: "Western boundary (longitude)",
        },
        p_south: {
          type: "number",
          description: "Southern boundary (latitude)",
        },
        p_east: {
          type: "number",
          description: "Eastern boundary (longitude)",
        },
        p_north: {
          type: "number",
          description: "Northern boundary (latitude)",
        },
      },
      required: ["p_country", "p_west", "p_south", "p_east", "p_north"],
    },
  },
  {
    name: "find_nearest_locations",
    description:
      "Find nearest N locations to a specific point. Use for 'nearest location' or 'closest to' queries.",
    input_schema: {
      type: "object" as const,
      properties: {
        p_lng: {
          type: "number",
          description: "Longitude of the point",
        },
        p_lat: {
          type: "number",
          description: "Latitude of the point",
        },
        p_country: {
          type: "string",
          description: "Country code to search within",
        },
        p_limit: {
          type: "integer",
          description: "Number of results to return (default: 5)",
          default: 5,
        },
        p_max_distance_km: {
          type: "number",
          description:
            "Maximum search radius in kilometers (default: 50)",
          default: 50,
        },
      },
      required: ["p_lng", "p_lat", "p_country"],
    },
  },
  {
    name: "get_density_by_city",
    description:
      "Calculate location density (locations per square kilometer) for each city in a country. Use for density analysis queries.",
    input_schema: {
      type: "object" as const,
      properties: {
        p_country: {
          type: "string",
          description: "Country code",
        },
      },
      required: ["p_country"],
    },
  },
  {
    name: "compare_network_coverage",
    description:
      "Compare coverage metrics across different networks in a country. Returns location count, coverage area, and market share for each network.",
    input_schema: {
      type: "object" as const,
      properties: {
        p_country: {
          type: "string",
          description: "Country code",
        },
      },
      required: ["p_country"],
    },
  },
  {
    name: "get_coverage_grid",
    description:
      "Generate a grid of cells and count locations in each cell. Use for coverage gap analysis and heatmap visualization.",
    input_schema: {
      type: "object" as const,
      properties: {
        p_country: {
          type: "string",
          description: "Country code",
        },
        p_grid_size_degrees: {
          type: "number",
          description:
            "Size of each grid cell in degrees (0.1 ≈ 10km, 0.5 ≈ 50km)",
          default: 0.5,
        },
      },
      required: ["p_country"],
    },
  },
  {
    name: "get_coverage_percentage",
    description:
      "Calculate what percentage of a country is within X kilometers of any location. Use for overall coverage metrics.",
    input_schema: {
      type: "object" as const,
      properties: {
        p_country: {
          type: "string",
          description: "Country code",
        },
        p_buffer_km: {
          type: "number",
          description: "Buffer radius in kilometers (default: 5.0)",
          default: 5.0,
        },
      },
      required: ["p_country"],
    },
  },
];

/**
 * Predefined region boundaries for common queries
 * Use these when user mentions a region by name
 */
export const REGION_BOUNDARIES: Record<
  string,
  {
    bounds: [number, number, number, number]; // [west, south, east, north]
    postcodes?: string[];
    cityName?: string; // Exact city name to filter by
  }
> = {
  // UK Regions
  scotland: {
    bounds: [-7.6, 54.6, -0.7, 60.9],
    postcodes: ["AB", "DD", "DG", "EH", "FK", "G", "HS", "IV", "KA", "KW", "KY", "ML", "PA", "PH", "TD", "ZE"],
  },
  wales: {
    bounds: [-5.3, 51.3, -2.6, 53.4],
    postcodes: ["CF", "LD", "LL", "NP", "SA", "SY"],
  },
  "northern ireland": {
    bounds: [-8.2, 54.0, -5.4, 55.3],
    postcodes: ["BT"],
  },
  england: {
    bounds: [-6.4, 49.9, 1.8, 55.8],
  },

  // Major UK Cities
  london: {
    bounds: [-0.51, 51.28, 0.33, 51.69],
    postcodes: ["E", "EC", "N", "NW", "SE", "SW", "W", "WC"],
    cityName: "London", // Filter by city = 'London'
  },
  "greater london": {
    bounds: [-0.51, 51.28, 0.33, 51.69],
    // No cityName - shows entire Greater London area
  },
  birmingham: {
    bounds: [-2.05, 52.38, -1.73, 52.58],
    postcodes: ["B"],
    cityName: "Birmingham",
  },
  manchester: {
    bounds: [-2.35, 53.38, -2.15, 53.55],
    postcodes: ["M"],
    cityName: "Manchester",
  },
  glasgow: {
    bounds: [-4.45, 55.75, -4.10, 55.95],
    postcodes: ["G"],
    cityName: "Glasgow",
  },
  edinburgh: {
    bounds: [-3.35, 55.90, -3.05, 56.00],
    postcodes: ["EH"],
    cityName: "Edinburgh",
  },
  liverpool: {
    bounds: [-3.05, 53.35, -2.85, 53.50],
    postcodes: ["L"],
    cityName: "Liverpool",
  },
  leeds: {
    bounds: [-1.75, 53.70, -1.40, 53.90],
    postcodes: ["LS"],
    cityName: "Leeds",
  },
  cardiff: {
    bounds: [-3.30, 51.45, -3.10, 51.55],
    postcodes: ["CF"],
    cityName: "Cardiff",
  },
  bristol: {
    bounds: [-2.70, 51.40, -2.50, 51.55],
    postcodes: ["BS"],
    cityName: "Bristol",
  },

  // Poland Regions (if needed)
  warsaw: {
    bounds: [20.85, 52.10, 21.27, 52.37],
    cityName: "Warsaw",
  },
  krakow: {
    bounds: [19.85, 50.00, 20.15, 50.12],
    cityName: "Krakow",
  },
};

/**
 * Helper function to detect region from user query
 */
export function detectRegion(question: string): {
  region: string;
  bounds: [number, number, number, number];
  cityName?: string;
} | null {
  const questionLower = question.toLowerCase();

  for (const [region, data] of Object.entries(REGION_BOUNDARIES)) {
    if (questionLower.includes(region.toLowerCase())) {
      return {
        region,
        bounds: data.bounds,
        cityName: data.cityName,
      };
    }
  }

  return null;
}
