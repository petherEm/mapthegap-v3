import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCachedCountryIndustryBreakdown } from "@/lib/supabase/cached-queries";
import { COUNTRY_LIST } from "@/lib/data/countries";
import { Map, Upload, BarChart3, ArrowRight } from "lucide-react";
import { Suspense } from "react";

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted/50 rounded mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard content component with auth check (wrapped in Suspense)
async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get total stats (cached for 6 hours)
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

  const quickActions = [
    {
      title: "View Maps",
      description: "Select networks and explore locations on interactive maps",
      href: "/maps",
      icon: Map,
      color: "violet",
    },
    {
      title: "Import Data",
      description: "Upload JSON files to add new location data",
      href: "/import",
      icon: Upload,
      color: "emerald",
    },
    {
      title: "Analytics",
      description: "Ask questions and get insights about your data",
      href: "/analytics",
      icon: BarChart3,
      color: "amber",
    },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s an overview of your location data
          </p>
        </div>

        {/* Stats Cards */}
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-card/50 border border-border rounded-xl p-5 hover:border-violet-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      action.color === "violet"
                        ? "bg-violet-500/10"
                        : action.color === "emerald"
                        ? "bg-emerald-500/10"
                        : "bg-amber-500/10"
                    }`}
                  >
                    <action.icon
                      className={`h-5 w-5 ${
                        action.color === "violet"
                          ? "text-violet-400"
                          : action.color === "emerald"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-card/50 border border-border rounded-xl p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Getting Started
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Import your location data
                </p>
                <p className="text-muted-foreground">
                  Upload JSON files containing location coordinates and network info
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Select networks to view
                </p>
                <p className="text-muted-foreground">
                  Choose up to 5 networks from the Maps page to display
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Explore on the interactive map
                </p>
                <p className="text-muted-foreground">
                  View clusters, individual locations, and coverage gaps
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
