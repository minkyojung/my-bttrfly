import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

// 라우트 파일은 전부 app/[locale]/ 아래 있지만, URL에서는 기본 로케일(한국어)에
// 프리픽스가 없다. 그 간극을 여기서 메운다.
//
//   /en/about  →  그대로 통과 (app/[locale]/about, locale="en")
//   /about     →  내부적으로 /ko/about 으로 재작성 (주소창은 /about 그대로)
//
// 파일 트리를 전부 [locale] 아래 둔 이유는 <html lang>이다. 루트 레이아웃이
// 로케일을 모르면 lang을 정적으로 바꿀 수 없고, 그러면 /en 페이지가 한국어로
// 선언된다. app/[locale]/layout.tsx 를 루트 레이아웃으로 만들면 해결된다.
//
// /ko/* 로 직접 들어와도 동작한다(재작성 결과와 같은 라우트). 주소가 두 개가 되는
// 셈이라 app/robots.ts 가 /ko/ 를 크롤링에서 제외하고, 각 페이지의 canonical은
// 프리픽스 없는 주소를 가리킨다. 리다이렉트로 막지 않는 이유는 Next가 생성하는
// OG 이미지 URL이 로케일 세그먼트를 포함하기 때문이다 — 리다이렉트를 걸면 그게 깨진다.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if ((LOCALES as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // 정적 자산과 로케일이 없는 라우트(robots/sitemap/llms.txt)는 건드리지 않는다.
  matcher: [
    "/((?!_next/|images/|fonts/|badges/|robots\\.txt|sitemap\\.xml|llms\\.txt|favicon\\.ico).*)",
  ],
};
