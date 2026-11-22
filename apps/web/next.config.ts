import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@meridian/api-client", "@meridian/contracts", "@meridian/design-tokens"],
};

export default nextConfig;
