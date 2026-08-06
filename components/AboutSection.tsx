import Link from "next/link";
import { aboutContent } from "@/lib/about-content";
import { SmartLink } from "@/components/ui/link";
import { getStrings } from "@/lib/ui-strings";
import { NAV_ENTRIES } from "@/lib/nav-entries";
import { localePath, type Locale } from "@/lib/i18n";

const TEXT_CLASS = "text-fg-muted text-[15px] font-normal leading-[1.6]";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-fg-subtle text-xs font-medium tracking-[0.08em] uppercase mb-3">
      {children}
    </h2>
  );
}

const unlisted = NAV_ENTRIES.filter((entry) => entry.unlisted);

export function AboutSection({ locale }: { locale: Locale }) {
  const t = getStrings(locale).about;

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <SectionLabel>{t.heading}</SectionLabel>
        {aboutContent.intro[locale].map((paragraph, i) => (
          <p key={i} className={TEXT_CLASS}>
            {paragraph}
          </p>
        ))}
      </div>

      <div>
        <SectionLabel>{t.background}</SectionLabel>
        <ul className="flex flex-col gap-2">
          {aboutContent.background.map((item) => (
            <li
              key={item.period}
              className={`flex items-baseline gap-4 ${TEXT_CLASS}`}
            >
              <span className="tabular-nums w-24 shrink-0">{item.period}</span>
              <span>{item.role[locale]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>{t.selectedWork}</SectionLabel>
        <ul className="flex flex-col gap-3">
          {aboutContent.selectedWork.map((item) => (
            <li key={item.name} className={TEXT_CLASS}>
              <SmartLink
                href={item.url}
                className="font-normal underline underline-offset-2 hover:opacity-60 transition-opacity"
              >
                {item.name}
              </SmartLink>
              <span> — {item.description[locale]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>{t.stack}</SectionLabel>
        <p className={TEXT_CLASS}>{aboutContent.stack.join(" · ")}</p>
      </div>

      <div>
        <SectionLabel>{t.exploring}</SectionLabel>
        <p className={TEXT_CLASS}>
          {aboutContent.exploring[locale].join(" · ")}
        </p>
      </div>

      {/* 홈 문단에 싣지 않은 페이지들. 문단은 짧아야 해서 다 담을 수 없지만,
          문단이 유일한 네비게이션이라 아무 데서도 안 걸면 그 페이지는 사이트에서
          사라진다. 목록을 손으로 적지 않고 unlisted에서 끌어오므로 갈라지지 않는다. */}
      {unlisted.length > 0 && (
        <div>
          <SectionLabel>{t.more}</SectionLabel>
          <ul className="flex flex-col gap-3">
            {unlisted.map((entry) => (
              <li key={entry.id} className={TEXT_CLASS}>
                <Link
                  href={localePath(locale, entry.path)}
                  className="font-normal underline underline-offset-2 hover:opacity-60 transition-opacity"
                >
                  {entry.label[locale]}
                </Link>
                <span> — {entry.preview[locale].body}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
