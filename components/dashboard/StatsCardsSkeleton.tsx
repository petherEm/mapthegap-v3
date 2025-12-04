"use client";

import { Map, BarChart3 } from "lucide-react";

export function StatsCardsSkeleton() {
  return (
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
  );
}
