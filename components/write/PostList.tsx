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

  // 토글 결과는 GitHub 커밋 → 재배포 후에야 서버 목록에 반영된다. 그때까지
  // 화면이 옛 상태로 보이지 않도록 낙관적으로 덮어쓴다.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [toggled, setToggled] = useState(false);

  const isDraft = (post: PostListItem) => overrides[post.slug] ?? post.draft;

  async function toggleDraft(post: PostListItem) {
    const next = !isDraft(post);
    setError(null);
    setPending((p) => ({ ...p, [post.slug]: true }));
    try {
      const res = await fetch(`/api/write/posts/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update");
        return;
      }
      setOverrides((o) => ({ ...o, [post.slug]: next }));
      setToggled(true);
    } catch {
      setError("Failed to update");
    } finally {
      setPending((p) => ({ ...p, [post.slug]: false }));
    }
  }

  const counts = useMemo(() => {
    const drafts = posts.filter((p) => overrides[p.slug] ?? p.draft).length;
    return { all: posts.length, draft: drafts, published: posts.length - drafts };
  }, [posts, overrides]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const draft = overrides[post.slug] ?? post.draft;
      if (filter === "draft" && !draft) return false;
      if (filter === "published" && draft) return false;
      if (!q) return true;
      // 제목과 slug를 함께 검색한다(slug로 기억하는 경우가 있으므로).
      return (
        post.title.toLowerCase().includes(q) || post.slug.toLowerCase().includes(q)
      );
    });
  }, [posts, query, filter, overrides]);

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

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      {toggled && !error && (
        <p className="mb-3 text-xs text-fg-subtle">
          Published state is committed. The live site updates once the new
          deploy finishes (~1–2 min).
        </p>
      )}

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-fg-muted">
          No posts match.
        </p>
      ) : (
        <div>
          {visible.map((post) => {
            const draft = isDraft(post);
            const busy = pending[post.slug];
            return (
              <div
                key={post.slug}
                className="flex items-center justify-between gap-4 border-b border-border"
              >
                <Link
                  href={`/write/${post.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-2 py-3 font-medium hover:opacity-70"
                >
                  <span className="truncate">{post.title}</span>
                  {draft && (
                    <span className="shrink-0 rounded-sm bg-accent-warm/20 px-1.5 py-0.5 text-xs font-bold text-accent-warm">
                      Draft
                    </span>
                  )}
                </Link>

                <span className="shrink-0 text-sm text-fg-muted">
                  {post.category ? `${post.category} · ` : ""}
                  {post.date}
                </span>

                {/* 초안은 공개 페이지에서 404이므로 발행된 글에만 노출한다. */}
                <span className="w-8 shrink-0 text-right">
                  {!draft && (
                    <a
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      title="View live post"
                      className="text-xs text-fg-muted hover:text-fg"
                    >
                      ↗
                    </a>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => toggleDraft(post)}
                  disabled={busy}
                  className="w-20 shrink-0 rounded-sm border border-border px-2 py-1 text-xs text-fg-muted hover:text-fg disabled:opacity-50"
                >
                  {busy ? "…" : draft ? "Publish" : "Unpublish"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
