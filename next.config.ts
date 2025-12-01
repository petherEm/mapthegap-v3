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
  // Custom cache handler to bypass 2MB limit for large datasets (Poland: 18MB+)
  // Reference: https://github.com/vercel/next.js/discussions/48324
  // Note: In dev mode, caching is disabled anyway, so the "2MB limit" error is just a warning
  cacheHandler: require.resolve("./lib/cache-handler.mjs"),
  // Increase in-memory cache size (default is 50MB, increase to 100MB for large datasets)
  cacheMaxMemorySize: 100 * 1024 * 1024, // 100MB
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
