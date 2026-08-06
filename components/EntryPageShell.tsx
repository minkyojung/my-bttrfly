import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { NavEntry } from "@/lib/nav-entries";
import { localePath, type Locale } from "@/lib/i18n";
import { getStrings } from "@/lib/ui-strings";

// 상세 페이지 5개가 공유하는 껍데기(제목 + 돌아가기). 본문은 페이지마다 다르므로
// children으로 받는다 — 글 목록, 책 목록, 케이스 스터디는 생김새가 서로 다르다.
export function EntryPageShell({
  entry,
  locale,
  children,
}: {
  entry: NavEntry;
  locale: Locale;
  children?: React.ReactNode;
}) {
  const t = getStrings(locale);

  return (
    <main className="min-h-screen bg-bg pt-32 pb-24">
      <Container>
        <h1 className="font-serif text-fg text-3xl font-bold tracking-tight">
          {entry.label[locale]}
        </h1>

        <div className="mt-6 text-fg-muted text-[15px] font-normal leading-[1.7]">
          {children ?? t.comingSoon}
        </div>

        <Link
          href={localePath(locale, "/")}
          className="mt-12 inline-block text-fg-subtle text-[13px] font-medium transition-opacity hover:opacity-60"
        >
          {t.nav.backHome}
        </Link>
      </Container>
    </main>
  );
}
