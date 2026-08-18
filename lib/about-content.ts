import type { Locale } from "./i18n";

// /about의 내용. 구조가 있는 데이터라 마크다운(content/pages)이 아니라 여기 있다 —
// 같은 값이 JSON-LD(personSchema)와 llms.txt로도 나가므로 문장이 아니라 필드여야 한다.
//
// 언어별로 다른 값은 Record<Locale, …>로 둔다. 기간·기술 이름처럼 번역할 것이 없는
// 값은 그대로 둔다 — 두 벌로 만들면 한쪽만 고치는 일이 반드시 생긴다.
export const aboutContent = {
  // 프로필 사진 아래 한 줄. 디스콰이엇 이야기 전체는 /disquiet에 있다.
  tagline: {
    ko: "글과 SaaS를 정말 좋아합니다.",
    en: "I really love writing and SaaS.",
  },

  intro: {
    ko: [
      "운영과 엔지니어링 사이에서 일합니다. 한국에서 가장 큰 스타트업 커뮤니티 디스콰이엇에서 운영을 맡아 12개월 동안 회원을 15,000명에서 100,000명까지 늘렸고, 이후 사회복무요원으로 복무하며 혼자 제품을 만들어 왔습니다.",
    ],
    en: [
      "I work between operations and engineering. After leading operations at Disquiet — Korea's largest startup community, growing from 15,000 to 100,000 members in twelve months — I've been building independent projects during my alternative civilian service.",
    ],
  },

  background: [
    {
      period: "2024–2026",
      role: {
        ko: "사회복무요원",
        en: "Alternative civilian service",
      },
    },
    {
      period: "2023–2024",
      role: {
        ko: "운영 · 디스콰이엇 (15K → 100K 회원)",
        en: "Operations · Disquiet (15K → 100K members)",
      },
    },
    {
      period: "2021–2023",
      role: {
        ko: "경영학 학사 · 몬드라곤 대학교",
        en: "BBA · Mondragon University",
      },
    },
  ],

  selectedWork: [
    {
      name: "flowcap",
      url: "https://github.com/minkyojung/flowcap",
      description: {
        ko: "AI가 사람의 작업과정을 지켜보며, 에이전트가 이해할 수 있는 형태로 도구화합니다.",
        en: "AI watches how a person works and turns it into something an agent can understand and use.",
      },
    },
  ],

  // 기술 이름은 번역하지 않는다.
  stack: ["TypeScript", "Swift", "React", "Next.js"],

  exploring: {
    ko: ["Local AI", "AI Clone"],
    en: ["Local AI", "AI Clone"],
  },
} as const;

// 구조화 데이터(JSON-LD)와 llms.txt가 쓰는 판. 기계가 읽는 문서라 영어로 고정한다.
export const MACHINE_LOCALE: Locale = "en";
