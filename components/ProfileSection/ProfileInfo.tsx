import { siteConfig } from "@/lib/site-config";
import { aboutContent } from "@/lib/about-content";
import type { Locale } from "@/lib/i18n";

// 이름·주소는 siteConfig가 단일 출처다. 예전에는 여기에 손으로 또 적혀 있어서,
// 한쪽만 고치면 조용히 갈라졌다.
// 원형 아이콘 버튼이라 라벨이 없다 — title/aria-label로 대신 알려준다.
const CIRCLE =
  "inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface text-fg-muted no-underline transition-all duration-200 hover:bg-surface-elevated hover:text-fg";

export function ProfileInfo({ locale }: { locale: Locale }) {
  return (
    <div className="w-full pb-3 -mt-1 max-[640px]:py-4">
      <div className="flex items-baseline justify-between gap-2 mb-2.5">
        <h1 className="flex items-baseline gap-2 text-2xl font-bold text-fg max-[640px]:text-xl">
          {siteConfig.displayName[locale]}
          <span className="text-[0.8125rem] font-normal text-fg-muted max-[640px]:text-[0.75rem]">
            Ops · Dev
          </span>
        </h1>
        <div className="flex gap-1.5">
          <a
            href="https://williamjung0130.substack.com/?utm_campaign=profile_chips"
            target="_blank"
            rel="me noopener noreferrer"
            title="williamjung0130"
            aria-label="williamjung0130"
            className={CIRCLE}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
            </svg>
          </a>
          <a
            href={siteConfig.social.github.url}
            target="_blank"
            rel="me noopener noreferrer"
            title={siteConfig.social.github.handle}
            aria-label={siteConfig.social.github.handle}
            className={CIRCLE}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            rel="me"
            title="Email"
            aria-label="Email"
            className={CIRCLE}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </a>
        </div>
      </div>
      <p className="text-[0.9375rem] font-normal text-fg-muted leading-[1.6] max-[640px]:text-[0.8125rem]">
        {aboutContent.tagline[locale]}
      </p>
    </div>
  );
}
