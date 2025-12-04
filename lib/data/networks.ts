import type { NetworkConfig, NetworkName, KnownNetworkName } from "@/types";

// Theme-aware color palettes for known networks
// Using MAXIMALLY distinct colors: Yellow, Blue, Green, Violet
const NETWORK_COLORS = {
  light: {
    "Western Union": "#eab308",    // Yellow - bright and visible
    "MoneyGram": "#2563eb",        // Deep Blue - cool, distinct
    "Ria": "#16a34a",              // Deep Green - natural, distinct
    "Poczta Polska": "#7c3aed",    // Deep Violet - rich, distinct
  },
  dark: {
    "Western Union": "#facc15",    // Bright yellow
    "MoneyGram": "#3b82f6",        // Bright blue
    "Ria": "#22c55e",              // Bright green
    "Poczta Polska": "#8b5cf6",    // Bright violet
  }
} as const;

// Known networks with full branding (colors will be set dynamically)
export const KNOWN_NETWORKS: Record<KnownNetworkName, Omit<NetworkConfig, 'color' | 'markerColor'>> = {
  "Western Union": {
    name: "Western Union",
    logo: "/logos/western-union.svg",
    enabled: true,
  },
  MoneyGram: {
    name: "MoneyGram",
    logo: "/logos/moneygram.svg",
    enabled: true,
  },
  Ria: {
    name: "Ria",
    logo: "/logos/ria.svg",
    enabled: true,
  },
  "Poczta Polska": {
    name: "Poczta Polska",
    logo: "/logos/poczta-polska.svg",
    enabled: true,
  },
};

// Color palettes for auto-generated network colors (theme-aware)
const AUTO_COLORS = {
  light: [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#14b8a6", // teal
    "#a855f7", // violet
  ],
  dark: [
    "#f87171", // bright red
    "#fb923c", // bright orange
    "#facc15", // bright yellow
    "#4ade80", // bright green
    "#60a5fa", // bright blue
    "#a78bfa", // bright purple
    "#f472b6", // bright pink
    "#22d3ee", // bright cyan
    "#2dd4bf", // bright teal
    "#c084fc", // bright violet
  ]
} as const;

// Generate a consistent color for unknown networks based on name hash
function generateColorForNetwork(networkName: string, theme: 'light' | 'dark' = 'dark'): string {
  let hash = 0;
  for (let i = 0; i < networkName.length; i++) {
    hash = networkName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = AUTO_COLORS[theme];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Get network configuration with theme-aware colors
export function getNetworkConfig(networkName: NetworkName, theme: 'light' | 'dark' = 'dark'): NetworkConfig {
  // Check if it's a known network
  if (networkName in KNOWN_NETWORKS) {
    const baseConfig = KNOWN_NETWORKS[networkName as KnownNetworkName];
    const color = NETWORK_COLORS[theme][networkName as KnownNetworkName];
    return {
      ...baseConfig,
      color,
      markerColor: color,
    };
  }

  // Generate config for unknown network
  const color = generateColorForNetwork(networkName, theme);
  return {
    name: networkName,
    color,
    logo: "/logos/default-network.svg",
    markerColor: color,
    enabled: true,
  };
}

// Legacy export for backwards compatibility (use getNetworkConfig instead)
// Note: This uses dark theme by default. For theme-aware colors, use getNetworkConfig directly.
export const NETWORKS = new Proxy({} as Record<NetworkName, NetworkConfig>, {
  get(target, prop: string) {
    return getNetworkConfig(prop, 'dark');
  },
});

// Helper to get all network configs with theme
export function getAllNetworkConfigs(theme: 'light' | 'dark' = 'dark'): NetworkConfig[] {
  return Object.keys(KNOWN_NETWORKS).map(name =>
    getNetworkConfig(name as KnownNetworkName, theme)
  );
}

export const NETWORK_LIST: NetworkConfig[] = getAllNetworkConfigs('dark');
