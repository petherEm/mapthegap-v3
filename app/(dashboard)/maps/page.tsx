import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCachedCountryIndustryBreakdown } from "@/lib/supabase/cached-queries";
import { MapsPageClient } from "@/components/dashboard/MapsPageClient";
import { COUNTRY_LIST } from "@/lib/data/countries";
import type { CountryDashboardStats } from "@/types";
import { Suspense } from "react";

// Maps content component with auth check (wrapped in Suspense)
async function MapsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch industry breakdown for all countries (cached for 6 hours)
  const countryStats: CountryDashboardStats[] = await Promise.all(
    COUNTRY_LIST.map(async (country) => {
      try {
        const industries = await getCachedCountryIndustryBreakdown(country.code);

        const totalLocations =
          industries?.reduce((sum, ind) => sum + ind.count, 0) || 0;

        return {
          country,
          totalLocations,
          industries: industries || [],
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Failed to fetch industry breakdown for ${country.code}:`, error);
        return {
          country,
          totalLocations: 0,
          industries: [],
          lastUpdated: new Date().toISOString(),
        };
      }
    })
  );

  // Sort by total locations (descending)
  countryStats.sort((a, b) => b.totalLocations - a.totalLocations);

  return <MapsPageClient countryStats={countryStats} />;
}

function MapsLoading() {
  return (
    <div className="pb-20">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted/50 rounded animate-pulse mt-2" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Country Accordions Skeleton */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border border-border rounded-lg bg-card/30 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted/50 rounded animate-pulse mt-1" />
              </div>
              <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-8 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapsPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <Suspense fallback={<MapsLoading />}>
          <MapsContent />
        </Suspense>
      </div>
    </div>
  );
}
