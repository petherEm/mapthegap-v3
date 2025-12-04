import { Map, Upload, BarChart3 } from "lucide-react";
import { StatsCardsSkeleton } from "@/components/dashboard/StatsCardsSkeleton";

export default function DashboardLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Welcome Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          <div className="mt-2 h-5 w-80 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton - Reuse component */}
        <StatsCardsSkeleton />

        {/* Quick Actions - Show real content since it's static */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Map, color: "violet", title: "View Maps" },
              { Icon: Upload, color: "emerald", title: "Import Data" },
              { Icon: BarChart3, color: "amber", title: "Analytics" },
            ].map((action, i) => (
              <div
                key={i}
                className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
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
                    <action.Icon
                      className={`h-5 w-5 ${
                        action.color === "violet"
                          ? "text-violet-400/50"
                          : action.color === "emerald"
                          ? "text-emerald-400/50"
                          : "text-amber-400/50"
                      }`}
                    />
                  </div>
                </div>
                <div
                  className="mt-4 h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
                <div
                  className="mt-2 h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"
                  style={{ animationDelay: `${i * 100 + 50}ms` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started - Show real structure */}
        <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Getting Started
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400/50 text-xs font-medium">
                  {num}
                </span>
                <div className="flex-1">
                  <div
                    className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
                    style={{ animationDelay: `${num * 75}ms` }}
                  />
                  <div
                    className="mt-1 h-4 w-64 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"
                    style={{ animationDelay: `${num * 75 + 25}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
