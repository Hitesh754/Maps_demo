import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:* blob:;
  img-src 'self' data: blob:;
  font-src 'self' data:;
  worker-src 'self' blob:;
  child-src blob:;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  transpilePackages: [
    "@meridian/api-client",
    "@meridian/contracts",
    "@meridian/design-tokens",
    "@meridian/map-style",
    "@meridian/ui"
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
