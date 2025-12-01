import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cache Revalidation API
 *
 * POST /api/revalidate
 *
 * Invalidates cached location and statistics data.
 * Should be called after data imports to refresh the cache.
 *
 * Query params:
 * - country: (optional) Specific country code to invalidate
 * - tag: (optional) Specific cache tag to invalidate
 *
 * Authentication: Requires superadmin role
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check superadmin role
    const isSuperAdmin = user.email === process.env.SUPERADMIN_EMAIL;
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden - superadmin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const tag = searchParams.get("tag");

    const revalidatedTags: string[] = [];

    if (tag) {
      // Revalidate specific tag
      revalidateTag(tag, "max");
      revalidatedTags.push(tag);
    } else if (country) {
      // Revalidate country-specific caches
      revalidateTag(`locations-${country}`, "max");
      revalidateTag(`stats-${country}`, "max");
      revalidatedTags.push(`locations-${country}`, `stats-${country}`);
    } else {
      // Revalidate all location and stats caches
      revalidateTag("locations", "max");
      revalidateTag("stats", "max");
      revalidateTag("global-stats", "max");
      revalidateTag("industry-stats", "max");
      revalidatedTags.push("locations", "stats", "global-stats", "industry-stats");
    }

    return NextResponse.json({
      success: true,
      revalidated: revalidatedTags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate cache" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate - Check cache status (for debugging)
 */
export async function GET() {
  return NextResponse.json({
    message: "Cache revalidation endpoint",
    usage: {
      method: "POST",
      params: {
        country: "Optional - specific country code (e.g., 'poland')",
        tag: "Optional - specific cache tag to invalidate",
      },
      examples: [
        "POST /api/revalidate - Invalidate all caches",
        "POST /api/revalidate?country=poland - Invalidate Poland caches",
        "POST /api/revalidate?tag=locations - Invalidate locations tag",
      ],
    },
    cacheProfiles: {
      locations: "6 hours revalidate, 24 hours expire",
      stats: "6 hours revalidate, 24 hours expire",
    },
  });
}
