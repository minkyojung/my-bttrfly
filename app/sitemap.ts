import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/markdown";
import { groupByColumn } from "@/lib/front-page";
import { columnSlug } from "@/lib/columns";
import { siteConfig, postUrl } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getAllPosts();
  const posts = all.filter((p) => !p.external);
  const now = new Date();

  // 글이 있는 섹션만 싣는다. groupByColumn이 빈 칼럼을 이미 걸러준다.
  const columns = groupByColumn(all);

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...columns.map((group) => ({
      url: `${siteConfig.url}/columns/${columnSlug(group.value)}`,
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
