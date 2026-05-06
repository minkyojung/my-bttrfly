import { aboutContent } from "@/lib/about-content";
import { SmartLink } from "@/components/ui/link";

const TEXT_CLASS = "text-fg-muted text-[15px] font-normal leading-[1.6]";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-fg-subtle text-xs font-medium tracking-[0.08em] uppercase mb-3">
      {children}
    </h2>
  );
}

export function AboutSection() {
  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <SectionLabel>About</SectionLabel>
        {aboutContent.intro.map((paragraph, i) => (
          <p key={i} className={TEXT_CLASS}>
            {paragraph}
          </p>
        ))}
      </div>

      <div>
        <SectionLabel>Background</SectionLabel>
        <ul className="flex flex-col gap-2">
          {aboutContent.background.map((item) => (
            <li
              key={item.period}
              className={`flex items-baseline gap-4 ${TEXT_CLASS}`}
            >
              <span className="tabular-nums w-24 shrink-0">{item.period}</span>
              <span>{item.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>Selected work</SectionLabel>
        <ul className="flex flex-col gap-3">
          {aboutContent.selectedWork.map((item) => (
            <li key={item.name} className={TEXT_CLASS}>
              <SmartLink
                href={item.url}
                className="font-normal underline underline-offset-2 hover:opacity-60 transition-opacity"
              >
                {item.name}
              </SmartLink>
              <span> — {item.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>Stack</SectionLabel>
        <p className={TEXT_CLASS}>{aboutContent.stack.join(" · ")}</p>
      </div>

      <div>
        <SectionLabel>Currently exploring</SectionLabel>
        <p className={TEXT_CLASS}>{aboutContent.exploring.join(" · ")}</p>
      </div>
    </section>
  );
}
