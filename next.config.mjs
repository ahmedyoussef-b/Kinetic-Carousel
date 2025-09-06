/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    srcDir: true,
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM *',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
