import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Handle Web3 dependencies that don't work in SSR
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'indexeddb'];
    }
    return config;
  },
};

export default nextConfig;
