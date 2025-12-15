import { NextConfig } from "next";
import path from "path";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",

  // Strongly recommended for file-based hosting:
  // Ensures routes like /settings resolve to /settings/index.html in static hosting
  trailingSlash: true,

  // Disable image optimization (requires Node.js server)
  images: {
    unoptimized: true,
  },

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

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
