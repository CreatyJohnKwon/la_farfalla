import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // React Strict Mode 활성화
  images: {
    domains: ["phinf.pstatic.net", "k.kakaocdn.net", "pub-29feff62c6da44ea8503e0dc13db4217.r2.dev"], // 외부 이미지 도메인 추가
  },
  async headers() {
    return [
      {
        source: '/api/:path*', // 경로 설정
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Custom-Header' },
        ],
      },
    ];
  },
};

export default nextConfig;