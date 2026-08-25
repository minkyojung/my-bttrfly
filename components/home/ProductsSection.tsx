import { aboutContent } from "@/lib/about-content";
import { SmartLink } from "@/components/ui/link";
import { Section, SECTION_TEXT } from "@/components/ui/section";
import { getStrings } from "@/lib/ui-strings";
import { TECH_LOGOS } from "@/lib/tech-logos";
import type { Locale } from "@/lib/i18n";

// MIT 등 라이선스는 브랜드 로고가 없어 simple-icons에서 가져올 수 없다 —
// 대신 범용 태그 아이콘(Lucide "tag")을 쓴다.
function LicenseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2.41 12.41A2 2 0 0 1 2 11V4a2 2 0 0 1 2-2h7a2 2 0 0 1 1.41.59l8.18 8.18a2 2 0 0 1 0 2.83Z" />
      <circle cx="7" cy="7" r="1" />
    </svg>
  );
}

// 만든 제품. 글 목록(StoryCard)과 나란히 놓이므로 같은 리듬 —
// 이름 한 줄(serif), 설명 한 줄, 항목 사이 hairline.
export function ProductsSection({
  locale,
  compact,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const t = getStrings(locale).about;

  return (
    <Section label={t.selectedWork} compact={compact}>
      <ul className="flex flex-col">
        {aboutContent.selectedWork.map((item) => (
          <li
            key={item.name}
            className={`first:pt-0 border-b border-border last:border-b-0 ${
              compact ? "py-1.5" : "py-4"
            }`}
          >
            {/* -mx/-my로 li의 padding 영역까지 배경이 덮게 하고, 그만큼
                px/py를 더해 텍스트 위치는 그대로 유지한다. */}
            <SmartLink
              href={item.url}
              className="group -mx-2 -my-0.5 block rounded-lg px-2 py-0.5 no-underline transition-colors duration-150 hover:bg-surface-elevated"
            >
              <div className="flex items-center gap-2">
                <h3
                  className={`font-serif text-fg font-bold leading-snug transition-colors duration-200 group-hover:text-accent-warm ${
                    compact ? "text-[15px]" : "text-lg"
                  }`}
                >
                  {item.name}
                  <span className="text-fg-subtle text-sm align-super ml-1">↗</span>
                </h3>
                <div className="flex items-center gap-2 ml-auto">
                  {item.language && (
                    <span className="inline-flex items-center gap-1 text-fg-muted text-xs font-normal leading-none">
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        fill="currentColor"
                        aria-hidden
                        className="shrink-0"
                      >
                        <path d={TECH_LOGOS[item.language]} />
                      </svg>
                      {item.language}
                    </span>
                  )}
                  {item.license && (
                    <span className="inline-flex items-center gap-1 text-fg-muted text-xs font-normal leading-none">
                      <LicenseIcon />
                      {item.license}
                    </span>
                  )}
                </div>
              </div>
              <p
                className={`${SECTION_TEXT} mt-1 ${
                  compact ? "text-[13px] leading-[1.4]" : ""
                }`}
              >
                {item.description[locale]}
              </p>
            </SmartLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
