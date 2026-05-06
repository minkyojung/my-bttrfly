export const aboutContent = {
  intro: [
    "I work between operations and engineering. After leading operations at Disquiet — Korea's largest startup community, growing from 15,000 to 100,000 members in twelve months — I've been building independent projects during my alternative civilian service.",
  ],
  background: [
    { period: "2024–2026", role: "Alternative civilian service · independent building" },
    { period: "2023–2024", role: "Operations · Disquiet (15K → 100K members)" },
    { period: "2021–2023", role: "BBA · Mondragon University" },
  ],
  selectedWork: [
    {
      name: "flowcap",
      url: "https://github.com/minkyojung/flowcap",
      description: "Open-source macOS menu-bar app that records workflows and turns them into AI-generated documentation.",
    },
    {
      name: "Momo memory engine",
      url: "https://usemomo.com",
      description: "Early prototype of an AI memory system.",
    },
  ],
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
  exploring: ["Local AI", "AI orchestration", "AI clones"],
} as const;
