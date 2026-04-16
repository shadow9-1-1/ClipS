import type { NextConfig } from "next";

/** Express API (avoid `localhost` here — Windows may resolve IPv6 and miss the backend). */
const apiTarget =
  process.env.INTERNAL_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/clips-api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
