"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  hasLocaleVariant,
  localePath,
  stripLocale,
  type Locale,
} from "@/lib/i18n";
import { getStrings } from "@/lib/ui-strings";

// 언어 토글. 보고 있던 화면을 유지한 채 언어만 바꾼다 — 그래서 현재 경로를 알아야
// 하고(usePathname), 이 컴포넌트만 클라이언트다.
//
// 대응 화면이 없는 경로(글·섹션)에서는 그 로케일의 홈으로 보낸다. 그대로 언어만
// 바꾸면 존재하지 않는 /en/posts/... 로 보내 404가 난다.
export function LocaleToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "/";
  const other: Locale = locale === "ko" ? "en" : "ko";
  const base = stripLocale(pathname);
  const href = localePath(other, hasLocaleVariant(base) ? base : "/");

  return (
    <Link
      href={href}
      hrefLang={other}
      className="text-fg-subtle text-[13px] font-medium tracking-[0.02em] tabular-nums no-underline transition-opacity duration-300 hover:opacity-60"
    >
      {getStrings(locale).nav.switchTo}
    </Link>
  );
}
