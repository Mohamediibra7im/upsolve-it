/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // ponytail: silences "inferred workspace root" warning from orphaned parent lockfile
  turbopack: {
    root: __dirname,
  },
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
