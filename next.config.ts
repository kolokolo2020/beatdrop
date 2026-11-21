import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages here read cookies and live storage on every request, so they are
  // plainly dynamic.
  cacheComponents: false,
};

export default nextConfig;
