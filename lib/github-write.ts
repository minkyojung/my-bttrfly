/**
 * GitHub Contents API를 통한 콘텐츠 커밋. Vercel 서버리스 파일시스템은
 * ephemeral/read-only라 저장은 반드시 git 커밋으로 해야 한다 — Keystatic의
 * GitHub 모드가 내부적으로 하는 것과 동일한 방식. Route Handler(Node 런타임)
 * 전용이며, `Buffer` 등 Node API를 쓰므로 미들웨어(Edge)에서 import하면 안 된다.
 */
import "server-only";
import { cache } from "react";
import { GITHUB_REPO } from "@/lib/repo";

const GITHUB_API = "https://api.github.com";
const GITHUB_RAW = "https://raw.githubusercontent.com";

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

export interface RepoTextFile {
  path: string;
  content: string;
}

/**
 * 디렉터리 하나를 통째로 읽는다.
 *
 * 파일마다 Contents API를 부르면 46번 왕복이라, 트리를 한 번 받아 경로를 모으고
 * 내용은 raw에서 병렬로 가져온다. raw 주소는 트리가 알려준 커밋에 고정한다 —
 * 읽는 도중에 브랜치가 움직여도 한 시점의 스냅샷을 보게 되고, 주소가 불변이라
 * 캐시해도 안전하며, raw는 REST 요청 한도를 쓰지 않는다.
 *
 * cache()로 감싼 이유는 한 번의 렌더에서 여러 번 불려도 트리 요청이 한 번만
 * 나가게 하기 위함이다(요청 사이에는 공유되지 않는다).
 */
export const listTextFiles = cache(
  async (dir: string, extension = ".md"): Promise<RepoTextFile[]> => {
    const branch = getBranch();
    const res = await githubFetch(
      `/git/trees/${encodeURIComponent(branch)}?recursive=1`
    );
    if (!res.ok) throw new GitHubWriteError(await res.text(), res.status);

    const tree = (await res.json()) as {
      sha: string;
      truncated?: boolean;
      tree: { path: string; type: string }[];
    };
    // 트리가 잘렸는데 그냥 넘어가면 글이 조용히 사라진 목록을 보여주게 된다.
    // 지금은 한도(10만 항목)의 0.05% 수준이지만, 조용히 틀리느니 멈추는 게 낫다.
    if (tree.truncated) {
      throw new GitHubWriteError(
        `Tree listing for ${branch} was truncated — too many files to list in one request`,
        502
      );
    }

    const prefix = dir.endsWith("/") ? dir : `${dir}/`;
    const paths = tree.tree
      .filter(
        (e) =>
          e.type === "blob" &&
          e.path.startsWith(prefix) &&
          e.path.endsWith(extension)
      )
      .map((e) => e.path);

    const { owner, name } = getRepo();
    return Promise.all(
      paths.map(async (path) => {
        const blob = await fetch(
          `${GITHUB_RAW}/${owner}/${name}/${tree.sha}/${encodeURI(path)}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "User-Agent": "minkyojung.com write-ui",
            },
          }
        );
        if (!blob.ok) {
          throw new GitHubWriteError(`Failed to read ${path}`, blob.status);
        }
        return { path, content: await blob.text() };
      })
    );
  }
);

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
