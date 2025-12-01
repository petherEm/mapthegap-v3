import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { COUNTRIES } from "@/lib/data/countries";
import { getCachedLocationsByCountry } from "@/lib/supabase/cached-queries";
import type { CountryCode } from "@/types";
import { CountryMapView } from "@/components/dashboard/CountryMapView";

// Note: Using Next.js 16 'use cache' directive in cached-queries.ts
// This caches location data for 6 hours with on-demand revalidation via tags.
// Auth checks remain dynamic while data fetching is cached.

type PageProps = {
  params: Promise<{
    country: string;
  }>;
};

export default async function CountryMapPage({ params }: PageProps) {
  const { country } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Validate country code
  const countryCode = country as CountryCode;
  const countryData = COUNTRIES[countryCode];

  if (!countryData) {
    notFound();
  }

  // Fetch locations for this country (cached for 6 hours)
  let locations;
  try {
    locations = await getCachedLocationsByCountry(countryCode);
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral-50">
            Error loading locations
          </h2>
          <p className="mt-2 text-neutral-400">
            {error instanceof Error ? error.message : "Failed to fetch location data"}
          </p>
        </div>
      </div>
    );
  }

  // Get available networks from actual data in the database
  // This ensures imported networks show up even if not in country config
  const availableNetworks = Array.from(
    new Set(locations.map((loc) => loc.network_name))
  );

  return (
    <CountryMapView
      country={countryData}
      locations={locations}
      availableNetworks={availableNetworks}
    />
  );
}

// Generate static params for all countries
export async function generateStaticParams() {
  return Object.keys(COUNTRIES).map((country) => ({
    country,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { country } = await params;
  const countryData = COUNTRIES[country as CountryCode];

  if (!countryData) {
    return {
      title: "Country Not Found",
    };
  }

  return {
    title: `${countryData.name} - Money Transfer Locations | MapTheGap`,
    description: `View ${
      countryData.name
    } money transfer locations across ${countryData.networks.join(", ")}`,
  };
}
