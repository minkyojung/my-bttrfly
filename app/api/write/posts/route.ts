import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { getFile, putFile } from "@/lib/github-write";
import { writeErrorResponse } from "@/lib/write-api";
import { SLUG_PATTERN } from "@/lib/slugify";
import {
  buildFrontmatter,
  validatePost,
  type PostBody,
} from "@/lib/post-frontmatter";

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

  const invalid = validatePost(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }
  const content = typeof body.content === "string" ? body.content : "";

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
    // 새 sha를 돌려줘야 폼이 곧바로 이어서 저장할 수 있다. 이게 없으면 폼은
    // 지문 없이 다음 저장을 보내고, PUT의 충돌 검사가 조용히 건너뛰어진다.
    const sha = await putFile(
      `content/posts/${slug}.md`,
      fileText,
      `content: create ${slug}`
    );

    return NextResponse.json(
      { slug, sha },
      { status: 201, headers: { Location: `/write/${slug}` } }
    );
  } catch (err) {
    return writeErrorResponse(err, "Failed to create post");
  }
}
