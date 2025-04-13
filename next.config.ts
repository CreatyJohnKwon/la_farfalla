import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true, // React Strict Mode 활성화
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "phinf.pstatic.net",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "k.kakaocdn.net",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "k.kakaocdn.net",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "pub-29feff62c6da44ea8503e0dc13db4217.r2.dev",
                port: "",
                pathname: "/**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/api/:path*", // 경로 설정
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET, POST, OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-Custom-Header",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
