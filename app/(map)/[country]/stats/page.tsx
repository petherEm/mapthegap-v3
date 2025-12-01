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

export default async function StatsPage({ params }: StatsPageProps) {
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
