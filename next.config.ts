import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.join(__dirname),
  },
};

// PWA setup — only apply in production builds with webpack
const withPWA = (() => {
  try {
    const pwa = require("@ducanh2912/next-pwa").default;
    return pwa({
      dest: "public",
      disable: process.env.NODE_ENV === "development",
      register: true,
      skipWaiting: true,
      cacheOnFrontEndNav: true,
      aggressiveFrontEndNavCaching: true,
      reloadOnOnline: true,
      fallbacks: {
        document: "/offline",
      },
      workboxOptions: {
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|woff2?)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets",
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
            },
          },
          {
            urlPattern: /\/_next\/data\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "next-data",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 30, maxAgeSeconds: 10 * 60 },
            },
          },
        ],
      },
    });
  } catch {
    // PWA plugin not available — return identity
    return (config: NextConfig) => config;
  }
})();

export default withPWA(nextConfig);
