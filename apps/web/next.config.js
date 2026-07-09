/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@aitutor/shared"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
