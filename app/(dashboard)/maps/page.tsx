import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCachedCountryIndustryBreakdown } from "@/lib/supabase/cached-queries";
import { MapsPageClient } from "@/components/dashboard/MapsPageClient";
import { COUNTRY_LIST } from "@/lib/data/countries";
import type { CountryDashboardStats } from "@/types";

export default async function MapsPage() {
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

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <MapsPageClient countryStats={countryStats} />
      </div>
    </div>
  );
}
