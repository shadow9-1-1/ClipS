import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** This file lives in `frontend/clips` — pin Turbopack root so a stray lockfile elsewhere is not chosen. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** Express API (avoid `localhost` here — Windows may resolve IPv6 and miss the backend). */
const apiTarget =
  process.env.INTERNAL_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
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
