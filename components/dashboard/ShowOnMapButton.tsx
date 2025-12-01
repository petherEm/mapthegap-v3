"use client";

import { useRouter } from "next/navigation";
import { MapIcon } from "@heroicons/react/24/outline";
import type { NetworkName, CountryCode } from "@/types";

interface ShowOnMapButtonProps {
  selectedNetworks: Set<NetworkName>;
  countryCode: CountryCode;
  maxNetworks: number;
}

export function ShowOnMapButton({
  selectedNetworks,
  countryCode,
  maxNetworks,
}: ShowOnMapButtonProps) {
  const router = useRouter();
  const count = selectedNetworks.size;
  const isDisabled = count === 0 || count > maxNetworks;

  const handleClick = () => {
    if (isDisabled) return;

    const networksParam = Array.from(selectedNetworks).join(",");
    router.push(`/${countryCode}?networks=${encodeURIComponent(networksParam)}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        w-full mt-4 px-6 py-3 rounded-lg font-semibold text-sm
        flex items-center justify-center gap-2 transition-all
        ${
          isDisabled
            ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
            : "bg-violet-500 text-white hover:bg-violet-600 cursor-pointer"
        }
      `}
    >
      <MapIcon className="w-5 h-5" />
      {count === 0
        ? "Select networks to view on map"
        : count === 1
          ? "Show 1 network on map"
          : `Show ${count} networks on map`}
    </button>
  );
}
