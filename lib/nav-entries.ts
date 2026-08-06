import type { Locale } from "./i18n";

// 홈 문단 안에 박히는 진입점들의 단일 출처.
//
// 페이지는 각자 만든다(글 목록·책 목록·케이스 스터디는 생김새가 다 다르다).
// 여기 모으는 건 '문단이 균일하게 렌더해야 하는 것' — 아이콘, 라벨, 프리뷰 문구,
// 목적지 — 뿐이다.
//
// path는 로케일 프리픽스가 없는 순수 경로다. 링크를 만들 때 localePath()가 붙인다.
export interface NavEntry {
  id: string;
  path: string;
  label: Record<Locale, string>;
  preview: Record<Locale, { title: string; body: string }>;
  // 문단에 박히는 아이콘. 없으면 동그라미 플레이스홀더가 그려진다.
  icon?: string;
  // 문단에 등장하지 않는 항목. 페이지는 살아 있고 주소로 열리지만 어디에서도
  // 링크되지 않는다 — 문단이 유일한 네비게이션이므로 사실상 숨은 페이지다.
  // 임시 상태로만 쓴다. 계속 이 상태면 지우거나 문단에 넣어야 한다.
  unlisted?: boolean;
}

export const NAV_ENTRIES: NavEntry[] = [
  {
    id: "writing",
    path: "/writing",
    label: { ko: "글", en: "Writing" },
    preview: {
      ko: { title: "글", body: "제품과 AI에 대해 쓴 글을 모아둡니다." },
      en: { title: "Writing", body: "Essays on products, AI, and building." },
    },
    icon: "/images/entries/writing.png",
  },
  {
    id: "books",
    path: "/books",
    label: { ko: "책", en: "Books" },
    preview: {
      ko: { title: "책", body: "읽고 다시 읽는 책들." },
      en: { title: "Books", body: "What I read, and reread." },
    },
    icon: "/images/entries/books.png",
  },
  {
    id: "bookclub",
    path: "/bookclub",
    label: { ko: "북클럽", en: "Book club" },
    preview: {
      ko: { title: "북클럽", body: "좋은 원서를 골라 함께 읽던 모임." },
      en: {
        title: "Book club",
        body: "Reading carefully chosen English titles, together.",
      },
    },
    icon: "/images/entries/bookclub.png",
  },
  {
    id: "disquiet",
    path: "/disquiet",
    label: { ko: "디스콰이엇", en: "Disquiet" },
    preview: {
      ko: {
        title: "디스콰이엇",
        body: "Ops를 맡아 1년 만에 MAU 15K → 100K.",
      },
      en: {
        title: "Disquiet",
        body: "Led Ops — 15K to 100K MAU in a year.",
      },
    },
    icon: "/images/entries/disquiet.png",
  },
  {
    id: "how-i-work",
    path: "/how-i-work",
    label: { ko: "일하는 방식", en: "How I work" },
    preview: {
      ko: {
        title: "일하는 방식",
        body: "판단이 갈릴 때 무엇을 기준으로 삼는지.",
      },
      en: {
        title: "How I work",
        body: "What I fall back on when the call isn't obvious.",
      },
    },
    unlisted: true,
  },
  {
    id: "influences",
    path: "/influences",
    label: { ko: "영향받은 제품", en: "Influences" },
    preview: {
      ko: { title: "영향받은 제품", body: "많이 훔친 제품들, 그리고 무엇을 훔쳤는지." },
      en: {
        title: "Influences",
        body: "Products I've stolen from, and exactly what I took.",
      },
    },
  },
  {
    id: "now",
    path: "/now",
    label: { ko: "지금 하는 생각", en: "What I'm thinking about" },
    preview: {
      ko: { title: "지금", body: "요즘 붙들고 있는 질문들." },
      en: { title: "Now", body: "The questions I'm sitting with." },
    },
    unlisted: true,
  },
];

export function findEntry(id: string): NavEntry | undefined {
  return NAV_ENTRIES.find((entry) => entry.id === id);
}

// 라우트 파일이 자기 항목을 집을 때 쓴다. 없으면 빌드를 세운다 — 상세 페이지와
// 목록이 어긋나면 문단의 아이콘이 404로 이어지는데, 그건 배포 후에야 드러난다.
export function getEntry(id: string): NavEntry {
  const entry = findEntry(id);
  if (!entry) throw new Error(`Unknown nav entry: ${id}`);
  return entry;
}

// 자기소개 문단. `[문구](id)` 가 진입점이 된다 — 문구와 아이콘이 함께 하나의
// 링크가 되고, 호버하면 둘이 같이 강조된다.
//
// 조각 배열이 아니라 통짜 문자열로 두는 이유: 문단은 읽히는 게 목적이라 소스에서도
// 문장으로 보여야 고칠 수 있다. 조각으로 쪼개면 어순이 다른 언어로 옮길 때
// 무엇을 어디에 넣어야 하는지 알 수 없게 된다.
//
// 문법이 마크다운 링크와 같은 것은 의도적이다 — 이미 아는 표기라 배울 게 없고,
// 어느 문구가 어디로 가는지 소스에서 그대로 읽힌다.
export const INTRO: Record<Locale, string> = {
  ko: `안녕하세요, 정민교입니다.
[글 쓰는 것](writing)을 좋아하고, [책](books)을 좋아합니다.

좋은 원서를 골라 [북클럽](bookclub)을 운영하다가,
한국에서 가장 큰 스타트업 커뮤니티 [디스콰이엇](disquiet)에 합류하여
1년 동안 MAU를 15K에서 100K까지 늘리는데 기여했습니다.

올해 7월 전역 후, [이런 제품](influences)을 만드는데 관심이 많습니다.`,

  en: `Hi, I'm Minkyo Jung.
I love to [write](writing), and I love [books](books).

I ran a [book club](bookclub) around carefully chosen English titles,
then joined [Disquiet](disquiet), Korea's largest startup community,
where I helped grow MAU from 15K to 100K in a year.

Discharged this July, I'm most interested in building [products like these](influences).`,
};
