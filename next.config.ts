import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "aswathypsychologist.com",
          },
        ],
        destination: "https://www.aswathypsychologist.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
