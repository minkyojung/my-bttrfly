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

// 프론트매터의 date가 지켜야 하는 형태. 이 값은 그대로 app/sitemap.ts의 new Date()로
// 흘러가고, Invalid Date도 instanceof Date이므로 Next의 sitemap 직렬화가
// toISOString()에서 RangeError로 죽는다 — 즉 파싱 불가한 날짜 하나가 커밋되면 그 뒤의
// 모든 배포가 실패하는데, API는 이미 200을 돌려준 상태다. 그래서 경계에서 막는다.
// lib/markdown.ts도 같은 규칙을 써서 빌드 시점에 한 번 더 막는다.
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// YYYY-MM-DD이고 달력에 실제로 존재하는 날짜인지.
//
// Date.parse만으로는 부족하다. 월 13이나 일 32는 NaN을 주지만 일자 넘침은 조용히
// 굴러가서 2024-02-31이 3월 2일로, 2023-02-29가 3월 1일로 통과한다. 그래서 구성요소로
// 되짚어 같은 날짜가 나오는지 확인한다(윤년 판정까지 이 비교가 대신해준다).
export function isValidPostDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
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
  const date = trimmed(body.date);
  if (!date) return "Date is required";
  if (!isValidPostDate(date)) return "Date must be in YYYY-MM-DD format";
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

  // trimmed로 넣는다. 앞뒤 공백을 그대로 저장하면 YAML에 남아 이후 비교·정렬이
  // 어긋난다(validatePost는 trim한 값으로 검사하므로 통과해 버린다).
  data.title = trimmed(body.title);
  data.date = trimmed(body.date);

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
