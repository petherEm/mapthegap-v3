import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Map, Upload, BarChart3, ArrowRight } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { StatsCardsSkeleton } from "@/components/dashboard/StatsCardsSkeleton";

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Welcome Header - Shows immediately */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s an overview of your location data
          </p>
        </div>

        {/* Stats Cards - Loads with skeleton fallback */}
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards />
        </Suspense>

        {/* Quick Actions - Shows immediately */}
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

        {/* Getting Started - Shows immediately */}
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
