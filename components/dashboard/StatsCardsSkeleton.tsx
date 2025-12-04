import { Map, BarChart3 } from "lucide-react";

/**
 * Skeleton loader for dashboard stats cards.
 * Matches the structure of StatsCards for seamless loading transition.
 */
export function StatsCardsSkeleton() {
  const icons = [Map, BarChart3, Map];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {icons.map((Icon, i) => (
        <div
          key={i}
          className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {/* Label skeleton - matches text-sm */}
              <div
                className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
              {/* Value skeleton - matches text-3xl */}
              <div
                className="h-9 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
                style={{ animationDelay: `${i * 100 + 50}ms` }}
              />
            </div>
            {/* Icon container - same as actual */}
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Icon
                className="h-5 w-5 text-violet-400/30 animate-pulse"
                style={{ animationDelay: `${i * 100 + 100}ms` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
