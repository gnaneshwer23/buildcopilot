import type { NextConfig } from "next";
import path from "node:path";

const rootDir = path.dirname(
  decodeURIComponent(new URL(import.meta.url).pathname),
);

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(rootDir),
  },
};

export default nextConfig;
