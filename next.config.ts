import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['randomuser.me'],
  },
  /* config options here */
  async redirects() {
    return process.env.NODE_ENV === 'production' ? [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'http://' }],
        destination: `https://${process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '')}/:path*`,
        permanent: true,
      },
    ] : [];
  },
};

export default nextConfig;
