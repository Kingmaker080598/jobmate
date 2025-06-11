import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true, // ⛑️ Disables blocking build on lint errors
  },
};

export default nextConfig;
