import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { executePostGISFunction, POSTGIS_TOOLS, detectRegion } from "@/lib/analytics/postgis-tools";
import type { Location, CountryCode } from "@/types";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

interface SearchRequest {
  query: string;
  country: CountryCode;
  type?: "auto" | "simple" | "nlp"; // auto = auto-detect
}

interface SearchResponse {
  type: "simple" | "nlp";
  locations: Location[];
  answer?: string; // For NLP queries
  visualization?: "map" | "chart" | "table" | "text";
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

// Detect if query is natural language
function isNaturalLanguageQuery(query: string): boolean {
  const nlpPatterns = [
    /show me/i,
    /find all/i,
    /what is/i,
    /what's/i,
    /how many/i,
    /compare/i,
    /which/i,
    /where are/i,
    /nearest/i,
    /coverage/i,
    /density/i,
    /gap/i,
    /distance/i,
    /between/i,
  ];
  return nlpPatterns.some((pattern) => pattern.test(query));
}

// Simple keyword search
async function simpleSearch(
  query: string,
  country: CountryCode
): Promise<{ locations: Location[]; error: Error | null }> {
  const supabase = await createClient();
  const searchTerm = `%${query}%`;

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("country", country)
    .eq("is_active", true)
    .or(
      `city.ilike.${searchTerm},street.ilike.${searchTerm},zip.ilike.${searchTerm},network_name.ilike.${searchTerm},subnetwork_name.ilike.${searchTerm}`
    )
    .order("city")
    .limit(100);

  if (error) {
    return { locations: [], error: error as Error };
  }

  return { locations: (data as Location[]) || [], error: null };
}

// NLP search using Claude
async function nlpSearch(
  query: string,
  country: CountryCode
): Promise<{
  locations: Location[];
  answer: string;
  queryType: string;
  error: Error | null;
}> {
  // Detect region from query
  let regionBounds = null;
  let cityFilter: string | null = null;
  const detectedRegion = detectRegion(query);
  if (detectedRegion) {
    regionBounds = detectedRegion.bounds;
    cityFilter = detectedRegion.cityName || null;
  }

  // Build system prompt
  const systemPrompt = `You are a geographic data analyst for MapTheGap, a location intelligence platform.

You help users find locations using natural language queries.

Current context:
- Country: ${country}
${regionBounds ? `- **IMPORTANT**: Region detected: Use these bounds [west, south, east, north]: ${regionBounds.join(", ")}` : ""}
${cityFilter ? `- **CITY FILTER**: Results will be automatically filtered to only show locations in city = "${cityFilter}"` : ""}

Your tasks:
1. Understand the user's search query
2. Choose the appropriate PostGIS function to answer it
3. ${regionBounds ? "**REQUIRED**: Use get_locations_in_viewport with the detected region bounds to filter locations" : "Execute the function to get data"}
4. Provide a clear, concise answer${cityFilter ? ` (mention that results are filtered to ${cityFilter} only)` : ""}

Available PostGIS functions:
- get_locations_in_viewport: Get locations in a bounding box (USE THIS when a region/city is mentioned!)
- find_nearest_locations: Find N nearest locations to a point
- get_density_by_city: Calculate location density per city
- compare_network_coverage: Compare networks by coverage metrics

**CRITICAL RULES**:
${regionBounds ? "- You MUST use get_locations_in_viewport with p_west, p_south, p_east, p_north parameters from the detected bounds" : ""}
- When user mentions a specific city/region (like London, Edinburgh, etc), ALWAYS use get_locations_in_viewport with proper bounds
- Only use comparison functions when explicitly asked to compare networks

Guidelines:
- Be concise but informative
- Use numbers and statistics when available
- If data is missing, say so honestly`;

  try {
    // Call Claude with function calling
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      tools: POSTGIS_TOOLS,
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
      system: systemPrompt,
    });

    // Process function calls
    let finalAnswer = "";
    let allLocations: Location[] = [];
    let queryType = "unknown";

