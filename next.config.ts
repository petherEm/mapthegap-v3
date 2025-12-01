import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tailwindcss.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      }
    ],
  },
  // Enable Cache Components for 'use cache' directive
  cacheComponents: true,
  // Custom cache profiles for location data
  cacheLife: {
    // Location data changes only during imports - cache for 6 hours
    locations: {
      stale: 60 * 60, // 1 hour - client can use cached data
      revalidate: 60 * 60 * 6, // 6 hours - server regenerates
      expire: 60 * 60 * 24, // 24 hours - max cache lifetime
    },
    // Statistics derived from location data - same profile
    stats: {
      stale: 60 * 60,
      revalidate: 60 * 60 * 6,
      expire: 60 * 60 * 24,
    },
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
