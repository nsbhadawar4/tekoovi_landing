import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  async redirects() {
    return [
      {
        source: "/work/:slug",
        destination: "/work-detail/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
