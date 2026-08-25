import Link from "next/link";
import { LocaleToggle } from "@/components/LocaleToggle";
import { FontToggle } from "@/components/FontToggle";
import { localePath, type Locale } from "@/lib/i18n";

export function NavBar({ locale }: { locale: Locale }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-nav flex items-center justify-between px-7 py-4">
      <Link
        href={localePath(locale, "/")}
        className="text-fg text-[13px] font-medium tracking-[0.02em] no-underline transition-opacity duration-300 hover:opacity-60"
      >
        MJ
      </Link>
      {/* '소개' 링크는 없다 — 홈이 곧 소개다. */}
      <div className="flex items-center gap-4">
        {/* Pretendard 테스트가 끝나면 지운다. */}
        <FontToggle />
        <LocaleToggle locale={locale} />
      </div>
    </nav>
  );
}
