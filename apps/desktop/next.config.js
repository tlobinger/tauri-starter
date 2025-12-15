/** @type {import('next').NextConfig} */
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

  // Disable telemetry
  eslint: {
    ignoreDuringBuilds: true, // Using Biome instead
  },
};

module.exports = nextConfig;
