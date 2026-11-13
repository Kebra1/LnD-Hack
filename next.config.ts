import type { NextConfig } from "next";
import { parseEnvironment } from "./src/lib/env/schema";

parseEnvironment(process.env);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
