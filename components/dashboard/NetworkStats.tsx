"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Location, NetworkName } from "@/types";
import { getNetworkConfig } from "@/lib/data/networks";

type NetworkStatsProps = {
  locations: Location[];
  originalTotal?: number; // Optional: total before filtering
};

export function NetworkStats({ locations, originalTotal }: NetworkStatsProps) {
  const { theme, resolvedTheme } = useTheme();

  // Calculate stats
  const stats = useMemo(() => {
    const currentTheme = (resolvedTheme || theme || 'dark') as 'light' | 'dark';
    const networkCounts = locations.reduce(
      (acc, location) => {
        acc[location.network_name] = (acc[location.network_name] || 0) + 1;
        return acc;
      },
      {} as Record<NetworkName, number>
    );

    const total = locations.length;

    return Object.entries(networkCounts).map(([networkName, count]) => {
      const network = getNetworkConfig(networkName as NetworkName, currentTheme);
      return {
        name: networkName,
        value: count,
        percentage: ((count / total) * 100).toFixed(1),
        color: network.color,
      };
    });
  }, [locations, theme, resolvedTheme]);

  const totalLocations = locations.length;
  const isFiltered = originalTotal !== undefined && originalTotal > totalLocations;

  return (
    <div className="space-y-6">
      {/* Total Count - Compact */}
      <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {isFiltered ? "Filtered Locations" : "Total Locations"}
            </h3>
            <p className="text-2xl font-semibold text-violet-500 dark:text-violet-400">
              {totalLocations.toLocaleString()}
            </p>
          </div>
          {isFiltered && (
            <p className="text-xs text-neutral-500">
              of {originalTotal.toLocaleString()} total
            </p>
          )}
        </div>
      </div>

      {/* Network Distribution List - Compact */}
      <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-3">
          Network Distribution
        </h3>
        <div className="space-y-2">
          {stats.map((stat) => (
            <div key={stat.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stat.color }}
                />
                <span className="text-neutral-700 dark:text-neutral-300 truncate text-xs">{stat.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-neutral-900 dark:text-neutral-50 font-medium text-xs">
                  {stat.value.toLocaleString()}
                </span>
                <span className="text-neutral-500 text-xs w-10 text-right">
                  {stat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pie Chart - Compact */}
      <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Visual Distribution
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={stats}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {stats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #404040",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#fafafa" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
