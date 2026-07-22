import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const serif = Noto_Serif_KR({
  // 400/500: 본문(serif) 렌더용 · 600/700: 제목용
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.alternateName,
    template: `%s — ${siteConfig.alternateName}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
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
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={serif.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
