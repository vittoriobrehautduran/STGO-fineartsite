/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    // Disable image optimization to fix Netlify IPX 500 errors
    unoptimized: true,
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

