import Link from "next/link";
import { getAllPostsForEdit } from "@/lib/markdown";
import { PostList } from "@/components/write/PostList";

export default async function WriteListPage() {
  const posts = await getAllPostsForEdit();
  // 목록에 필요한 필드만 추려 클라이언트로 넘긴다(본문까지 직렬화되지 않도록).
  const items = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    draft: post.draft,
  }));

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

      <PostList posts={items} />
    </div>
  );
}
