import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCountryIndustryBreakdown } from "@/lib/supabase/queries";
import { NetworkSelectionCard } from "@/components/dashboard/NetworkSelectionCard";
import { COUNTRY_LIST } from "@/lib/data/countries";
import type { CountryDashboardStats } from "@/types";
import { Suspense } from "react";

async function MapsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch industry breakdown for all countries
  const countryStats: CountryDashboardStats[] = await Promise.all(
    COUNTRY_LIST.map(async (country) => {
      const { data: industries } = await getCountryIndustryBreakdown(
        country.code
      );

      const totalLocations =
        industries?.reduce((sum, ind) => sum + ind.count, 0) || 0;

      return {
        country,
        totalLocations,
        industries: industries || [],
        lastUpdated: new Date().toISOString(),
      };
    })
  );

  // Sort by total locations (descending)
  countryStats.sort((a, b) => b.totalLocations - a.totalLocations);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Select Networks to View
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose up to 5 networks from any country to display on the map
        </p>
      </div>

      {/* Country Cards - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {countryStats.map((stats) => (
          <div
            key={stats.country.code}
            className="bg-card/50 border border-border rounded-xl p-5 flex flex-col"
          >
            {/* Country Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl" aria-hidden="true">
                  {stats.country.flag}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {stats.country.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalLocations > 0 ? (
                      <>
                        {stats.totalLocations.toLocaleString()} location
                        {stats.totalLocations !== 1 ? "s" : ""}
                      </>
                    ) : (
                      "No locations yet"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Network Selection */}
            <NetworkSelectionCard
              industries={stats.industries}
              countryCode={stats.country.code}
            />
          </div>
        ))}
      </div>

      {/* Help Card */}
      <div className="mt-8 rounded-xl bg-card/50 border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          How to Use
        </h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Click network tags to select them (max 5)</li>
          <li>• Click &quot;Show on Map&quot; to view selected networks</li>
          <li>• Use × to remove networks from selection</li>
        </ul>
      </div>
    </>
  );
}

function MapsLoading() {
  return (
    <>
      <div className="mb-8">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card/50 border border-border rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-muted rounded animate-pulse" />
              <div>
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse mt-1" />
              </div>
            </div>
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </>
  );
}

export default function MapsPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Suspense fallback={<MapsLoading />}>
          <MapsContent />
        </Suspense>
      </div>
    </div>
  );
}
