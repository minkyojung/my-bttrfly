import { Fragment } from "react";
import { INTRO, findEntry } from "@/lib/nav-entries";
import type { Locale } from "@/lib/i18n";
import { getAllPosts, type Post } from "@/lib/markdown";
import { groupBySection } from "@/lib/columns";
import { EntryLink } from "./EntryLink";

// `[문구](id)` — 마크다운 링크와 같은 표기. id는 NAV_ENTRIES의 등록된 항목
// (하이픈 포함, how-i-work) 이거나, 전용 상세 페이지가 없는 그냥 바깥 링크
// (https://...)일 수 있다. 괄호를 안 쓰는 문자만 허용해서 URL도 그대로 담는다.
const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

// 문장 속 그냥 바깥 링크(등록된 진입점이 아닌)에 붙는 표시. EntryLink처럼
// 전용 상세 페이지·호버 카드는 없다 — 파비콘 하나로 어디로 가는지만 알려준다.
const FAVICON_MARK = "mx-[0.2em] inline-block h-[1.1em] w-[1.1em] align-[-0.2em] rounded-[0.3em] object-contain";

// 구글 파비콘 서비스는 GitHub 파비콘을 흰 배경 사각형에 담아 내려준다 —
// 다크 배경에서 그 흰 박스만 눈에 띈다. github.com만 배경 없는 자체 SVG
// (ProfileSection/ProfileInfo.tsx의 옥토캣과 같은 path)로 대체한다.
function GithubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="mx-[0.2em] inline-block h-[0.9em] w-[0.9em] align-[-0.1em] text-fg-muted"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function ExternalMark({ phrase, href }: { phrase: string; href: string }) {
  const domain = new URL(href).hostname;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-sm px-[0.2em] underline decoration-fg-subtle underline-offset-2 transition-colors duration-200 hover:bg-surface-elevated"
    >
      {phrase}
      {domain === "github.com" ? (
        <GithubMark />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 파비콘 하나 띄우자고
        // next/image 원격 도메인 허용 목록에 구글 파비콘 서비스를 추가할 필요는 없다.
        <img
          src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
          alt=""
          aria-hidden
          width={18}
          height={18}
          className={FAVICON_MARK}
        />
      )}
    </a>
  );
}

// 토큰 자리를 진입점 링크로 바꾼다. 알 수 없는 id는 문단에서 조용히 사라지지 않고
// 원문 그대로 남는다 — 오타를 눈에 보이게 두는 편이 낫다.
function render(template: string, locale: Locale, disquietPosts: Post[]) {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of template.matchAll(TOKEN)) {
    const start = match.index;
    if (start > cursor) nodes.push(template.slice(cursor, start));

    const [raw, phrase, id] = match;
    const entry = findEntry(id);
    const node = entry ? (
      <EntryLink
        key={`${id}-${start}`}
        entry={entry}
        phrase={phrase}
        locale={locale}
        postLinks={id === "disquiet" ? disquietPosts : undefined}
      />
    ) : id.startsWith("http") ? (
      <ExternalMark key={`${id}-${start}`} phrase={phrase} href={id} />
    ) : (
      raw
    );
    nodes.push(node);

    cursor = start + raw.length;
  }

  if (cursor < template.length) nodes.push(template.slice(cursor));

  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}

// 홈의 자기소개 문단. 이 문단이 곧 네비게이션이다 — 문장 속 문구에 걸린 링크가
// 각 상세 페이지로 가는 유일한 입구다.
//
// 문단(빈 줄로 구분된 \n\n 덩어리)마다 <p>를 따로 두고 margin으로 띄운다 —
// 전에는 whitespace-pre-line 하나로 전체를 감싸서, 문단 사이 빈 줄도 본문과
// 같은 line-height만큼 벌어졌다(줄 간격을 건드리지 않고 문단 간격만 좁히려면
// 그 둘을 분리해야 한다). 문단 안의 홑줄바꿈(번호 목록 등)은 각 <p>에 여전히
// whitespace-pre-line을 둬서 살린다.
export async function IntroParagraph({ locale }: { locale: Locale }) {
  const disquietPosts =
    groupBySection(await getAllPosts(), 4).find((g) => g.value === "work")
      ?.posts ?? [];

  // 첫 문단("안녕하세요, 정민교입니다.")만 헤딩으로 뗀다. 링크가 없는 순수
  // 인사말이라 render()를 거칠 필요는 없다 — INTRO의 첫 문단이 그 인사말
  // 하나뿐이어야 한다는 게 이 분리의 전제다.
  const [heading, ...paragraphs] = INTRO[locale].split("\n\n");

  return (
    <div>
      <h2 className="font-serif font-bold text-fg text-2xl tracking-[-0.01em] mb-3">
        {heading}
      </h2>
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className="font-serif font-medium text-fg whitespace-pre-line text-[17px] leading-[1.85] tracking-[-0.01em] mt-6 first:mt-0"
        >
          {render(paragraph, locale, disquietPosts)}
        </p>
      ))}
    </div>
  );
}
