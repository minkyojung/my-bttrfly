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
  // 여기 있으면 문단의 링크는 path 대신 이 주소로, 새 탭으로 나간다.
  // path는 그대로 둔다 — 상세 페이지와 sitemap은 계속 그 경로에 있다.
  externalUrl?: string;
  // 프리뷰 카드 맨 위에 깔리는 사진. 없으면 글자만 있는 카드가 된다.
  previewImage?: string;
  // 홈 문단에 싣지 않는 항목. 문단은 짧아야 해서 다 담을 수 없다.
  // 대신 /about 하단이 이들을 링크한다 — 문단이 유일한 네비게이션이라
  // 아무 데서도 안 걸면 그 페이지는 사이트에서 사라진다(글 31편이 그랬다).
  unlisted?: boolean;
}

export const NAV_ENTRIES: NavEntry[] = [
  {
    id: "writing",
    path: "/writing",
    label: { ko: "글", en: "Writing" },
    preview: {
      ko: {
        title: "Cosmic Entropy · 150 subscribers",
        body: "• 주로 솔직한 회고와 짧은 글을 번역합니다\n• 평균 오픈율은 약 42.3%입니다",
      },
      en: {
        title: "Cosmic Entropy · 150 subscribers",
        body: "• Mostly candid retrospectives, plus translations of short pieces\n• ~42.3% average open rate",
      },
    },
    icon: "/images/entries/writing.png",
    externalUrl: "https://williamjung0130.substack.com/",
  },
  {
    id: "books",
    path: "/books",
    label: { ko: "책", en: "Books" },
    preview: {
      // 문구는 stripe.press의 og:title/og:description 그대로다 — 옮기지 않는다.
      ko: {
        title: "Stripe Press — Ideas for progress",
        body: "Stripe Press produces works about technological, economic, and scientific advancement.",
      },
      en: {
        title: "Stripe Press — Ideas for progress",
        body: "Stripe Press produces works about technological, economic, and scientific advancement.",
      },
    },
    icon: "/images/entries/books.png",
    previewImage: "/images/entries/books-photo.png",
    externalUrl: "https://stripe.press",
  },
  {
    id: "bookclub",
    path: "/bookclub",
    label: { ko: "북클럽", en: "Book club" },
    preview: {
      ko: {
        title: "한국에서 가장 캐주얼한 원서 북클럽",
        body: '"관심분야가 비슷한 사람들끼리 퇴근하고 모여서 피자랑 술 마시면서 떠드는 책 이야기가 생각보다 재밌다. 그리고 이걸 더 재미있게 만들어가고 싶다. 여담으로, 클럽에 계신 승환님은 인천에서 매번 버번을 챙겨오시는데 격주마다 하는 모임이 정말 기다려지는 이유 중 하나다." - 글 중',
      },
      en: {
        title: "Book club",
        body: "Reading carefully chosen English titles, together.",
      },
    },
    icon: "/images/entries/bookclub.png",
    externalUrl: "https://disquiet.io/articles/dYs307",
    previewImage: "/images/entries/bookclub-photo.jpg",
  },
  {
    id: "disquiet",
    path: "/disquiet",
    label: { ko: "디스콰이엇", en: "Disquiet" },
    preview: {
      ko: {
        title: "디스콰이엇 · Ops",
        body: "• 130K MAU with 40% M1 retention\n• 100+ team 이상 참여한 Product Maker's Club 운영\n• B2B 광고 운영(아산나눔재단, Altos Ventures 등)",
      },
      en: {
        title: "Disquiet · Ops",
        body: "• 130K MAU with 40% M1 retention\n• Ran a Product Maker's Club with 100+ teams\n• Led B2B ad partnerships (Asan Nanum Foundation, Altos Ventures, etc.)",
      },
    },
    icon: "/images/entries/disquiet.png",
    previewImage: "/images/entries/disquiet-photo.jpg",
    externalUrl: "https://disquiet.io",
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
    unlisted: true,
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

현재는 26년 7월에 전역한 뒤, Agent-first Notion, Octave를 만들고 있습니다.

이전에는 [디스콰이엇](disquiet) (acquired by [Relate](https://www.relate.kr/) YC22)의 오퍼레이터였습니다. 디스콰이엇은 한국의 스타트업 커뮤니티입니다. 창업가와 현직자들이 제품과 본인들의 시행착오를 build in public할 수 있는 공간으로, 저는 그들의 스토리를 발굴하고 컨텐츠화하는 일을 했습니다. 이를 바탕으로 MAU 130,000, M1 Retention 40%의 성과를 만들었습니다. 나아가 B2B 광고 비즈니스를 맡아 매출에 기여하기도 했습니다.

하지만 아쉽게도 입영 통지서를 받으면서 팀을 나와야했습니다.

디스콰이엇은 제게 정말 뜻깊은 팀이었습니다. 메이커들에게 도움이 되고 싶은 마음에 시작했지만, 오히려 수많은 도움을 받았습니다. 이때의 경험은 [지금의 제가 생각하고 행동하는 방식에 많은 영향](https://williamjung0130.substack.com/p/2024)을 줬습니다.

이외에도 AI가 사람의 작업을 관찰하고 해당 작업을 python, appplescript 등으로 리버스 엔지니어링하는 [flowcap](https://github.com/minkyojung/flowcap), AI memory assistant인 [Momo](https://github.com/momo-personal-assistant/momo-research)의 초기버전을 함께 만들기도 했습니다.

[라지피자 북클럽](bookclub)이라는 모임을 운영했습니다. 한국에는 아직 번역되지 않은 원서를 찾아 함께 읽고, 네트워킹하는 모임입니다. 관심분야가 비슷한 사람들끼리 퇴근하고 모여서 피자랑 술 마시면서 떠드는 책 이야기가 생각보다 재밌었습니다. 이때 저에게 좋은 자극을 주신 인디 창업가, VC 분들을 여전히 잊지 못합니다.

이제부터는 크게 두 가지 일을 하려 합니다.

1. [좋은 책](books)과 글을 찾아 번역하고 알리는 일
2. Agent와 사람이 함께 협업할 수 있는 AI Native Notion을 만드는 일.

10년 뒤 도달하고 싶은 어떠한 목표 지점은 없습니다. 오히려 10년 후에도 호기심을 잃지 않고 제품을 만들고 [글을 쓰는 행위를 반복할 수 있는 상태](https://williamjung0130.substack.com/p/be-sincerenot-serious)이길 바랄 뿐입니다. 그게 더 어려운 일이라는 생각도 드네요.

마지막으로, 4년째 뉴스레터를 쓰고 있습니다. 주로 좋은 글을 번역하거나 개인적인 회고 글을 올립니다. [구독하기](writing).`,

  en: `Hi, I'm Minkyo Jung.

I love to [write](writing), and I love [books](books).

I ran a [book club](bookclub) around carefully chosen English titles,
then joined [Disquiet](disquiet), Korea's largest startup community,
where I helped grow MAU from 15K to 130K in a year.

Discharged this July, I'm building Octave, an Agent-First Document Editor.`,
};
