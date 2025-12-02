"use client";

import { CircleFlag } from "react-circle-flags";
import type { CountryCode } from "@/types";

// Map our internal country codes to ISO 3166-1 alpha-2 codes
const COUNTRY_CODE_TO_ISO: Record<CountryCode, string> = {
  poland: "pl",
  lithuania: "lt",
  latvia: "lv",
  estonia: "ee",
  gb: "gb",
  france: "fr",
  honduras: "hn",
  usa: "us",
};

interface CountryFlagProps {
  /** Country code (internal format: 'poland', 'gb', etc.) */
  countryCode: CountryCode;
  /** Size in pixels (default: 20) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders a circular country flag using SVG.
 * Works consistently across all browsers including Windows.
 */
export function CountryFlag({
  countryCode,
  size = 20,
  className,
}: CountryFlagProps) {
  const isoCode = COUNTRY_CODE_TO_ISO[countryCode];

  if (!isoCode) {
    // Fallback for unknown country codes
    return (
      <span
        className={className}
        style={{ width: size, height: size }}
        aria-label={`Flag for ${countryCode}`}
      >
        🏳️
      </span>
    );
  }

  return (
    <CircleFlag
      countryCode={isoCode}
      height={size}
      width={size}
      className={className}
    />
  );
}
