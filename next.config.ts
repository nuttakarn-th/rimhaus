import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Required for @react-pdf/renderer (uses WASM-based Yoga layout engine)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    return config
  },
};

export default nextConfig;
