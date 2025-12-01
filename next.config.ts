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
  // Note: Using unstable_cache from next/cache for data caching instead of
  // cacheComponents which requires Suspense everywhere and causes performance issues.
  // Cache is revalidated via revalidateTag() after imports.
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
