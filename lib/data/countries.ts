import type { Country, CountryCode, NetworkName } from "@/types";

export const COUNTRIES: Record<CountryCode, Country> = {
  poland: {
    code: "poland",
    name: "Poland",
    flag: "pl", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: ["Western Union", "MoneyGram", "Ria", "Poczta Polska"],
    center: [19.1451, 51.9194], // [lng, lat] for Warsaw
    zoom: 6,
    bounds: [
      [14.0745, 49.0020], // [west, south]
      [24.0299, 54.8515], // [east, north]
    ],
  },
  lithuania: {
    code: "lithuania",
    name: "Lithuania",
    flag: "lt", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: ["Western Union", "MoneyGram", "Ria"],
    center: [25.2797, 54.6872], // [lng, lat] for Vilnius
    zoom: 7,
    bounds: [
      [20.9417, 53.8967], // [west, south]
      [26.8355, 56.4504], // [east, north]
    ],
  },
  latvia: {
    code: "latvia",
    name: "Latvia",
    flag: "lv", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: ["Western Union", "MoneyGram", "Ria"],
    center: [24.1052, 56.9496], // [lng, lat] for Riga
    zoom: 7,
    bounds: [
      [20.9670, 55.6747], // [west, south]
      [28.2412, 58.0855], // [east, north]
    ],
  },
  estonia: {
    code: "estonia",
    name: "Estonia",
    flag: "ee", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: ["Western Union", "MoneyGram"],
    center: [24.7536, 59.4370], // [lng, lat] for Tallinn
    zoom: 7,
    bounds: [
      [21.7657, 57.5093], // [west, south]
      [28.2100, 59.6753], // [east, north]
    ],
  },
  gb: {
    code: "gb",
    name: "Great Britain",
    flag: "gb", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: [], // Networks dynamically detected from database - supports any service type
    center: [-3.4360, 55.3781], // [lng, lat] for UK geographic center (near Haltwhistle)
    zoom: 5.5,
    bounds: [
      [-8.6500, 49.8700], // [west, south] - includes Northern Ireland
      [1.7630, 60.8600], // [east, north] - includes Shetland Islands
    ],
  },
  france: {
    code: "france",
    name: "France",
    flag: "fr", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: [], // Networks dynamically detected from database
    center: [2.3522, 48.8566], // [lng, lat] for Paris
    zoom: 5.5,
    bounds: [
      [-5.1406, 41.3333], // [west, south]
      [9.5593, 51.0891], // [east, north]
    ],
  },
  honduras: {
    code: "honduras",
    name: "Honduras",
    flag: "hn", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: [], // Networks dynamically detected from database
    center: [-87.2068, 14.0723], // [lng, lat] for Tegucigalpa
    zoom: 7,
    bounds: [
      [-89.3508, 12.9808], // [west, south]
      [-83.1551, 16.5100], // [east, north]
    ],
  },
  usa: {
    code: "usa",
    name: "United States",
    flag: "us", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: [], // Networks dynamically detected from database
    center: [-95.7129, 37.0902], // [lng, lat] for geographic center of contiguous US
    zoom: 4,
    bounds: [
      [-125.0, 24.5], // [west, south] - contiguous US only
      [-66.9, 49.4], // [east, north]
    ],
  },
  czechia: {
    code: "czechia",
    name: "Czechia",
    flag: "cz", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: [], // Networks dynamically detected from database
    center: [15.473, 49.817], // [lng, lat] for geographic center
    zoom: 7,
    bounds: [
      [12.09, 48.55], // [west, south]
      [18.86, 51.06], // [east, north]
    ],
  },
  mexico: {
    code: "mexico",
    name: "Mexico",
    flag: "mx", // ISO 3166-1 alpha-2 code for CircleFlag
    networks: [], // Networks dynamically detected from database
    center: [-102.55, 23.63], // [lng, lat] for geographic center
    zoom: 5,
    bounds: [
      [-118.4, 14.53], // [west, south]
      [-86.7, 32.72], // [east, north]
    ],
  },
};

export const COUNTRY_LIST: Country[] = Object.values(COUNTRIES);

// Helper function to get networks for a specific country
export function getCountryNetworks(countryCode: CountryCode): NetworkName[] {
  return COUNTRIES[countryCode].networks;
}

// Helper function to check if a network is available in a country
export function isNetworkAvailable(
  countryCode: CountryCode,
  networkName: NetworkName
): boolean {
  return COUNTRIES[countryCode].networks.includes(networkName);
}
