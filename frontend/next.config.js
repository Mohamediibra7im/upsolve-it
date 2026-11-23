/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // ponytail: silences "inferred workspace root" warning from orphaned parent lockfile
  turbopack: {
    root: __dirname,
  },
  // In production the API is private: this server forwards /api/* to it, so
  // the browser only talks to one origin. Unset locally, where the browser
  // calls the API directly via NEXT_PUBLIC_API_BASE_URL. Routes defined in
  // app/api take precedence over this rewrite.
  async rewrites() {
    const api = process.env.API_INTERNAL_URL;
    return api
      ? [{ source: '/api/:path*', destination: `${api}/api/:path*` }]
      : [];
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
