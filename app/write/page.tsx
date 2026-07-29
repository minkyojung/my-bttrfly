import Link from "next/link";
import matter from "gray-matter";
import { listTextFiles, GitHubWriteError } from "@/lib/github-write";
import { PostList, type PostListItem } from "@/components/write/PostList";

// 편집 화면과 마찬가지로 배포본이 아니라 GitHub에서 읽는다. 파일시스템은 빌드
// 시점에 얼어붙어 있어서, 방금 만든 글이 목록에 없고 발행 토글은 되돌아간 것처럼
// 보였다 — 저장은 됐는데 화면만 옛날을 가리키는 상태였다.
export const dynamic = "force-dynamic";

function toItem(path: string, raw: string): PostListItem {
  const { data } = matter(raw);
  const slug = path.replace(/^.*\//, "").replace(/\.md$/, "");
  return {
    slug,
    // 목록에 필요한 값만 꺼낸다. 본문은 클라이언트로 넘기지 않는다.
    title: typeof data.title === "string" ? data.title : slug,
    date:
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : String(data.date ?? ""),
    category: typeof data.category === "string" ? data.category : undefined,
    draft: data.draft === true,
  };
}

export default async function WriteListPage() {
  let items: PostListItem[];
  try {
    const files = await listTextFiles("content/posts");
    items = files
      .map((f) => toItem(f.path, f.content))
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (err) {
    console.error("Failed to list posts for editing", err);
    return (
      <div className="mx-auto max-w-content px-6 py-16">
        <h1 className="mb-2 text-xl font-bold">글 목록을 불러오지 못했습니다</h1>
        <p className="text-sm text-fg-muted">
          {err instanceof GitHubWriteError
            ? `GitHub이 요청을 거절했습니다 (${err.status}). 토큰과 GITHUB_WRITE_BRANCH를 확인해 주세요.`
            : "GitHub에 연결하지 못했습니다. GITHUB_WRITE_TOKEN이 설정되어 있는지 확인해 주세요."}
        </p>
      </div>
    );
  }

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
