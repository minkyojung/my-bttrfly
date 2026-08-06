import Link from "next/link";
import { LocaleToggle } from "@/components/LocaleToggle";
import { localePath, type Locale } from "@/lib/i18n";
import { getStrings } from "@/lib/ui-strings";

export function NavBar({ locale }: { locale: Locale }) {
  const t = getStrings(locale);

  return (
    <nav className="fixed inset-x-0 top-0 z-nav flex items-center justify-between px-7 py-4">
      <Link
        href={localePath(locale, "/")}
        className="text-fg text-[13px] font-medium tracking-[0.02em] no-underline transition-opacity duration-300 hover:opacity-60"
      >
        MJ
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href={localePath(locale, "/about")}
          className="text-fg-muted text-[13px] font-medium tracking-[0.02em] no-underline transition-opacity duration-300 hover:opacity-60"
        >
          {t.nav.about}
        </Link>
        <LocaleToggle locale={locale} />
      </div>
    </nav>
  );
}
