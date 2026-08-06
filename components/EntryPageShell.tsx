import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PostBody } from "@/components/PostBody";
import type { NavEntry } from "@/lib/nav-entries";
import type { PageContent } from "@/lib/pages";
import { localePath, type Locale } from "@/lib/i18n";
import { getStrings } from "@/lib/ui-strings";

// 상세 페이지가 공유하는 껍데기(제목 + 본문 + 돌아가기).
//
// 본문은 content/pages의 마크다운이 그대로 들어온다 — 글 본문과 같은 타이포그래피를
// 쓰므로 `prose` 하나만 붙인다(tailwind.config.ts의 typography가 단일 출처).
// page가 목록처럼 마크다운으로 표현할 수 없는 것이면 children으로 대신 넣는다.
export function EntryPageShell({
  entry,
  locale,
  page,
  children,
}: {
  entry: NavEntry;
  locale: Locale;
  page?: PageContent | null;
  children?: React.ReactNode;
}) {
  const t = getStrings(locale);

  return (
    <main className="min-h-screen bg-bg pt-32 pb-24">
      <Container>
        <h1 className="font-serif text-fg text-3xl font-bold tracking-tight">
          {entry.label[locale]}
        </h1>

        {page ? (
          <div className="prose w-full max-w-content mt-8">
            <PostBody content={page.content} imageMeta={page.imageMeta} />
          </div>
        ) : children ? (
          <div className="mt-8">{children}</div>
        ) : (
          <p className="mt-6 text-fg-muted text-[15px] font-normal leading-[1.7]">
            {t.comingSoon}
          </p>
        )}

        <Link
          href={localePath(locale, "/")}
          className="mt-16 inline-block text-fg-subtle text-[13px] font-medium transition-opacity hover:opacity-60"
        >
          {t.nav.backHome}
        </Link>
      </Container>
    </main>
  );
}
