import { aboutContent } from "@/lib/about-content";
import { SmartLink } from "@/components/ui/link";
import { Section, SECTION_TEXT } from "@/components/ui/section";
import { getStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

// 만든 제품. 글 목록(StoryCard)과 나란히 놓이므로 같은 리듬 —
// 이름 한 줄(serif), 설명 한 줄, 항목 사이 hairline.
export function ProductsSection({ locale }: { locale: Locale }) {
  const t = getStrings(locale).about;

  return (
    <Section label={t.selectedWork}>
      <ul className="flex flex-col">
        {aboutContent.selectedWork.map((item) => (
          <li
            key={item.name}
            className="py-4 first:pt-0 border-b border-border last:border-b-0"
          >
            <SmartLink
              href={item.url}
              className="group block no-underline"
            >
              <h3 className="font-serif text-fg text-lg font-bold leading-snug transition-colors duration-200 group-hover:text-accent-warm">
                {item.name}
                <span className="text-fg-subtle text-sm align-super ml-1">↗</span>
              </h3>
              <p className={`${SECTION_TEXT} mt-1`}>{item.description[locale]}</p>
            </SmartLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
