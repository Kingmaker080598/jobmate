const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ⛑️ Disables blocking build on lint errors
  },
};

module.exports = nextConfig;