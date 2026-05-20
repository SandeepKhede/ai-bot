import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@wabot/db', '@wabot/whatsapp'],
};

export default nextConfig;
