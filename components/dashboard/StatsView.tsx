"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ChartBarIcon, MapIcon, ScaleIcon } from "@heroicons/react/24/outline";
import { CountryFlag } from "@/components/ui/country-flag";
import type { Country } from "@/types";
import type {
  CountryStatsOverview,
  DensityData,
  NetworkComparisonData,
} from "@/lib/supabase/queries";
import { CountryStats } from "./CountryStats";
import { DensityAnalysisChart } from "./DensityAnalysisChart";
import { NetworkComparisonDashboard } from "./NetworkComparisonDashboard";

interface StatsViewProps {
  country: Country;
  overviewData: CountryStatsOverview | null;
  densityData: DensityData[];
  comparisonData: NetworkComparisonData[];
}

type TabType = "overview" | "density" | "networks";

export function StatsView({
  country,
  overviewData,
  densityData,
  comparisonData,
}: StatsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as const, name: "Overview", icon: ChartBarIcon },
    { id: "density" as const, name: "Density Analysis", icon: MapIcon },
    { id: "networks" as const, name: "Network Comparison", icon: ScaleIcon },
  ];

  return (
    <div className="h-full overflow-auto bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${country.code}`}
            className="inline-flex items-center gap-2 text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Map
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <CountryFlag countryCode={country.code} size={40} />
            <h1 className="text-4xl font-bold">{country.name} Statistics</h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Detailed analytics and insights for {country.name}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 mb-8">
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "text-violet-500 border-violet-500"
                      : "text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "overview" && <CountryStats data={overviewData} />}
          {activeTab === "density" && <DensityAnalysisChart data={densityData} />}
          {activeTab === "networks" && <NetworkComparisonDashboard data={comparisonData} />}
        </div>
      </div>
    </div>
  );
}
