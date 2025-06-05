import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi.lust66.com',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['strapi.lust66.com','localhost'],
  },
  // Optimize for dynamic content from Strapi
  experimental: {
    staleTimes: {
      dynamic: 30, // 30 seconds for dynamic pages
      static: 180, // 3 minutes for static content
    },
  },
  // Ensure proper handling of dynamic imports and API routes
  poweredByHeader: false,
  // Configure headers for better caching control
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
