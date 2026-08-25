import { aboutContent } from "@/lib/about-content";
import { TECH_LOGOS } from "@/lib/tech-logos";

// 잔디 바로 밑에 붙는 목록이라 촘촘하게 — 배경 없이 아이콘+이름만.
export function StackBadges() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-4">
      {aboutContent.stack.map((tech) => (
        <span
          key={tech}
          className="inline-flex items-center gap-1 text-fg-muted text-xs font-normal leading-none"
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="currentColor"
            aria-hidden
            className="shrink-0"
          >
            <path d={TECH_LOGOS[tech]} />
          </svg>
          {tech}
        </span>
      ))}
    </div>
  );
}
