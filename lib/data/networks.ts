import type { NetworkConfig, NetworkName, KnownNetworkName } from "@/types";

// Known networks with full branding
export const KNOWN_NETWORKS: Record<KnownNetworkName, NetworkConfig> = {
  "Western Union": {
    name: "Western Union",
    color: "#FFC107", // Yellow
    logo: "/logos/western-union.svg",
    markerColor: "#FFC107",
    enabled: true,
  },
  MoneyGram: {
    name: "MoneyGram",
    color: "#F5F5F5", // White
    logo: "/logos/moneygram.svg",
    markerColor: "#F5F5F5",
    enabled: true,
  },
  Ria: {
    name: "Ria",
    color: "#FF8C00", // Dark orange
    logo: "/logos/ria.svg",
    markerColor: "#FF8C00",
    enabled: true,
  },
  "Poczta Polska": {
    name: "Poczta Polska",
    color: "#E53935", // Reddish
    logo: "/logos/poczta-polska.svg",
    markerColor: "#E53935",
    enabled: true,
  },
};

// Color palette for auto-generated network colors
const AUTO_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#A855F7", // Violet
];

// Generate a consistent color for unknown networks based on name hash
function generateColorForNetwork(networkName: string): string {
  let hash = 0;
  for (let i = 0; i < networkName.length; i++) {
    hash = networkName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AUTO_COLORS.length;
  return AUTO_COLORS[index];
}

// Get network configuration (returns default config for unknown networks)
export function getNetworkConfig(networkName: NetworkName): NetworkConfig {
  // Check if it's a known network
  if (networkName in KNOWN_NETWORKS) {
    return KNOWN_NETWORKS[networkName as KnownNetworkName];
  }

  // Generate config for unknown network
  const color = generateColorForNetwork(networkName);
  return {
    name: networkName,
    color,
    logo: "/logos/default-network.svg", // You can create a generic logo
    markerColor: color,
    enabled: true,
  };
}

// Legacy export for backwards compatibility (use getNetworkConfig instead)
export const NETWORKS = new Proxy({} as Record<NetworkName, NetworkConfig>, {
  get(target, prop: string) {
    return getNetworkConfig(prop);
  },
});

export const NETWORK_LIST: NetworkConfig[] = Object.values(KNOWN_NETWORKS);
