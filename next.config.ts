import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TF.js는 클라이언트 전용. 서버 번들에서 제외 경고를 줄이기 위한 설정.
  reactStrictMode: true,
};

export default nextConfig;
