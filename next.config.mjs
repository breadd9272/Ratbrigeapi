/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    // allow larger media uploads from devices
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
