import { Map, Upload, BarChart3 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Welcome Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="mt-2 h-5 w-80 bg-muted/50 rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[Map, BarChart3, Map].map((Icon, i) => (
            <div
              key={i}
              className="bg-card/50 border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="mt-2 h-9 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-violet-400/50" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Map, color: "violet" },
              { Icon: Upload, color: "emerald" },
              { Icon: BarChart3, color: "amber" },
            ].map((action, i) => (
              <div
                key={i}
                className="bg-card/50 border border-border rounded-xl p-5"
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
                <div className="mt-4 h-5 w-24 bg-muted rounded animate-pulse" />
                <div className="mt-2 h-4 w-full bg-muted/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started Skeleton */}
        <div className="bg-card/50 border border-border rounded-xl p-5">
          <div className="h-6 w-36 bg-muted rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400/50 text-xs font-medium">
                  {num}
                </span>
                <div className="flex-1">
                  <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                  <div className="mt-1 h-4 w-64 bg-muted/50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
