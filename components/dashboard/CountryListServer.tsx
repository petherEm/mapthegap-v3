import { getCachedCountryIndustryBreakdown } from "@/lib/supabase/cached-queries";
import { COUNTRY_LIST } from "@/lib/data/countries";
import { MapsPageClient } from "./MapsPageClient";
import type { CountryDashboardStats } from "@/types";

export async function CountryListServer() {
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
