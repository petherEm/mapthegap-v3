"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MapPinIcon, ScaleIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import type { NetworkComparisonData } from "@/lib/supabase/queries";
import { NETWORKS } from "@/lib/data/networks";

interface NetworkComparisonDashboardProps {
  data: NetworkComparisonData[];
}

export function NetworkComparisonDashboard({ data }: NetworkComparisonDashboardProps) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-400">
        No network comparison data available.
      </div>
    );
  }

  // Get network color from NETWORKS config
  const getNetworkColor = (networkName: string) => {
    const network = NETWORKS[networkName as keyof typeof NETWORKS];
    return network?.color || "#94a3b8";
  };

  // Prepare chart data
  const barChartData = data.map((item) => ({
    network: item.network_name,
    Locations: item.location_count,
    "Coverage (km²)": Math.round(item.coverage_area_sqkm),
  }));

  const pieChartData = data.map((item) => ({
    name: item.network_name,
    value: item.location_count,
    percentage: item.market_share_pct,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-50">Network Comparison</h2>
        <p className="text-neutral-400 mt-1">
          Compare coverage and market share across networks
        </p>
      </div>

      {/* Network Cards - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((network) => (
          <div
            key={network.network_name}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
          >
            {/* Network Header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getNetworkColor(network.network_name) }}
              ></div>
              <h3 className="font-semibold text-neutral-50">{network.network_name}</h3>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Locations</p>
                  <p className="text-lg font-bold text-neutral-50">
                    {network.location_count.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ScaleIcon className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Coverage Area</p>
                  <p className="text-lg font-bold text-neutral-50">
                    {Math.round(network.coverage_area_sqkm).toLocaleString()} km²
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChartPieIcon className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Market Share</p>
                  <p className="text-lg font-bold text-neutral-50">
                    {network.market_share_pct}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Location Count & Coverage */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-neutral-50">
            Location Count & Coverage Area
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis dataKey="network" stroke="#a3a3a3" />
              <YAxis stroke="#a3a3a3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "#a3a3a3" }} />
              <Bar dataKey="Locations" fill="#f43f5e" />
              <Bar dataKey="Coverage (km²)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Market Share */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-neutral-50">
            Market Share Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {pieChartData.map((entry, index) => (
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
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-neutral-50">Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-2 px-3 font-semibold text-neutral-300">Rank</th>
                <th className="text-left py-2 px-3 font-semibold text-neutral-300">Network</th>
                <th className="text-right py-2 px-3 font-semibold text-neutral-300">Locations</th>
                <th className="text-right py-2 px-3 font-semibold text-neutral-300">
                  Coverage Area (km²)
                </th>
                <th className="text-right py-2 px-3 font-semibold text-neutral-300">
                  Market Share
                </th>
                <th className="text-right py-2 px-3 font-semibold text-neutral-300">
                  Density (loc/km²)
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((network, index) => {
                const density =
                  network.coverage_area_sqkm > 0
                    ? network.location_count / network.coverage_area_sqkm
                    : 0;

                return (
                  <tr
                    key={network.network_name}
                    className="border-b border-neutral-800 hover:bg-neutral-800/50"
                  >
                    <td className="py-2 px-3 text-neutral-500">{index + 1}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getNetworkColor(network.network_name) }}
                        ></div>
                        <span className="text-neutral-200">{network.network_name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-200">
                      {network.location_count.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-200">
                      {Math.round(network.coverage_area_sqkm).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-200">
                      {network.market_share_pct}%
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-200">
                      {density.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
