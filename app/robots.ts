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
// (RFC 9309 §2.2.1 — `*`는 매칭되는 그룹이 없을 때만 쓰인다). 그래서 비공개
// 경로가 다시 생기면 disallow를 `*`에만 적지 말고 그룹마다 되풀이해야 한다.
// 지금은 사이트 전체가 공개라 disallow할 것이 없다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
