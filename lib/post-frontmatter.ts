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

function trimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * 저장 가능한 글인지 검사한다. 문제가 있으면 사용자에게 보여줄 문장을, 없으면
 * null을 돌려준다. 서버(거절의 근거)와 폼(제출 전 안내)이 같은 규칙을 써야
 * "폼은 통과시켰는데 서버가 막는" 상태가 생기지 않는다.
 *
 * 본문은 필수지만 external이 있으면 예외다 — 공개 페이지가 원문으로 리다이렉트하므로
 * 보여줄 본문이 애초에 없다. content/posts의 본문 없는 글 7편이 전부 이 경우이고,
 * 그동안 이 글들은 /write에서 카테고리 하나 고치는 것도 불가능했다.
 */
export function validatePost(body: PostBody): string | null {
  if (!trimmed(body.title)) return "Title is required";
  if (!trimmed(body.date)) return "Date is required";
  if (!trimmed(body.content) && !trimmed(body.external)) {
    return "Body is required unless the post has an external URL";
  }
  return null;
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
