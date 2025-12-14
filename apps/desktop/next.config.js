/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export is MANDATORY for Tauri
  // No server-side features at runtime
  output: "export",

  // Disable image optimization (requires Node.js server)
  images: {
    unoptimized: true,
  },

  // Tauri serves from the file system
  // Use relative paths for assets
  assetPrefix: "./",

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
