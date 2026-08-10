import Link from "next/link";
import { NAV_ENTRIES } from "@/lib/nav-entries";
import { Section, SECTION_TEXT } from "@/components/ui/section";
import { getStrings } from "@/lib/ui-strings";
import { localePath, type Locale } from "@/lib/i18n";

// 소개 문단에 싣지 않은 페이지들. 문단은 짧아야 해서 다 담을 수 없지만,
// 문단과 이 목록이 유일한 네비게이션이라 아무 데서도 안 걸면 그 페이지는
// 사이트에서 사라진다. 목록을 손으로 적지 않고 unlisted에서 끌어오므로
// 항목을 추가해도 갈라지지 않는다.
const unlisted = NAV_ENTRIES.filter((entry) => entry.unlisted);

export function MoreLinks({ locale }: { locale: Locale }) {
  if (unlisted.length === 0) return null;

  const t = getStrings(locale).about;

  return (
    <Section label={t.more}>
      <ul className="flex flex-col gap-3">
        {unlisted.map((entry) => (
          <li key={entry.id} className={SECTION_TEXT}>
            <Link
              href={localePath(locale, entry.path)}
              className="font-normal underline underline-offset-2 transition-colors duration-200 hover:text-accent-warm"
            >
              {entry.label[locale]}
            </Link>
            <span> — {entry.preview[locale].body}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
