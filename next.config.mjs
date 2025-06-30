/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["geist"],
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default nextConfig;
