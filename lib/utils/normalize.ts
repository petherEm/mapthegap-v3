/**
 * Utility functions for normalizing data for consistent filtering and aggregation
 */

/**
 * Normalizes a city name to Title Case for case-insensitive comparisons
 * Examples:
 * - "LONDON" → "London"
 * - "london" → "London"
 * - "new YORK" → "New York"
 * - "birmingham" → "Birmingham"
 */
export function normalizeCityName(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Normalizes a network name (trims whitespace)
 */
export function normalizeNetworkName(network: string): string {
  return network.trim();
}

/**
 * Normalizes a county name to Title Case
 */
export function normalizeCountyName(county: string): string {
  return county
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
