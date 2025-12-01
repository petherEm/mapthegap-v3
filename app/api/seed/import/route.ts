import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COUNTRIES } from "@/lib/data/countries";
import type { NetworkName, CountryCode, KnownNetworkName } from "@/types";

// Map country codes from ISO to internal format
const COUNTRY_MAP: Record<string, CountryCode> = {
  PL: "poland",
  LT: "lithuania",
  LV: "latvia",
  EE: "estonia",
  GB: "gb",
  UK: "gb", // Alias for GB
  FR: "france",
  HN: "honduras",
  US: "usa",
};

// Known network names with exact casing (to match database)
const KNOWN_NETWORK_NAMES: Record<string, KnownNetworkName> = {
  "ria": "Ria",
  "western union": "Western Union",
  "westernunion": "Western Union",
  "moneygram": "MoneyGram",
  "money gram": "MoneyGram",
  "poczta polska": "Poczta Polska",
  "pocztapolska": "Poczta Polska",
};

// Standardize network name (preserve exact casing for known networks)
function standardizeNetworkName(rawName: string): NetworkName {
  const normalized = rawName.toLowerCase().trim();

  // Check if it's a known network (case-insensitive)
  if (normalized in KNOWN_NETWORK_NAMES) {
    return KNOWN_NETWORK_NAMES[normalized];
  }

  // For unknown networks, capitalize first letter of each word
  return rawName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Auto-detect industry category based on network name
function detectIndustryCategory(networkName: string): string {
  const normalized = networkName.toLowerCase();

  // Pawn shops / Lombards
  if (normalized.includes("loombard") || normalized.includes("lombard") || normalized.includes("pawn")) {
    return "pawn_shop";
  }

  // ATM networks
  if (normalized.includes("euronet") || normalized.includes("atm")) {
    return "atm";
  }

  // Banks
  if (normalized.includes("bank") || normalized.includes("pekao") || normalized.includes("pko")) {
    return "banking";
  }

  // Retail stores
  if (normalized.includes("walmart") || normalized.includes("target") || normalized.includes("walgreens")) {
    return "retail";
  }

  // Grocery stores
  if (normalized.includes("lidl") || normalized.includes("aldi") || normalized.includes("tesco")) {
    return "grocery";
  }

  // Postal services
  if (normalized.includes("poczta") || normalized.includes("post") || normalized.includes("usps")) {
    return "postal";
  }

  // Default: money transfer
  return "money_transfer";
}

// Auto-detect tags based on network name and industry
function detectTags(networkName: string, industryCategory: string): string[] {
  const normalized = networkName.toLowerCase();
  const tags: string[] = [];

  // Add industry-specific tags
  if (industryCategory === "pawn_shop") {
    tags.push("pawn_shop", "loans", "buy_sell");
  } else if (industryCategory === "atm") {
    tags.push("atm", "cash_withdrawal");
  } else if (industryCategory === "money_transfer") {
    tags.push("money_transfer");
  } else if (industryCategory === "banking") {
    tags.push("banking");
  } else if (industryCategory === "retail") {
    tags.push("retail");
  } else if (industryCategory === "grocery") {
    tags.push("grocery");
  } else if (industryCategory === "postal") {
    tags.push("postal_services");
  }

  // Add 24h tag if detected
  if (normalized.includes("24") || normalized.includes("24h") || normalized.includes("24 hour")) {
    tags.push("24h");
  }

  return tags.length > 0 ? tags : ["money_transfer"];
}

interface RawLocation {
  id: string;
  network_name: string;
  street: string;
  zip: string | null;
  city: string;
  county: string | null;
  country: string;
  lat: number;
  lng: number;
  description?: string;
  is_active: boolean;
  phone?: string;
  subnetwork_name?: string | null;
  // Industry categorization fields (optional in import)
  industry_category?: string;
  brand_name?: string;
  tags?: string[];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to import data." },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { locations, network, replace = false, countryOverride } = body;

    if (!locations || !Array.isArray(locations)) {
      return NextResponse.json(
        { error: "Invalid request. 'locations' array is required." },
        { status: 400 }
      );
    }

    if (!network || typeof network !== "string" || network.trim() === "") {
      return NextResponse.json(
        {
          error: "Invalid network. Network name is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    // Validate country override if provided (dynamically from COUNTRIES config)
    const validCountryCodes = Object.keys(COUNTRIES) as CountryCode[];
    if (countryOverride && !validCountryCodes.includes(countryOverride as CountryCode)) {
      return NextResponse.json(
        {
          error: `Invalid country override. Must be one of: ${validCountryCodes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Standardize network name (e.g., "loombard" → "Loombard", "western union" → "Western Union")
    const networkName = standardizeNetworkName(network);

    // Transform and validate the data
    const transformedLocations = [];
    const skippedLocations = [];
    const seenIds = new Set<string>(); // Track IDs to detect duplicates in JSON

    for (const loc of locations as RawLocation[]) {
      // Skip locations with invalid coordinates
      if (
        loc.lat === null ||
        loc.lat === undefined ||
        loc.lng === null ||
        loc.lng === undefined ||
        isNaN(loc.lat) ||
        isNaN(loc.lng)
      ) {
        skippedLocations.push({
          id: loc.id,
          reason: "Invalid coordinates (null or NaN lat/lng)",
          lat: loc.lat,
          lng: loc.lng,
        });
        continue;
      }

      // Create composite ID to avoid collisions
      const uniqueId = `${network.toLowerCase()}-${loc.id}`;

      // Check for duplicate IDs within the JSON file
      if (seenIds.has(uniqueId)) {
        skippedLocations.push({
          id: loc.id,
          reason: `Duplicate ID in JSON file (${uniqueId})`,
          lat: loc.lat,
          lng: loc.lng,
        });
        continue;
      }
      seenIds.add(uniqueId);

      // Move network_name to subnetwork_name if it's not a standard network
      const subnetworkName =
        loc.subnetwork_name || (loc.network_name !== network ? loc.network_name : null);

      // Clean phone number (remove invalid values like "1" or empty strings)
      const phone =
        loc.phone && loc.phone.trim() !== "" && loc.phone !== "1" ? loc.phone : null;

      // Use country override if provided, otherwise map from data
      const country = countryOverride || COUNTRY_MAP[loc.country] || "poland";

      // Industry categorization: use from data, or auto-detect from network name
      const industryCategory = loc.industry_category || detectIndustryCategory(networkName);

      // Brand name: use from data, or fallback to subnetwork_name, or network_name
      const brandName = loc.brand_name || subnetworkName || networkName;

      // Tags: use from data, or auto-detect from network name and industry
      const tags = loc.tags && loc.tags.length > 0 ? loc.tags : detectTags(networkName, industryCategory);

      transformedLocations.push({
        id: uniqueId,
        network_name: networkName,
        subnetwork_name: subnetworkName,
        street: loc.street,
        zip: loc.zip || "N/A",
        city: loc.city,
        county: loc.county || null,
        country,
        lat: loc.lat,
        lng: loc.lng,
        phone,
        description: loc.description || null,
        is_active: loc.is_active,
        // Industry categorization fields
        industry_category: industryCategory,
        brand_name: brandName,
        tags,
      });
    }

    console.log(`[Import] Validation complete: ${transformedLocations.length} valid, ${skippedLocations.length} skipped`);
    if (skippedLocations.length > 0) {
      console.warn(`[Import] Skipped locations with invalid coordinates:`, skippedLocations.slice(0, 5));
      if (skippedLocations.length > 5) {
        console.warn(`[Import] ... and ${skippedLocations.length - 5} more`);
      }
    }

    // If replace is true, delete existing locations for this network AND country combination
    let totalDeleted = 0;
    if (replace) {
      // Determine which countries are being affected by this import
      const affectedCountries = countryOverride
        ? [countryOverride] // If override is set, only that country
        : [...new Set(transformedLocations.map((loc) => loc.country))]; // Otherwise, all unique countries in the data

      console.log(`[Import] Replace mode enabled`);
      console.log(`[Import] Network to replace: "${networkName}" (exact match required)`);
      console.log(`[Import] Countries affected:`, affectedCountries);

      for (const country of affectedCountries) {
        const { error: deleteError, count } = await supabase
          .from("locations")
          .delete({ count: "exact" })
          .eq("network_name", networkName)
          .eq("country", country);

        if (deleteError) {
          console.error(`[Import] Delete failed for ${country}:`, deleteError);
          return NextResponse.json(
            {
              error: `Failed to clear existing ${networkName} locations for ${country}`,
              details: deleteError.message,
            },
            { status: 500 }
          );
        }

        const deletedCount = count || 0;
        totalDeleted += deletedCount;
        console.log(`[Import] ✓ Deleted ${deletedCount} existing "${networkName}" locations from ${country}`);
      }

      console.log(`[Import] Total deleted: ${totalDeleted} locations`);
    }

    // Insert locations in batches (Supabase has a limit)
    const batchSize = 1000;
    let inserted = 0;
    const errors = [];

    console.log(`[Import] Starting batch insertion: ${transformedLocations.length} total locations`);
    console.log(`[Import] Network: ${networkName}, Replace mode: ${replace}`);

    for (let i = 0; i < transformedLocations.length; i += batchSize) {
      const batch = transformedLocations.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      console.log(`[Import] Processing batch ${batchNum}: ${batch.length} locations (index ${i} to ${i + batch.length - 1})`);

      const { data, error } = await supabase
        .from("locations")
        .insert(batch)
        .select();

      if (error) {
        console.error(`[Import] Batch ${batchNum} failed:`, error.message);
        console.error(`[Import] Error details:`, error);

        // Check if it's a duplicate key error
        const isDuplicateKeyError = error.code === "23505" || error.message.includes("duplicate key");

        errors.push({
          batch: batchNum,
          startIndex: i,
          endIndex: i + batch.length - 1,
          batchSize: batch.length,
          error: error.message,
          code: error.code,
          hint: isDuplicateKeyError
            ? `💡 Tip: Check "Replace existing locations for this network & country" to overwrite existing ${networkName} data, or delete existing ${networkName} locations from Supabase first.`
            : error.hint,
          details: error.details,
        });
      } else {
        const insertedCount = data?.length || 0;
        console.log(`[Import] Batch ${batchNum} succeeded: ${insertedCount} locations inserted`);
        inserted += insertedCount;
      }
    }

    console.log(`[Import] Completed. Total inserted: ${inserted} / ${transformedLocations.length}`);

    // Generate summary by country
    const summary = transformedLocations.reduce(
      (acc, loc) => {
        acc[loc.country] = (acc[loc.country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Invalidate cache for all affected country pages
    // This ensures users see fresh data after import
    const affectedCountries = Object.keys(summary);
    console.log(`[Import] Invalidating cache for countries:`, affectedCountries);

    for (const country of affectedCountries) {
      // Invalidate route-level cache
      revalidatePath(`/${country}`, "page");
    }

    // Invalidate function-level cache for industry stats
    // This clears the unstable_cache used by getCountryIndustryBreakdown
    // In Next.js 16, revalidateTag requires a profile argument
    revalidateTag("industry-stats", "default");

    // Also invalidate dashboard and maps to update counts
    revalidatePath("/dashboard", "page");
    revalidatePath("/maps", "page");

    console.log(`[Import] Cache invalidation completed (paths + industry-stats tag)`);

    const response = {
      success: inserted > 0,
      message:
        inserted === transformedLocations.length && skippedLocations.length === 0
          ? replace
            ? `Replaced ${networkName} locations successfully!${totalDeleted > 0 ? ` (Deleted ${totalDeleted} old locations)` : ""}`
            : `Imported ${networkName} locations successfully!`
          : `Partially imported ${networkName} locations. ${inserted} succeeded, ${transformedLocations.length - inserted} failed${skippedLocations.length > 0 ? `, ${skippedLocations.length} skipped (invalid coordinates)` : ""}.`,
      network: networkName,
      totalReceived: locations.length,
      validLocations: transformedLocations.length,
      skipped: skippedLocations.length,
      inserted,
      failed: transformedLocations.length - inserted,
      deleted: totalDeleted,
      summary,
      errors: errors.length > 0 ? errors : undefined,
    };

    if (errors.length > 0) {
      console.warn(`[Import] Import completed with ${errors.length} batch error(s)`);
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
