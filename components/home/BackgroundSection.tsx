import { aboutContent } from "@/lib/about-content";
import { Section, SECTION_TEXT } from "@/components/ui/section";
import { getStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

// 이력. 기간은 tabular-nums로 폭을 고정해 왼쪽 열이 흔들리지 않게 한다.
export function BackgroundSection({ locale }: { locale: Locale }) {
  const t = getStrings(locale).about;

  return (
    <Section label={t.background}>
      <ul className="flex flex-col gap-2">
        {aboutContent.background.map((item) => (
          <li
            key={item.period}
            className={`flex items-baseline gap-4 ${SECTION_TEXT}`}
          >
            <span className="tabular-nums w-24 shrink-0">{item.period}</span>
            <span>{item.role[locale]}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
