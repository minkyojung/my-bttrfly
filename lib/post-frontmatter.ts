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

// 폼이 관리하는 선택 필드는 "값이 있으면 설정, 비었으면 삭제"다. 단순 병합만
// 하면 폼에서 지운 값이 기존 값으로 되살아난다.
function setOrDelete(
  data: Record<string, unknown>,
  key: string,
  value: unknown
): void {
  if (typeof value === "string" && value) data[key] = value;
  else delete data[key];
}

/**
 * @param existing 기존 파일의 프론트매터. 수정 시 넘기면 폼이 모르는 필드가
 *   보존된다(생성 시에는 비워둔다). 이걸 넘기지 않고 새로 조립하면 폼에 없는
 *   필드가 저장할 때마다 사라진다.
 */
export function buildFrontmatter(
  body: PostBody,
  existing: Record<string, unknown> = {}
): Record<string, unknown> {
  const data: Record<string, unknown> = { ...existing };

  data.title = body.title;
  data.date = body.date;

  setOrDelete(data, "category", body.category);
  setOrDelete(data, "summary", body.summary);
  setOrDelete(data, "cover", body.cover);
  setOrDelete(data, "external", body.external);
  setOrDelete(data, "canonical", body.canonical);

  data.featured = body.featured === true;
  data.draft = body.draft === true;

  if (body.source === "disquiet" || body.source === "substack") {
    data.source = body.source;
  } else {
    delete data.source;
  }

  return data;
}
