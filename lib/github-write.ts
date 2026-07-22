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

async function githubFetch(path: string, init?: RequestInit): Promise<Response> {
  const { owner, name } = getRepo();
  return fetch(`${GITHUB_API}/repos/${owner}/${name}${path}`, {
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
  const res = await githubFetch(`/contents/${encodeURI(path)}?ref=main`);
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
export async function putFile(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const res = await githubFetch(`/contents/${encodeURI(path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch: "main",
      ...(sha ? { sha } : {}),
    }),
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
      branch: "main",
    }),
  });
  if (!res.ok) {
    throw new GitHubWriteError(await res.text(), res.status);
  }
}
