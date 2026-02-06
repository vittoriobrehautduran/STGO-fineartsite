/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    // Disable image optimization to fix Netlify IPX 500 errors
    unoptimized: true,
  },
};

module.exports = nextConfig;

