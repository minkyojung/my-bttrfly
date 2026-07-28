/**
 * GitHub Contents API를 통한 콘텐츠 커밋. Vercel 서버리스 파일시스템은
 * ephemeral/read-only라 저장은 반드시 git 커밋으로 해야 한다 — Keystatic의
 * GitHub 모드가 내부적으로 하는 것과 동일한 방식. Route Handler(Node 런타임)
 * 전용이며, `Buffer` 등 Node API를 쓰므로 미들웨어(Edge)에서 import하면 안 된다.
 */
import "server-only";
import { GITHUB_REPO } from "@/lib/repo";

const GITHUB_API = "https://api.github.com";

export class GitHubWriteError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubWriteError";
    this.status = status;
  }
}

function getRepo(): { owner: string; name: string } {
  const [owner, name] = GITHUB_REPO.split("/");
  return { owner, name };
}

function getToken(): string {
  const token = process.env.GITHUB_WRITE_TOKEN;
  if (!token) throw new Error("GITHUB_WRITE_TOKEN is not set");
  return token;
}

// 저장은 기본적으로 main에 커밋한다(프로덕션이 배포하는 브랜치).
// 기능 브랜치에서 개발할 때는 GITHUB_WRITE_BRANCH로 그 브랜치를 지정해야 한다.
// 지정하지 않으면 화면에는 체크아웃한 브랜치의 글이 보이는데 저장은 main으로
// 가므로, 브랜치에서 만든 글은 404가 나고 고친 글은 409(충돌)가 난다.
function getBranch(): string {
  return process.env.GITHUB_WRITE_BRANCH || "main";
}

async function githubFetch(path: string, init?: RequestInit): Promise<Response> {
  const { owner, name } = getRepo();
  return fetch(`${GITHUB_API}/repos/${owner}/${name}${path}`, {
    // CMS 읽기는 절대 캐시하면 안 된다. 캐시된 sha로 충돌을 판정하면 검사가
    // 거짓말을 하게 되고, 그게 이 파일이 고치려는 문제와 같은 종류의 버그다.
    // init보다 앞에 둬서 호출부가 필요하면 덮어쓸 수 있게 한다.
    cache: "no-store",
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "minkyojung.com write-ui",
      ...(init?.headers ?? {}),
    },
  });
}

export interface GitHubFile {
  content: string; // utf8 디코딩된 내용
  sha: string;
}

export async function getFile(path: string): Promise<GitHubFile | null> {
  const res = await githubFetch(`/contents/${encodeURI(path)}?ref=${encodeURIComponent(getBranch())}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GitHubWriteError(await res.text(), res.status);
  }
  const json = (await res.json()) as { content: string; sha: string };
  const content = Buffer.from(json.content, "base64").toString("utf8");
  return { content, sha: json.sha };
}

// 신규 생성이면 sha 없이, 기존 파일 수정이면 sha를 반드시 넘겨야 GitHub이
// 받아준다. sha 불일치는 GitHub이 409/422로 알려주므로 별도 락 구현은 불필요.
// 쓰기 후의 새 sha를 돌려준다 — 에디터가 저장 직후에도 최신 지문을 들고 있어야
// 연속 저장이 동시 수정으로 오인되지 않는다.
export async function putFile(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<string> {
  const res = await githubFetch(`/contents/${encodeURI(path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch: getBranch(),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new GitHubWriteError(await res.text(), res.status);
  }
  const json = (await res.json()) as { content?: { sha?: string } };
  return json.content?.sha ?? "";
}

// 삭제도 커밋이므로 git 히스토리에 남는다(되돌릴 수 있음). sha는 필수 —
// 삭제하려는 내용이 읽은 시점과 같은지 GitHub이 확인하는 근거다.
export async function deleteFile(
  path: string,
  message: string,
  sha: string
): Promise<void> {
  const res = await githubFetch(`/contents/${encodeURI(path)}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: getBranch() }),
  });
  if (!res.ok) {
    throw new GitHubWriteError(await res.text(), res.status);
  }
}

export async function putBinaryFile(
  path: string,
  base64Content: string,
  message: string
): Promise<void> {
  const res = await githubFetch(`/contents/${encodeURI(path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: getBranch(),
    }),
  });
  if (!res.ok) {
    throw new GitHubWriteError(await res.text(), res.status);
  }
}
