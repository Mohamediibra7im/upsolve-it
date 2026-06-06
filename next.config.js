/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Turbopack is the default in Next.js 16; empty config silences the webpack-without-turbopack warning
  turbopack: {},
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "userpic.codeforces.org",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
      // Ignore optional drizzle-orm dependency pulled in by rate-limiter-flexible
      config.resolve.alias = {
        ...config.resolve.alias,
        'drizzle-orm': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
