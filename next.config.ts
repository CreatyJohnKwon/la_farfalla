import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true, // React Strict Mode 활성화
    images: {
        // 이미지 포맷 사용 : 이미지 랜더링 속도 향상 목적
        formats: ["image/webp", "image/avif"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        qualities: [75, 85, 95],
        // 타임아웃 시간 증가
        minimumCacheTTL: 60,
        // 이미지 최적화 비활성화 (임시 해결책)
        unoptimized: true,
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
    env: {
        TZ: "Asia/Seoul",
    },
};

export default nextConfig;
