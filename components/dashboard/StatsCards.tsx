import { Map, BarChart3 } from "lucide-react";
import { getCachedCountryIndustryBreakdown } from "@/lib/supabase/cached-queries";
import { COUNTRY_LIST } from "@/lib/data/countries";

export async function StatsCards() {
  // Fetch stats in parallel
  let totalLocations = 0;
  let totalNetworks = new Set<string>();
  let totalCountriesWithData = 0;

  await Promise.all(
    COUNTRY_LIST.map(async (country) => {
      try {
        const industries = await getCachedCountryIndustryBreakdown(country.code);
        if (industries && industries.length > 0) {
          totalCountriesWithData++;
          industries.forEach((ind) => {
            totalLocations += ind.count;
            ind.networks.forEach((n) => totalNetworks.add(n.name));
          });
        }
      } catch (error) {
        console.error(`Failed to fetch industry breakdown for ${country.code}:`, error);
      }
    })
  );

  const stats = [
    {
      label: "Total Locations",
      value: totalLocations.toLocaleString(),
      icon: Map,
    },
    {
      label: "Networks",
      value: totalNetworks.size.toString(),
      icon: BarChart3,
    },
    {
      label: "Countries",
      value: totalCountriesWithData.toString(),
      icon: Map,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card/50 border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {stat.value}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <stat.icon className="h-5 w-5 text-violet-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
