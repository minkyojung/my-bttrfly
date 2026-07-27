"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// 목록에 필요한 필드만 받는다. Post 전체를 넘기면 본문(content)까지 직렬화되어
// 45개 기준 RSC 페이로드가 불필요하게 커진다.
export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  category?: string;
  draft: boolean;
}

type Filter = "all" | "draft" | "published";

export function PostList({ posts }: { posts: PostListItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: posts.length,
      draft: posts.filter((p) => p.draft).length,
      published: posts.filter((p) => !p.draft).length,
    }),
    [posts]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (filter === "draft" && !post.draft) return false;
      if (filter === "published" && post.draft) return false;
      if (!q) return true;
      // 제목과 slug를 함께 검색한다(slug로 기억하는 경우가 있으므로).
      return (
        post.title.toLowerCase().includes(q) || post.slug.toLowerCase().includes(q)
      );
    });
  }, [posts, query, filter]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Drafts" },
    { key: "published", label: "Published" },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                "rounded-sm px-2.5 py-1.5 text-sm text-fg-muted hover:text-fg",
                filter === tab.key && "bg-surface font-bold text-fg"
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-fg-subtle">
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or slug…"
          className="ml-auto w-full max-w-xs rounded-sm border border-border bg-bg px-3 py-1.5 text-sm text-fg placeholder:text-fg-subtle"
        />
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-fg-muted">
          No posts match.
        </p>
      ) : (
        <div>
          {visible.map((post) => (
            <Link
              key={post.slug}
              href={`/write/${post.slug}`}
              className="flex items-center justify-between gap-4 border-b border-border py-3 hover:bg-surface/50"
            >
              <span className="min-w-0 font-medium">
                <span className="truncate">{post.title}</span>
                {post.draft && (
                  <span className="ml-2 rounded-sm bg-accent-warm/20 px-1.5 py-0.5 text-xs font-bold text-accent-warm">
                    Draft
                  </span>
                )}
              </span>
              <span className="shrink-0 text-sm text-fg-muted">
                {post.category ? `${post.category} · ` : ""}
                {post.date}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
