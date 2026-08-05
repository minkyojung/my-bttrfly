// 프론트매터 date 필드의 계약. lib/markdown.ts가 빌드 시점에 이걸로 막는다.

// 프론트매터의 date가 지켜야 하는 형태. 이 값은 그대로 app/sitemap.ts의 new Date()로
// 흘러가고, Invalid Date도 instanceof Date이므로 Next의 sitemap 직렬화가
// toISOString()에서 RangeError로 죽는다 — 즉 파싱 불가한 날짜 하나가 커밋되면 그 뒤의
// 모든 배포가 실패한다. 어느 파일이 문제인지도 알려주지 않는 형태로.
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
