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
  },
  {
    id: "books",
    path: "/books",
    label: { ko: "책", en: "Books" },
    preview: {
      ko: { title: "책", body: "읽고 다시 읽는 책들." },
      en: { title: "Books", body: "What I read, and reread." },
    },
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
한국에서 가장 큰 스타트업 커뮤니티 [디스콰이엇](disquiet)에 합류했습니다.
디스콰이엇에서 Ops를 맡아 1년 동안 광고 없이 콘텐츠만으로 MAU를 15K에서 100K까지 늘렸습니다.
그러면서 [일하고 판단하는 방식](how-i-work)이 생겼고, 그 대부분은 [좋은 제품들](influences)에서 훔친 것입니다.
이후 21개월간 사회복무요원 복무를 마치고,
지금은 [이런 생각](now)을 하며 할 일을 찾는 중입니다.`,

  en: `Hi, I'm Minkyo Jung.
I love to [write](writing), and I love [books](books).
I ran a [book club](bookclub) around carefully chosen English titles,
then joined [Disquiet](disquiet), Korea's largest startup community.
As Ops there I grew MAU from 15K to 100K in a year — no ads, content only.
Along the way I built [a way of working and deciding](how-i-work), most of it stolen from [products I admire](influences).
After 21 months of alternative civilian service,
I'm now [thinking about this](now) and looking for what's next.`,
};
