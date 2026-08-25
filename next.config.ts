import type { NextConfig } from "next";

// /images/uploads의 파일을 주소로 직접 열었을 때를 위한 방어. 본문에 <img>로 박힌
// 이미지는 영향받지 않는다 — Content-Disposition은 최상위 내비게이션만 지배한다.
// sandbox가 핵심이다. 응답을 불투명(opaque) 출처로 만들어서, 혹시 스크립트가 돌더라도
// document.cookie를 못 읽고 같은 출처로 요청을 보내지 못한다. GitHub이 사용자 업로드
// 파일에 쓰는 것과 같은 조합이고, next/image가 dangerouslyAllowSVG를 켰을 때 스스로
// 세우는 기본값이기도 하다.
// nosniff는 SVG에는 무력하지만(선언된 타입이 실제로 맞으므로) 확장자만 png인
// HTML 파일이 HTML로 해석되는 걸 막는다.
// 업로드 엔드포인트는 사라졌지만 그때 들어온 파일 129장은 그대로 서빙되므로 유지한다.
const UPLOAD_SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Content-Disposition", value: "attachment" },
];

const nextConfig: NextConfig = {
  // 글 목록 카드 썸네일. 본문이 로컬에 없는 외부 링크 글은 substack의 og:image를
  // 그대로 쓴다(scripts/backfill-covers.mjs가 frontmatter의 cover에 채워둔다) —
  // next/image는 허용된 원격 호스트가 아니면 최적화를 거부한다.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "substackcdn.com" }],
  },

  // app/layout.tsx가 없어서(루트 레이아웃이 app/[locale]/layout.tsx다) 루트
  // not-found를 둘 수 없다. global-not-found는 자기 문서를 직접 그려서 그 제약을
  // 받지 않는다 — 이게 없으면 걸리지 않는 주소가 Next 기본 404로 나간다.
  experimental: { globalNotFound: true },

  // 개발 서버가 도는 중에 빌드를 돌리면 같은 .next를 두 프로세스가 덮어써서
  // 개발 서버의 모듈 지도가 깨지고 런타임에 "X is not defined" 같은 엉뚱한
  // 에러가 난다.
  // 검증 빌드는 NEXT_DIST_DIR로 디렉터리를 분리해서 돌린다(npm run build:check).
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // headers는 파일시스템보다 먼저 검사되므로 public/ 아래 정적 파일에도 적용된다.
  async headers() {
    return [
      { source: "/images/uploads/:path*", headers: UPLOAD_SECURITY_HEADERS },
    ];
  },
};

export default nextConfig;
