/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    srcDir: true,
  },
  output: 'standalone',
};

export default nextConfig;
