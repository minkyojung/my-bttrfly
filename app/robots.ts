import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// AI bots — explicit allow for clarity and signal of intent.
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "CCBot",
  "Bytespider",
];

// 한국어는 프리픽스 없는 주소가 정식이지만(`/about`), 파일 트리가 [locale] 아래
// 있어서 `/ko/about`으로도 같은 화면이 열린다. 색인은 프리픽스 없는 쪽만 받는다 —
// 각 페이지의 canonical도 그쪽을 가리킨다.
const DISALLOW = ["/ko/"];

// 크롤러는 자기 이름의 그룹이 있으면 그 그룹만 따르고 `*` 그룹은 보지 않는다
// (RFC 9309 §2.2.1 — `*`는 매칭되는 그룹이 없을 때만 쓰인다). 그래서 disallow는
// `*`에만 적으면 안 되고 그룹마다 되풀이해야 한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
