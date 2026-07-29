import type { NextConfig } from "next";

/**
 * GitHub Pages 배포용 설정.
 *
 * - output: "export"  → 서버 없이 out/ 에 정적 HTML 을 뽑는다
 * - trailingSlash     → /results/1234/index.html 로 나와야 Pages 가 404 없이 서빙한다
 * - basePath          → 프로젝트 저장소(username.github.io/<repo>)로 배포할 때만 채운다
 *                       (커스텀 도메인이나 username.github.io 저장소면 비워둘 것)
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: {
    // Pages 에는 이미지 최적화 서버가 없다
    unoptimized: true,
  },
};

export default nextConfig;
