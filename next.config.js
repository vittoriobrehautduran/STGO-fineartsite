/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    // Disable image optimization to fix Netlify IPX 500 errors
    unoptimized: true,
  },
  async headers() {
    return [
      // Keep these logos usable on the site, but block image indexing.
      {
        source: "/images/brandlogos/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, noimageindex" }],
      },
      {
        source: "/images/logowhite.webp",
        headers: [{ key: "X-Robots-Tag", value: "noindex, noimageindex" }],
      },
      {
        source: "/images/logoblack.webp",
        headers: [{ key: "X-Robots-Tag", value: "noindex, noimageindex" }],
      },
      {
        source: "/images/bclogorefined.webp",
        headers: [{ key: "X-Robots-Tag", value: "noindex, noimageindex" }],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Exclude supabase directory from webpack processing
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/supabase/**'],
    };
    return config;
  },
};

module.exports = nextConfig;

