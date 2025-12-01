import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COUNTRIES } from "@/lib/data/countries";
import type { CountryCode } from "@/types";
import { StatsView } from "@/components/dashboard/StatsView";
import {
  getCachedCountryStatsOverview,
  getCachedDensityByCity,
  getCachedNetworkComparison,
} from "@/lib/supabase/cached-queries";
import { Suspense } from "react";

// Generate static params for all countries - enables ISR with caching
export async function generateStaticParams() {
  return Object.keys(COUNTRIES).map((country) => ({
    country,
  }));
}

interface StatsPageProps {
  params: Promise<{
    country: string;
  }>;
}

// Loading fallback component
function StatsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  );
}

// Stats content component with auth check (wrapped in Suspense)
// Must receive params as Promise and await inside
async function StatsContent({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  // Await params inside Suspense boundary
  const { country: countryParam } = await params;

  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get and validate country
  const countryCode = countryParam.toLowerCase() as CountryCode;

  if (!COUNTRIES[countryCode]) {
    redirect("/dashboard");
  }

  const country = COUNTRIES[countryCode];

  // Fetch all statistics data using cached queries (6 hour cache)
  const [overviewData, densityData, comparisonData] = await Promise.all([
    getCachedCountryStatsOverview(countryCode).catch((error) => {
      console.error("Failed to fetch overview stats:", error);
      return null;
    }),
    getCachedDensityByCity(countryCode).catch((error) => {
      console.error("Failed to fetch density stats:", error);
      return [];
    }),
    getCachedNetworkComparison(countryCode).catch((error) => {
      console.error("Failed to fetch comparison stats:", error);
      return [];
    }),
  ]);

  return (
    <StatsView
      country={country}
      overviewData={overviewData}
      densityData={densityData}
      comparisonData={comparisonData}
    />
  );
}

export default function StatsPage({ params }: StatsPageProps) {
  return (
    <Suspense fallback={<StatsLoading />}>
      <StatsContent params={params} />
    </Suspense>
  );
}
