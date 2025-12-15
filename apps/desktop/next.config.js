/** @type {import('next').NextConfig} */
const path = require("path");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // Static export is MANDATORY for Tauri production builds
  // Note: Next.js ignores this in dev mode (next dev), so HMR still works
  output: "export",

  // Disable image optimization (requires Node.js server)
  images: {
    unoptimized: true,
  },

  // Tauri serves from the file system in production
  // In dev mode, Next.js dev server handles assets automatically
  assetPrefix: process.env.NODE_ENV === "production" ? "./" : undefined,

  // Ensure compatibility with strict TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Workspaces export TypeScript source; Next needs to transpile these packages.
  transpilePackages: ["@tauri-starter/db", "@tauri-starter/store"],

  experimental: {
    // Helps reduce bundle size by improving tree-shaking for some packages.
    // Add entries as needed (keep this list small and intentional).
    optimizePackageImports: ["@heroicons/react", "@headlessui/react"],
  },

  // Silence Turbopack's “inferred workspace root” warning in monorepos.
  // This should point at the monorepo root (where your lockfile/workspaces live).
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

module.exports = withBundleAnalyzer(nextConfig);
