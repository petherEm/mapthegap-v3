"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DensityData } from "@/lib/supabase/queries";

interface DensityAnalysisChartProps {
  data: DensityData[];
}

export function DensityAnalysisChart({ data }: DensityAnalysisChartProps) {
  const [sortBy, setSortBy] = useState<"density" | "count">("density");

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-400">
        No density data available.
      </div>
    );
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === "density") {
      return b.density_per_sqkm - a.density_per_sqkm;
    }
    return b.location_count - a.location_count;
  }).slice(0, 20); // Top 20 cities

  // Prepare chart data
  const chartData = sortedData.map((item) => ({
    city: item.city,
    Density: Math.round(item.density_per_sqkm * 10) / 10,
    Locations: item.location_count,
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-50">City Density Analysis</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("density")}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === "density"
                ? "bg-violet-500 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Sort by Density
          </button>
          <button
            onClick={() => setSortBy("count")}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === "count"
                ? "bg-violet-500 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Sort by Location Count
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-neutral-50">
          Top 20 Cities by {sortBy === "density" ? "Density" : "Location Count"}
        </h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis type="number" stroke="#a3a3a3" />
            <YAxis dataKey="city" type="category" stroke="#a3a3a3" width={90} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #404040",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ color: "#a3a3a3" }} />
            <Bar dataKey="Density" fill="#f43f5e" name="Density (per km²)" />
            <Bar dataKey="Locations" fill="#3b82f6" name="Total Locations" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-neutral-50">Detailed Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-2 px-3 font-semibold text-neutral-300">#</th>
                <th className="text-left py-2 px-3 font-semibold text-neutral-300">City</th>
                <th className="text-right py-2 px-3 font-semibold text-neutral-300">Locations</th>
                <th className="text-right py-2 px-3 font-semibold text-neutral-300">Density (per km²)</th>
                <th className="text-left py-2 px-3 font-semibold text-neutral-300">Networks</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={item.city} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                  <td className="py-2 px-3 text-neutral-500">{index + 1}</td>
                  <td className="py-2 px-3 text-neutral-200">{item.city}</td>
                  <td className="py-2 px-3 text-right text-neutral-200">{item.location_count}</td>
                  <td className="py-2 px-3 text-right text-neutral-200">
                    {item.density_per_sqkm.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-neutral-400 text-xs">
                    {item.networks.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
