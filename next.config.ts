import type { NextConfig } from "next";

// dev에 --turbopack을 붙이지 말 것. Next 15.4.10의 Turbopack은 markdown-it의
// lib/rules_block/list.mjs에서 import한 isSpace 호출 두 곳 중 하나를 네임스페이스로
// 바꾸지 않고 그대로 둔다. 그 결과 목록이 있는 글을 에디터에서 열면
// "ReferenceError: isSpace is not defined"가 난다(빈 글은 목록 파싱을 안 해서 멀쩡).
// 같은 모듈을 webpack은 정상 변환한다 — 두 번들러의 출력을 직접 비교해 확인했다.
const nextConfig: NextConfig = {
  // 개발 서버가 도는 중에 빌드를 돌리면 같은 .next를 두 프로세스가 덮어써서
  // 개발 서버의 모듈 지도가 깨지고 런타임에 "X is not defined" 같은 엉뚱한
  // 에러가 난다.
  // 검증 빌드는 NEXT_DIST_DIR로 디렉터리를 분리해서 돌린다(npm run build:check).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
