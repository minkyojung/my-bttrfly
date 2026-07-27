// 글 생성/수정이 공유하는 프론트매터 조립 로직. 두 라우트에 복사돼 있던 것을
// 합쳤다 — 필드를 하나 추가할 때 한쪽만 고쳐서 값이 조용히 사라지는 사고를
// 막기 위함이다(실제로 canonical에서 한 번 발생했다).

// 폼이 보내는 값. 신뢰할 수 없는 입력이므로 전부 unknown으로 받는다.
export interface PostBody {
  title?: unknown;
  date?: unknown;
  category?: unknown;
  summary?: unknown;
  cover?: unknown;
  external?: unknown;
  canonical?: unknown;
  featured?: unknown;
  draft?: unknown;
  source?: unknown;
  content?: unknown;
}

export function buildFrontmatter(body: PostBody): Record<string, unknown> {
  const data: Record<string, unknown> = { title: body.title, date: body.date };

  if (typeof body.category === "string" && body.category) data.category = body.category;
  if (typeof body.summary === "string" && body.summary) data.summary = body.summary;
  if (typeof body.cover === "string" && body.cover) data.cover = body.cover;
  if (typeof body.external === "string" && body.external) data.external = body.external;
  if (typeof body.canonical === "string" && body.canonical) data.canonical = body.canonical;

  data.featured = body.featured === true;
  data.draft = body.draft === true;

  if (body.source === "disquiet" || body.source === "substack") {
    data.source = body.source;
  }

  return data;
}
