import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
const serverActionBodyLimit = "24mb";

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://www.figma.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://s3.amazonaws.com",
  "font-src 'self' data: https://fonts.gstatic.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://s3.amazonaws.com",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: serverActionBodyLimit,
    },
    proxyClientMaxBodySize: serverActionBodyLimit,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspDirectives },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
