"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CountryNetworkStat, Country, NetworkName } from "@/types";
import { COUNTRIES } from "@/lib/data/countries";
import { getNetworkConfig } from "@/lib/data/networks";
import { MapIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

type SortField = "country" | "total";
type SortDirection = "asc" | "desc";

interface CountryStatsTableProps {
  statistics: CountryNetworkStat[];
}

interface TableRow {
  country: Country;
  totalLocations: number;
  networkCounts: Array<{ network: NetworkName; count: number }>;
  lastUpdated: string;
}

export function CountryStatsTable({ statistics }: CountryStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>("country");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Transform statistics into table rows
  const tableRows = useMemo(() => {
    const rowMap = new Map<string, TableRow>();

    // Initialize rows for all countries
    Object.values(COUNTRIES).forEach((country) => {
      rowMap.set(country.code, {
        country,
        totalLocations: 0,
        networkCounts: [],
        lastUpdated: "",
      });
    });

    // Populate with statistics from database
    statistics.forEach((stat) => {
      const row = rowMap.get(stat.country);
      if (row) {
        row.totalLocations += stat.count;

        // Add network count
        row.networkCounts.push({
          network: stat.network_name,
          count: stat.count,
        });

        // Track most recent update
        if (!row.lastUpdated || stat.last_updated > row.lastUpdated) {
          row.lastUpdated = stat.last_updated;
        }
      }
    });

    // Sort network counts alphabetically within each row
    rowMap.forEach((row) => {
      row.networkCounts.sort((a, b) => a.network.localeCompare(b.network));
    });

    return Array.from(rowMap.values());
  }, [statistics]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    const rows = [...tableRows];

    rows.sort((a, b) => {
      let comparison = 0;

      if (sortField === "country") {
        comparison = a.country.name.localeCompare(b.country.name);
      } else if (sortField === "total") {
        comparison = a.totalLocations - b.totalLocations;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return rows;
  }, [tableRows, sortField, sortDirection]);

  // Handle column header click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to descending for numbers
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpIcon className="w-4 h-4 text-neutral-600" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="w-4 h-4 text-violet-400" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 text-violet-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-800">
              {/* Country Column */}
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-neutral-900/50 transition-colors"
                onClick={() => handleSort("country")}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                  <span>Country</span>
                  <SortIcon field="country" />
                </div>
              </th>

              {/* Total Column */}
              <th
                className="px-4 py-3 text-right cursor-pointer hover:bg-neutral-900/50 transition-colors"
                onClick={() => handleSort("total")}
              >
                <div className="flex items-center justify-end gap-2 text-sm font-semibold text-neutral-300">
                  <span>Total Locations</span>
                  <SortIcon field="total" />
                </div>
              </th>

              {/* Networks Column */}
              <th className="px-4 py-3 text-left">
                <div className="text-sm font-semibold text-neutral-300">
                  Networks
                </div>
              </th>

              {/* Last Updated Column */}
              <th className="px-4 py-3 text-right">
                <div className="text-sm font-semibold text-neutral-300">
                  Last Updated
                </div>
              </th>

              {/* Actions Column */}
              <th className="px-4 py-3 text-center">
                <div className="text-sm font-semibold text-neutral-300">
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.country.code}
                className="border-b border-neutral-800 hover:bg-neutral-900/30 transition-colors"
              >
                {/* Country */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-label={row.country.name}>
                      {row.country.flag}
                    </span>
                    <span className="text-neutral-50 font-medium">
                      {row.country.name}
                    </span>
                  </div>
                </td>

                {/* Total */}
                <td className="px-4 py-4 text-right text-neutral-50 font-semibold">
                  {formatNumber(row.totalLocations)}
                </td>

                {/* Networks with Counts */}
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {row.networkCounts.length > 0 ? (
                      row.networkCounts.map(({ network, count }) => {
                        const networkConfig = getNetworkConfig(network);
                        return (
                          <span
                            key={network}
                            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-neutral-800 text-neutral-200 border border-neutral-700"
                            style={{
                              borderColor: networkConfig.color + "40",
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: networkConfig.color }}
                            />
                            <span className="text-neutral-200">{network}</span>
                            <span className="mx-1 text-neutral-500">•</span>
                            <span
                              className="font-semibold"
                              style={{ color: networkConfig.color }}
                            >
                              {formatNumber(count)}
                            </span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-neutral-500 text-sm">No data</span>
                    )}
                  </div>
                </td>

                {/* Last Updated */}
                <td className="px-4 py-4 text-right text-neutral-400 text-sm whitespace-nowrap">
                  {formatDate(row.lastUpdated)}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-center">
                  <Link
                    href={`/${row.country.code}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-400 transition-colors whitespace-nowrap"
                  >
                    <MapIcon className="w-4 h-4" />
                    View Map
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="lg:hidden space-y-4">
        {sortedRows.map((row) => (
          <div
            key={row.country.code}
            className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-lg"
          >
            {/* Country Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl" aria-label={row.country.name}>
                  {row.country.flag}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-50">
                    {row.country.name}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {formatNumber(row.totalLocations)} locations
                  </p>
                </div>
              </div>
            </div>

            {/* Networks */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-neutral-400 mb-2">Networks:</p>
              <div className="flex flex-wrap gap-2">
                {row.networkCounts.length > 0 ? (
                  row.networkCounts.map(({ network, count }) => {
                    const networkConfig = getNetworkConfig(network);
                    return (
                      <span
                        key={network}
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-neutral-800 text-neutral-200 border border-neutral-700"
                        style={{
                          borderColor: networkConfig.color + "40",
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: networkConfig.color }}
                        />
                        <span className="text-neutral-200">{network}</span>
                        <span className="mx-1 text-neutral-500">•</span>
                        <span
                          className="font-semibold"
                          style={{ color: networkConfig.color }}
                        >
                          {formatNumber(count)}
                        </span>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-neutral-500 text-sm">No data</span>
                )}
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500">Last Updated</span>
              <span className="text-xs text-neutral-400">
                {formatDate(row.lastUpdated)}
              </span>
            </div>

            {/* View Map Button */}
            <Link
              href={`/${row.country.code}`}
              className="inline-flex items-center justify-center w-full gap-2 rounded-lg bg-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-400 transition-colors"
            >
              <MapIcon className="w-5 h-5" />
              View {row.country.name} Map
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
