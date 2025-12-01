import type { IndustryCategory } from "@/types";

// Industry configuration with icons and labels
export const INDUSTRY_CONFIG: Record<
  IndustryCategory,
  { icon: string; label: string; description: string }
> = {
  money_transfer: {
    icon: "💰",
    label: "Money Transfer",
    description: "Money transfer and remittance services",
  },
  retail: {
    icon: "🏪",
    label: "Retail Stores",
    description: "Department stores and retail chains",
  },
  atm: {
    icon: "🏧",
    label: "ATMs",
    description: "ATM machines and cash points",
  },
  banking: {
    icon: "🏦",
    label: "Banks",
    description: "Banking institutions and branches",
  },
  grocery: {
    icon: "🛒",
    label: "Grocery Stores",
    description: "Supermarkets and grocery chains",
  },
  postal: {
    icon: "📮",
    label: "Postal Services",
    description: "Post offices and postal services",
  },
  pharmacy: {
    icon: "💊",
    label: "Pharmacies",
    description: "Pharmacies and drugstores",
  },
  gas_station: {
    icon: "⛽",
    label: "Gas Stations",
    description: "Fuel stations and service stations",
  },
  convenience_store: {
    icon: "🏪",
    label: "Convenience Stores",
    description: "24-hour convenience stores",
  },
  pawn_shop: {
    icon: "💎",
    label: "Pawn Shops",
    description: "Pawn shops and loan services",
  },
  other: {
    icon: "📍",
    label: "Other",
    description: "Other location types",
  },
};

// Helper function to get industry icon
export function getIndustryIcon(category: IndustryCategory): string {
  return INDUSTRY_CONFIG[category]?.icon || "📍";
}

// Helper function to get industry label
export function getIndustryLabel(category: IndustryCategory): string {
  return INDUSTRY_CONFIG[category]?.label || category;
}

// Helper function to get industry description
export function getIndustryDescription(category: IndustryCategory): string {
  return INDUSTRY_CONFIG[category]?.description || "";
}

// Get all industry categories as array
export const INDUSTRY_CATEGORIES = Object.keys(
  INDUSTRY_CONFIG
) as IndustryCategory[];
