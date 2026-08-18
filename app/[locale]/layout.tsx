import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "../globals.css";
import { NavBar } from "@/components/NavBar";
import { JsonLd } from "@/components/JsonLd";
import { personSchema, siteConfig, alternatesFor } from "@/lib/site-config";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  OG_LOCALE,
  isLocale,
} from "@/lib/i18n";

const serif = Noto_Serif_KR({
  // 400: 본문(serif) · 700: 제목. 그 외 웨이트는 미사용이라 로드하지 않음(용량).
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

// 이 파일이 루트 레이아웃이다(app/layout.tsx는 없다). 모든 라우트를 [locale] 아래
// 둔 이유가 여기 있다 — <html lang>은 루트 레이아웃에서만 정할 수 있고, 루트가
// 로케일을 모르면 /en 페이지가 한국어로 선언된다.
//
// generateStaticParams는 일부러 여기 두지 않는다. 여기서 로케일을 생성하면 하위
// 페이지의 파라미터와 곱해져서, 한국어에만 존재해야 할 /posts/*·/columns/* 가
// /en 아래에도 생성된다. 각 페이지가 자기 조합을 직접 선언한다.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    alternates: alternatesFor(locale, "/"),
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      url: `${siteConfig.url}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}`,
      siteName: siteConfig.name,
      title: `${siteConfig.name} — ${siteConfig.role}`,
      description: siteConfig.description,
    },
    // title/description은 명시하지 않는다 — 명시하면 하위 페이지(글)의
    // 트위터 카드 제목까지 사이트 제목으로 고정돼버린다 (메타데이터는 키 단위 상속).
    twitter: {
      card: "summary_large_image",
      creator: siteConfig.social.twitter.handle,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: raw } = await params;
  // middleware가 알 수 없는 프리픽스를 기본 로케일로 재작성하므로 여기 도달하는
  // 값은 항상 ko | en 이다. 그래도 타입을 좁혀야 하니 폴백을 둔다 — 루트 레이아웃에서
  // notFound()를 부르면 not-found 화면도 이 레이아웃을 필요로 해 재귀가 된다.
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return (
    <html lang={HTML_LANG[locale]} className={serif.variable}>
      <body className="antialiased">
        <JsonLd data={personSchema()} />
        <NavBar locale={locale} />
        {children}
      </body>
    </html>
  );
}
