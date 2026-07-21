import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep mongoose out of the bundle so its native driver works on serverless
  // (Vercel) — it's loaded at runtime by the server, never sent to the client.
  serverExternalPackages: ["mongoose"],

  // Case studies used to live under /work/<slug> — keep those links alive.
  async redirects() {
    return [
      {
        source: "/work/:slug",
        destination: "/case-study-detail/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
