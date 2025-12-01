import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COUNTRIES } from "@/lib/data/countries";
import type { CountryCode } from "@/types";
import { StatsView } from "@/components/dashboard/StatsView";
import {
  getCountryStatsOverview,
  getDensityByCity,
  getNetworkComparison,
} from "@/lib/supabase/queries";

interface StatsPageProps {
  params: Promise<{
    country: string;
  }>;
}

export default async function StatsPage({ params }: StatsPageProps) {
  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get and validate country
  const { country: countryParam } = await params;
  const countryCode = countryParam.toLowerCase() as CountryCode;

  if (!COUNTRIES[countryCode]) {
    redirect("/dashboard");
  }

  const country = COUNTRIES[countryCode];

  // Fetch all statistics data on the server using DAL
  const [overviewResult, densityResult, comparisonResult] = await Promise.all([
    getCountryStatsOverview(countryCode),
    getDensityByCity(countryCode),
    getNetworkComparison(countryCode),
  ]);

  // Handle errors
  if (overviewResult.error) {
    console.error("Failed to fetch overview stats:", overviewResult.error);
  }
  if (densityResult.error) {
    console.error("Failed to fetch density stats:", densityResult.error);
  }
  if (comparisonResult.error) {
    console.error("Failed to fetch comparison stats:", comparisonResult.error);
  }

  return (
    <StatsView
      country={country}
      overviewData={overviewResult.data}
      densityData={densityResult.data || []}
      comparisonData={comparisonResult.data || []}
    />
  );
}
