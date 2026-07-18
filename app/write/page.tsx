import Link from "next/link";
import { getAllPostsForEdit } from "@/lib/markdown";

export default async function WriteListPage() {
  const posts = await getAllPostsForEdit();

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Posts</h1>
        <Link
          href="/write/new"
          className="rounded-sm bg-accent-warm px-3 py-2 text-sm font-bold text-white"
        >
          New post
        </Link>
      </div>

      <div>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/write/${post.slug}`}
            className="flex items-center justify-between gap-4 border-b border-border py-3"
          >
            <span className="font-medium">
              {post.title}
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
    </div>
  );
}
