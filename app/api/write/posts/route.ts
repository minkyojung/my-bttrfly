import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { getFile, putFile, GitHubWriteError } from "@/lib/github-write";
import { slugify } from "@/lib/slugify";

interface CreatePostBody {
  title?: unknown;
  date?: unknown;
  category?: unknown;
  summary?: unknown;
  cover?: unknown;
  external?: unknown;
  featured?: unknown;
  draft?: unknown;
  source?: unknown;
  content?: unknown;
}

function buildFrontmatter(body: CreatePostBody) {
  const data: Record<string, unknown> = { title: body.title, date: body.date };

  if (typeof body.category === "string" && body.category) data.category = body.category;
  if (typeof body.summary === "string" && body.summary) data.summary = body.summary;
  if (typeof body.cover === "string" && body.cover) data.cover = body.cover;
  if (typeof body.external === "string" && body.external) data.external = body.external;

  data.featured = body.featured === true;
  data.draft = body.draft === true;

  if (body.source === "disquiet" || body.source === "substack") {
    data.source = body.source;
  }

  return data;
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

  const slug = slugify(title);
  if (!slug) {
    return NextResponse.json(
      { error: "Title must contain at least one letter or number" },
      { status: 400 }
    );
  }

  try {
    const existing = await getFile(`content/posts/${slug}.md`);
    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists — change the title" },
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
