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

// 크롤러는 자기 이름의 그룹이 있으면 그 그룹만 따르고 `*` 그룹은 보지 않는다
// (RFC 9309 §2.2.1 — `*`는 매칭되는 그룹이 없을 때만 쓰인다). 그래서 disallow를
// 그룹마다 되풀이해야 한다. `*`에만 적어두면 위에 이름을 적어둔 봇들에게는
// /write가 열린 채로 남는다(로그인 페이지가 색인된다).
const DISALLOW = ["/write"];

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
