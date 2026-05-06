import { aboutContent } from "@/lib/about-content";
import { SmartLink } from "@/components/ui/link";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-fg-subtle text-xs font-medium tracking-[0.08em] uppercase mb-3">
      {children}
    </h3>
  );
}

export function AboutSection() {
  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <SectionLabel>About</SectionLabel>
        {aboutContent.intro.map((paragraph, i) => (
          <p
            key={i}
            className="text-fg text-[15px] leading-[1.7]"
          >
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
              className="flex items-baseline gap-4 text-[14px]"
            >
              <span className="text-fg-subtle tabular-nums w-24 shrink-0">
                {item.period}
              </span>
              <span className="text-fg">{item.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>Selected work</SectionLabel>
        <ul className="flex flex-col gap-3">
          {aboutContent.selectedWork.map((item) => (
            <li key={item.name} className="text-[14px]">
              <SmartLink
                href={item.url}
                className="text-fg font-medium underline underline-offset-2 hover:opacity-60 transition-opacity"
              >
                {item.name}
              </SmartLink>
              <span className="text-fg-muted"> — {item.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>Stack</SectionLabel>
        <p className="text-fg text-[14px] leading-[1.7]">
          {aboutContent.stack.join(" · ")}
        </p>
      </div>

      <div>
        <SectionLabel>Currently exploring</SectionLabel>
        <p className="text-fg text-[14px] leading-[1.7]">
          {aboutContent.exploring.join(" · ")}
        </p>
      </div>
    </section>
  );
}
