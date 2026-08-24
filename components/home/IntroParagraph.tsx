import { Fragment } from "react";
import { INTRO, findEntry } from "@/lib/nav-entries";
import type { Locale } from "@/lib/i18n";
import { EntryLink } from "./EntryLink";

// `[문구](id)` — 마크다운 링크와 같은 표기.
// id에 하이픈이 들어간다(how-i-work). \w는 하이픈을 포함하지 않는다.
const TOKEN = /\[([^\]]+)\]\(([\w-]+)\)/g;

// 토큰 자리를 진입점 링크로 바꾼다. 알 수 없는 id는 문단에서 조용히 사라지지 않고
// 원문 그대로 남는다 — 오타를 눈에 보이게 두는 편이 낫다.
function render(template: string, locale: Locale) {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of template.matchAll(TOKEN)) {
    const start = match.index;
    if (start > cursor) nodes.push(template.slice(cursor, start));

    const [raw, phrase, id] = match;
    const entry = findEntry(id);
    nodes.push(
      entry ? (
        <EntryLink
          key={`${id}-${start}`}
          entry={entry}
          phrase={phrase}
          locale={locale}
        />
      ) : (
        raw
      )
    );

    cursor = start + raw.length;
  }

  if (cursor < template.length) nodes.push(template.slice(cursor));

  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}

// 홈의 자기소개 문단. 이 문단이 곧 네비게이션이다 — 문장 속 문구에 걸린 링크가
// 각 상세 페이지로 가는 유일한 입구다.
//
// whitespace-pre-line: 원문의 줄바꿈을 그대로 살린다. 문단의 호흡이 곧 레이아웃이라
// 어디서 줄이 바뀌는지가 의미를 갖는다.
export function IntroParagraph({ locale }: { locale: Locale }) {
  return (
    <p className="font-serif font-medium text-fg whitespace-pre-line text-[19px] leading-[1.9] tracking-[-0.01em]">
      {render(INTRO[locale], locale)}
    </p>
  );
}
