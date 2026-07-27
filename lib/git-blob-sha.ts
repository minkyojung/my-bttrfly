import "server-only";
import { createHash } from "node:crypto";

// git이 파일 내용에 부여하는 blob 해시. GitHub Contents API가 돌려주는 `sha`와
// 같은 값이라, 에디터가 읽은 내용의 지문을 로컬에서 계산해 두었다가 저장 시
// GitHub의 현재 sha와 비교하는 용도로 쓴다(동시 수정 감지).
export function gitBlobSha(content: string): string {
  const bytes = Buffer.from(content, "utf8");
  return createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]))
    .digest("hex");
}
