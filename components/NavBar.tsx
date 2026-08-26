import Link from "next/link";
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
      {/* 언어 전환 버튼은 당분간 숨긴다 — 한글로만 노출한다. */}
    </nav>
  );
}
