"use client";

import type { Location } from "@/types";
import { NETWORKS } from "@/lib/data/networks";
import {
  MapPinIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type LocationPopupProps = {
  location: Location;
  onClose?: () => void;
};

export function LocationPopup({ location, onClose }: LocationPopupProps) {
  const network = NETWORKS[location.network_name];

  return (
    <div className="min-w-[280px] max-w-[320px] p-4 bg-neutral-900 rounded-lg border border-neutral-800 shadow-xl relative">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-neutral-800 transition-colors group"
          aria-label="Close popup"
        >
          <XMarkIcon className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300" />
        </button>
      )}

      {/* Network Badge */}
      <div className="mb-3 pr-6">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: network.color }}
          />
          <span className="text-sm font-semibold text-neutral-50">
            {location.network_name}
          </span>
        </div>
        {/* Subnetwork */}
        {location.subnetwork_name && (
          <p className="text-xs text-neutral-400 mt-1 ml-5">
            via {location.subnetwork_name}
          </p>
        )}
      </div>

      {/* Location Details */}
      <div className="space-y-2">
        {/* Street Address */}
        <div className="flex items-start gap-2">
          <MapPinIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <div className="text-sm text-neutral-300">
            <p className="font-medium">{location.street}</p>
            <p className="text-neutral-400">
              {location.zip} {location.city}
            </p>
            {location.county && (
              <p className="text-neutral-500 text-xs">{location.county}</p>
            )}
          </div>
        </div>

        {/* City */}
        <div className="flex items-center gap-2">
          <BuildingOffice2Icon className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="text-sm text-neutral-300">{location.city}</span>
        </div>

        {/* Phone */}
        {location.phone && (
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-neutral-400 shrink-0" />
            <a
              href={`tel:${location.phone}`}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              {location.phone}
            </a>
          </div>
        )}

        {/* Description */}
        {location.description && (
          <div className="flex items-start gap-2 pt-2 border-t border-neutral-800">
            <InformationCircleIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <p className="text-xs text-neutral-400">{location.description}</p>
          </div>
        )}
      </div>

      {/* Coordinates (for debugging/reference) */}
      <div className="mt-3 pt-3 border-t border-neutral-800">
        <p className="text-xs text-neutral-500">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
