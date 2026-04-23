import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.join(__dirname),
  },
};

// PWA only in production with webpack — skip in dev to avoid Turbopack conflict
const isDev = process.env.NODE_ENV === "development";

if (!isDev) {
  try {
    const withPWA = require("@ducanh2912/next-pwa").default;
    module.exports = withPWA({
      dest: "public",
      disable: false,
      register: true,
      skipWaiting: true,
      cacheOnFrontEndNav: true,
      aggressiveFrontEndNavCaching: true,
      reloadOnOnline: true,
      fallbacks: { document: "/offline" },
      workboxOptions: {
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|woff2?)$/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "static-assets", expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: { cacheName: "images", expiration: { maxEntries: 100, maxAgeSeconds: 60 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "api-cache", networkTimeoutSeconds: 5, expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 } },
          },
        ],
      },
    })(nextConfig);
  } catch {
    module.exports = nextConfig;
  }
} else {
  module.exports = nextConfig;
}
