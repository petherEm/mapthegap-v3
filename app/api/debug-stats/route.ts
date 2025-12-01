import { NextResponse } from "next/server";
import { createCacheClient } from "@/lib/supabase/cache-client";

export async function GET() {
  const supabase = createCacheClient();

  // Get all unique networks in database with pagination
  const PAGE_SIZE = 1000;
  let allLocations: Array<{ country: string; network_name: string; is_active: boolean }> = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("locations")
      .select("country, network_name, is_active")
      .eq("is_active", true)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
  const stats = new Map<string, number>();
  const networksByCountry = new Map<string, Set<string>>();

  allLocations.forEach((loc) => {
    const key = `${loc.country}:${loc.network_name}`;
    stats.set(key, (stats.get(key) || 0) + 1);

    if (!networksByCountry.has(loc.country)) {
      networksByCountry.set(loc.country, new Set());
    }
    networksByCountry.get(loc.country)?.add(loc.network_name);
  });

  // Format results
  const results = {
    totalLocations: allLocations.length,
    pagesLoaded: page,
    networksByCountry: Object.fromEntries(
      Array.from(networksByCountry.entries()).map(([country, networks]) => [
        country,
        {
          networks: Array.from(networks).sort(),
          counts: Object.fromEntries(
            Array.from(networks).map((network) => [
              network,
              stats.get(`${country}:${network}`) || 0,
            ])
          ),
        },
      ])
    ),
    rawStats: Object.fromEntries(stats),
  };

  return NextResponse.json(results, { status: 200 });
}
