/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds (Vercel has version mismatch)
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '45.92.173.121',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.postimg.cc',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/proxy-image/:path*',
        destination: 'http://45.92.173.121/:path*',
      },
    ];
  },
}

module.exports = nextConfig
