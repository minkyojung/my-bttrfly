import "server-only";
import { cache } from "react";
import fs from "fs";
import path from "path";
import { collectImageMeta, type ImageMeta } from "./markdown";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

// 상세 페이지의 본문. `content/pages/<id>.<locale>.md` 를 그대로 읽는다.
//
// 글(content/posts)과 달리 프론트매터가 없다 — 제목·설명·주소는 이미
// lib/nav-entries.ts가 갖고 있고, 같은 사실을 두 곳에 적으면 반드시 갈라진다.
// 여기 파일은 본문만 담는다.
//
// 파일이 없으면 화면이 죽는 게 아니라 '준비 중'이 뜬다. 그래야 글을 하나씩
// 채워나갈 수 있다.
const pagesDirectory = path.join(process.cwd(), "content/pages");

export interface PageContent {
  content: string;
  imageMeta: Record<string, ImageMeta>;
  // 요청한 언어의 파일이 없어 기본 로케일 원고를 대신 보여주는 중인가.
  // 한국어부터 쓰고 영어를 나중에 붙일 수 있어야 하므로 404로 만들지 않는다.
  isFallback: boolean;
}

function readFile(id: string, locale: Locale): string | null {
  const file = path.join(pagesDirectory, `${id}.${locale}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8").trim();
  return raw || null;
}

async function getPageContentUncached(
  id: string,
  locale: Locale
): Promise<PageContent | null> {
  // 경로 탈출 차단. id는 코드가 정하지만 방어는 읽는 쪽에 둔다.
  if (!/^[\w-]+$/.test(id)) return null;

  const own = readFile(id, locale);
  if (own) return { content: own, imageMeta: collectImageMeta(own), isFallback: false };

  if (locale !== DEFAULT_LOCALE) {
    const fallback = readFile(id, DEFAULT_LOCALE);
    if (fallback) {
      return {
        content: fallback,
        imageMeta: collectImageMeta(fallback),
        isFallback: true,
      };
    }
  }

  return null;
}

export const getPageContent = cache(getPageContentUncached);
