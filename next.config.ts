import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.redd.it" },
      { protocol: "https", hostname: "**.reddit.com" },
      { protocol: "https", hostname: "**.twimg.com" },
      { protocol: "https", hostname: "**.megaphone.fm" },
    ],
  },
};

export default nextConfig;
