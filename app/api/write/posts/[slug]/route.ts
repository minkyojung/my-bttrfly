import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { getFile, putFile, deleteFile, GitHubWriteError } from "@/lib/github-write";
import { buildFrontmatter, type PostBody } from "@/lib/post-frontmatter";

interface UpdatePostBody extends PostBody {
  // 에디터가 읽은 시점의 파일 지문(git blob sha).
  baseSha?: unknown;
}

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

    // 에디터가 읽은 이후 다른 경로(목록의 발행 토글, Keystatic, 다른 탭)에서
    // 파일이 바뀌었으면 덮어쓰지 않고 거절한다. 저장 직전에 sha를 새로 읽어
    // 쓰기만 하면 GitHub의 충돌 검사가 무력화되어 남의 변경이 조용히 사라진다.
    if (typeof body.baseSha === "string" && body.baseSha !== existing.sha) {
      return NextResponse.json(
        {
          error:
            "This post changed somewhere else since you opened it. Reload to get the latest version.",
        },
        { status: 409 }
      );
    }

    // 기존 프론트매터를 넘겨 폼이 다루지 않는 필드가 보존되게 한다.
    const frontmatterData = buildFrontmatter(body, matter(existing.content).data);
    const fileText = matter.stringify(content, frontmatterData);
    const newSha = await putFile(
      `content/posts/${slug}.md`,
      fileText,
      `content: update ${slug}`,
      existing.sha
    );

    return NextResponse.json({ slug, sha: newSha }, { status: 200 });
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
