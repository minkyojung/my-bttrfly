// 로케일의 단일 출처.
//
// 한국어는 프리픽스가 없다(`/about`), 영어는 붙는다(`/en/about`). 글 31편이 이미
// `/posts/<slug>`로 색인돼 있어서, 양쪽 모두에 프리픽스를 붙이면 그 URL이 전부
// 바뀐다. 기본 로케일을 무프리픽스로 두면 기존 주소가 하나도 안 바뀐다.
//
// 파일 트리에서는 모든 라우트가 app/[locale]/ 아래 있고, middleware가 프리픽스
// 없는 요청을 기본 로케일로 재작성한다. 그래야 <html lang>이 로케일을 따라간다 —
// 루트 레이아웃이 로케일을 모르면 lang을 정적으로 바꿀 방법이 없다.

export const LOCALES = ["ko", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// 로케일을 붙인 경로. 기본 로케일은 프리픽스가 없다.
// `/`는 `//en`이 되지 않도록 따로 다룬다.
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  return locale === DEFAULT_LOCALE ? clean || "/" : `/${locale}${clean}`;
}

// 로케일 대응 화면이 없는 경로. 글 31편과 섹션 목록은 사실상 한국어 콘텐츠라
// 번역 대상이 아니고, /ko/와 /en/ 양쪽에 두면 한쪽은 중복 콘텐츠거나 404가 된다.
// 그래서 기본 로케일에만 존재한다 — 언어 토글은 여기서 홈으로 빠진다.
const UNLOCALIZED_PREFIXES = ["/posts", "/columns"];

export function hasLocaleVariant(path: string): boolean {
  return !UNLOCALIZED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

// 주소창 경로에서 로케일 프리픽스를 걷어낸 '순수 경로'.
export function stripLocale(path: string): string {
  const segments = path.split("/");
  if (!isLocale(segments[1] ?? "")) return path;
  const rest = segments.slice(2).join("/");
  return rest ? `/${rest}` : "/";
}

// <html lang>에 넣는 BCP 47 태그.
export const HTML_LANG: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en",
};

// OpenGraph의 locale 필드.
export const OG_LOCALE: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
};
