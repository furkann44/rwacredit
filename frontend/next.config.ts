import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
    };
    return config;
  },
  turbopack: {},
  transpilePackages: ['@rainbow-me/rainbowkit', 'wagmi', 'viem', '@tanstack/react-query'],
};

export default nextConfig;
