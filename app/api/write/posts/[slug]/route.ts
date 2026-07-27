import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { getFile, putFile, deleteFile, GitHubWriteError } from "@/lib/github-write";
import { buildFrontmatter, type PostBody } from "@/lib/post-frontmatter";

type UpdatePostBody = PostBody;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!/^[\w-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  let body: UpdatePostBody;
  try {
    body = (await request.json()) as UpdatePostBody;
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

  try {
    const existing = await getFile(`content/posts/${slug}.md`);
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 기존 프론트매터를 넘겨 폼이 다루지 않는 필드가 보존되게 한다.
    const frontmatterData = buildFrontmatter(body, matter(existing.content).data);
    const fileText = matter.stringify(content, frontmatterData);
    await putFile(
      `content/posts/${slug}.md`,
      fileText,
      `content: update ${slug}`,
      existing.sha
    );

    return NextResponse.json({ slug }, { status: 200 });
  } catch (err) {
    if (err instanceof GitHubWriteError) {
      const status = err.status && err.status >= 100 ? err.status : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("Failed to update post", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

// 발행/초안 전환 전용. 목록에서 토글할 때 본문을 왕복시키지 않기 위해 PUT과
// 분리했다. 기존 파일을 읽어 draft만 바꾸므로 나머지 프론트매터와 본문은
// 그대로 보존된다.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!/^[\w-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  let body: { draft?: unknown };
  try {
    body = (await request.json()) as { draft?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof body.draft !== "boolean") {
    return NextResponse.json({ error: "draft must be a boolean" }, { status: 400 });
  }
  const draft = body.draft;

  try {
    const existing = await getFile(`content/posts/${slug}.md`);
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const parsed = matter(existing.content);
    const fileText = matter.stringify(parsed.content, { ...parsed.data, draft });
    await putFile(
      `content/posts/${slug}.md`,
      fileText,
      `content: ${draft ? "unpublish" : "publish"} ${slug}`,
      existing.sha
    );

    return NextResponse.json({ slug, draft }, { status: 200 });
  } catch (err) {
    if (err instanceof GitHubWriteError) {
      const status = err.status && err.status >= 100 ? err.status : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("Failed to toggle draft", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

// 글 삭제. 파일만 지우고 본문에 딸린 업로드 이미지는 건드리지 않는다 —
// 다른 글이 같은 이미지를 참조할 수 있고, 삭제는 커밋이라 되돌릴 수 있지만
// 잘못 지운 이미지를 추적해 복원하는 건 훨씬 번거롭기 때문이다.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!/^[\w-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const existing = await getFile(`content/posts/${slug}.md`);
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await deleteFile(
      `content/posts/${slug}.md`,
      `content: delete ${slug}`,
      existing.sha
    );

    return NextResponse.json({ slug }, { status: 200 });
  } catch (err) {
    if (err instanceof GitHubWriteError) {
      const status = err.status && err.status >= 100 ? err.status : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("Failed to delete post", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
