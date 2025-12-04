import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CountryListServer } from "@/components/dashboard/CountryListServer";
import { CountryListSkeleton } from "@/components/dashboard/CountryListSkeleton";

export default async function MapsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 pb-20">
        {/* Header - Shows immediately */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Explore Network Locations
          </h1>
          <p className="mt-1 text-muted-foreground">
            Select a country and networks to view on the map
          </p>
        </div>

        {/* Country List - Loads with skeleton fallback */}
        <Suspense fallback={
          <>
            {/* Search Bar Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
            </div>
            <CountryListSkeleton />
            {/* Bottom Bar Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border">
              <div className="mx-auto max-w-4xl px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-8 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </>
        }>
          <CountryListServer />
        </Suspense>
      </div>
    </div>
  );
}
