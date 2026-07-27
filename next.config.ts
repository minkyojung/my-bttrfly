import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev는 Turbopack, build는 webpack이라 청크 이름 규칙과 매니페스트 형식이
  // 서로 다르다. 둘이 같은 .next를 쓰면 개발 서버의 모듈 지도가 빌드 산출물로
  // 덮여 런타임에 "X is not defined" 같은 엉뚱한 에러가 난다.
  // 검증 빌드는 NEXT_DIST_DIR로 디렉터리를 분리해서 돌린다(npm run build:check).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
