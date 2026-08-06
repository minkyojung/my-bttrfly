import type { Locale } from "./i18n";

// /about의 내용. 구조가 있는 데이터라 마크다운(content/pages)이 아니라 여기 있다 —
// 같은 값이 JSON-LD(personSchema)와 llms.txt로도 나가므로 문장이 아니라 필드여야 한다.
//
// 언어별로 다른 값은 Record<Locale, …>로 둔다. 기간·기술 이름처럼 번역할 것이 없는
// 값은 그대로 둔다 — 두 벌로 만들면 한쪽만 고치는 일이 반드시 생긴다.
export const aboutContent = {
  // 프로필 사진 아래 한 줄. 디스콰이엇 이야기 전체는 /disquiet에 있다.
  tagline: {
    ko: "운영 × 엔지니어 · 디스콰이엇 운영 (15K → 100K)",
    en: "Operator × Engineer · Previously Operations at Disquiet (15K → 100K)",
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
        ko: "사회복무요원 · 개인 제품 개발",
        en: "Alternative civilian service · independent building",
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
        ko: "작업 과정을 기록해 AI가 문서로 만들어주는 오픈소스 macOS 메뉴바 앱.",
        en: "Open-source macOS menu-bar app that records workflows and turns them into AI-generated documentation.",
      },
    },
    {
      name: "Momo memory engine",
      url: "https://usemomo.com",
      description: {
        ko: "AI 메모리 시스템의 초기 프로토타입.",
        en: "Early prototype of an AI memory system.",
      },
    },
  ],

  // 기술 이름은 번역하지 않는다.
  stack: [
    "TypeScript",
    "Swift",
    "Python",
    "React",
    "Next.js",
    "SwiftUI",
    "Cloudflare Workers",
    "Postgres / pgvector",
    "Claude / OpenAI / Gemini",
  ],

  exploring: {
    ko: ["로컬 AI", "AI 오케스트레이션", "AI 클론"],
    en: ["Local AI", "AI orchestration", "AI clones"],
  },
} as const;

// 구조화 데이터(JSON-LD)와 llms.txt가 쓰는 판. 기계가 읽는 문서라 영어로 고정한다.
export const MACHINE_LOCALE: Locale = "en";
