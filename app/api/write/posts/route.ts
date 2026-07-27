import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { getFile, putFile, GitHubWriteError } from "@/lib/github-write";
import { SLUG_PATTERN } from "@/lib/slugify";
import { buildFrontmatter, type PostBody } from "@/lib/post-frontmatter";

interface CreatePostBody extends PostBody {
  slug?: unknown;
}

export async function POST(request: NextRequest) {
  let body: CreatePostBody;
  try {
    body = (await request.json()) as CreatePostBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, date, content } = body;
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (typeof date !== "string" || !date.trim()) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // slug는 클라이언트가 제안하고 서버가 검증한다. 조용히 변형하지 않고,
  // 라우팅이 받아주는 규칙(SLUG_PATTERN)에 맞지 않으면 거절한다 —
  // 이래야 "커밋은 되는데 못 읽는 파일"이 애초에 안 만들어진다.
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase letters, numbers, and hyphens" },
      { status: 400 }
    );
  }

  try {
    const existing = await getFile(`content/posts/${slug}.md`);
    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists — change the slug" },
        { status: 409 }
      );
    }

    const frontmatterData = buildFrontmatter(body);
    const fileText = matter.stringify(content, frontmatterData);
    await putFile(`content/posts/${slug}.md`, fileText, `content: create ${slug}`);

    return NextResponse.json({ slug }, { status: 201 });
  } catch (err) {
    if (err instanceof GitHubWriteError) {
      const status = err.status && err.status >= 100 ? err.status : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("Failed to create post", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
