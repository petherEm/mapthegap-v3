"use client";

import { ChartBarIcon, MapPinIcon, BuildingOfficeIcon, SignalIcon } from "@heroicons/react/24/outline";
import type { CountryStatsOverview } from "@/lib/supabase/queries";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { NETWORKS } from "@/lib/data/networks";

interface CountryStatsProps {
  data: CountryStatsOverview | null;
}

export function CountryStats({ data: stats }: CountryStatsProps) {
  if (!stats) {
    return (
      <div className="p-8 text-center text-neutral-600 dark:text-neutral-400">
        No statistics available.
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = stats.networkBreakdown.map((item) => ({
    name: item.network,
    value: item.count,
    percentage: item.percentage,
  }));

  // Get colors for networks
  const getNetworkColor = (networkName: string) => {
    const network = NETWORKS[networkName as keyof typeof NETWORKS];
    return network?.color || "#94a3b8";
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <MapPinIcon className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Locations</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {stats.totalLocations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <SignalIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Networks</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{stats.totalNetworks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Cities</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{stats.totalCities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg per City</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {Math.round(stats.totalLocations / stats.totalCities)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-50">
            Network Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getNetworkColor(entry.name)}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend
                wrapperStyle={{ color: "#a3a3a3" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cities */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-50">
            Top 10 Cities
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {stats.topCities.map((city, index) => (
              <div
                key={city.city}
                className="flex items-center justify-between p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-500 w-6">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-neutral-800 dark:text-neutral-200">{city.city}</span>
                </div>
                <span className="text-sm font-semibold text-violet-500">
                  {city.count} locations
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