    for (const block of response.content) {
      if (block.type === "tool_use") {
        queryType = block.name;

        const functionCall = {
          name: block.name,
          params: block.input as Record<string, any>,
        };

        const { data, error } = await executePostGISFunction(functionCall);

        if (error) {
          return {
            locations: [],
            answer: `Error executing query: ${error.message}`,
            queryType,
            error: error as Error,
          };
        }

        // For viewport queries, data is already location objects
        if (block.name === "get_locations_in_viewport" || block.name === "find_nearest_locations") {
          allLocations = (data as Location[]) || [];

          // Filter by city name if detected
          if (cityFilter && allLocations.length > 0) {
            allLocations = allLocations.filter((loc) =>
              loc.city.toLowerCase() === cityFilter.toLowerCase()
            );
          }
        }

        // Continue conversation with function result
        const followUpResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 2048,
          tools: POSTGIS_TOOLS,
          messages: [
            {
              role: "user",
              content: query,
            },
            {
              role: "assistant",
              content: response.content,
            },
            {
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: JSON.stringify(data),
                },
              ],
            },
          ],
          system: systemPrompt,
        });

        // Extract final text answer
        for (const followUpBlock of followUpResponse.content) {
          if (followUpBlock.type === "text") {
            finalAnswer = followUpBlock.text;
          }
        }
      } else if (block.type === "text") {
        finalAnswer = block.text;
      }
    }

    return {
      locations: allLocations,
      answer: finalAnswer || "I couldn't process that query. Please try rephrasing.",
      queryType,
      error: null,
    };
  } catch (error) {
    return {
      locations: [],
      answer: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      queryType: "error",
      error: error as Error,
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request body
    const body: SearchRequest = await request.json();
    const { query, country, type = "auto" } = body;

    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!country) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 });
    }

    // 3. Determine search type
    let searchType: "simple" | "nlp" =
      type === "auto" ? (isNaturalLanguageQuery(query) ? "nlp" : "simple") : (type as "simple" | "nlp");

    // 4. Execute search
    let locations: Location[] = [];
    let answer: string | undefined;
    let queryType = "simple_search";

    if (searchType === "simple") {
      const { locations: results, error } = await simpleSearch(query, country);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      locations = results;
    } else {
      // Check for API key before attempting NLP
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_api_key_here") {
        return NextResponse.json(
          {
            error: "NLP search not configured",
            message: "Please add your Anthropic API key to .env.local to enable natural language search.",
          },
          { status: 503 }
        );
      }

      const {
        locations: results,
        answer: nlpAnswer,
        queryType: nlpQueryType,
        error,
      } = await nlpSearch(query, country);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      locations = results;
      answer = nlpAnswer;
      queryType = nlpQueryType;
    }

    // 5. Calculate zoom bounds if we have locations
    let zoomTo: { lat: number; lng: number; zoom: number } | undefined;
    if (locations.length > 0) {
      const lats = locations.map((l) => l.lat);
      const lngs = locations.map((l) => l.lng);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      // Calculate appropriate zoom based on spread
      const latSpread = Math.max(...lats) - Math.min(...lats);
      const lngSpread = Math.max(...lngs) - Math.min(...lngs);
      const maxSpread = Math.max(latSpread, lngSpread);

      let zoom = 10;
      if (maxSpread > 5) zoom = 6;
      else if (maxSpread > 2) zoom = 8;
      else if (maxSpread > 0.5) zoom = 10;
      else zoom = 12;

      zoomTo = { lat: centerLat, lng: centerLng, zoom };
    }

    // 6. Build response
    const executionTime = Date.now() - startTime;

    const searchResponse: SearchResponse = {
      type: searchType,
      locations,
      answer,
      visualization: searchType === "nlp" && locations.length === 0 ? "text" : "map",
      metadata: {
        totalResults: locations.length,
        executionTime,
        queryType,
      },
      actions: {
        showOnMap: locations.length > 0,
        exportable: locations.length > 0,
        zoomTo,
      },
    };

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error("Search error:", error);

    return NextResponse.json(
      {
        error: "Unexpected error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
