import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
        ignoreBuildErrors: true
    },
    experimental: {
        proxyClientMaxBodySize: "20mb",
    },
};

export default nextConfig;