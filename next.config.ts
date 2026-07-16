import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep mongoose out of the bundle so its native driver works on serverless
  // (Vercel) — it's loaded at runtime by the server, never sent to the client.
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
