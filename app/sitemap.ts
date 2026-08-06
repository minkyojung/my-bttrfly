import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/markdown";
import { groupByColumn, columnSlug } from "@/lib/columns";
import { siteConfig, postUrl } from "@/lib/site-config";
import { DEFAULT_LOCALE, LOCALES, localePath } from "@/lib/i18n";
import { NAV_ENTRIES } from "@/lib/nav-entries";

// 로케일마다 존재하는 화면. 글(/posts)과 섹션(/columns)은 기본 로케일에만 있으므로
// 여기 들어오지 않는다 — lib/i18n.ts의 UNLOCALIZED_PREFIXES와 같은 규칙이다.
//
// 상세 페이지는 NAV_ENTRIES에서 끌어온다. 항목을 추가하면 sitemap이 따라온다 —
// 목록을 두 곳에 적으면 반드시 한쪽을 잊는다.
const LOCALIZED_PATHS = [
  "/",
  "/about",
  ...NAV_ENTRIES.map((entry) => entry.path),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getAllPosts();
  const posts = all.filter((p) => !p.external);
  const now = new Date();

  // 글이 있는 섹션만 싣는다. groupByColumn이 빈 칼럼을 이미 걸러준다.
  const columns = groupByColumn(all);

  const localized = LOCALIZED_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${siteConfig.url}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency: (path === "/" ? "weekly" : "monthly") as
        | "weekly"
        | "monthly",
      priority: path === "/" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${siteConfig.url}${localePath(l, path)}`])
        ),
      },
    }))
  );

  return [
    ...localized,
    ...columns.map((group) => ({
      url: `${siteConfig.url}${localePath(
        DEFAULT_LOCALE,
        `/columns/${columnSlug(group.value)}`
      )}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
