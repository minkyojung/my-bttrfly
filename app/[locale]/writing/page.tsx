import type { Metadata } from "next";
import { EntryPageShell } from "@/components/EntryPageShell";
import { ColumnSection } from "@/components/post/ColumnSection";
import { getEntry } from "@/lib/nav-entries";
import { entryMetadata } from "@/lib/site-config";
import { getPageContent } from "@/lib/pages";
import { getAllPosts } from "@/lib/markdown";
import { groupBySection } from "@/lib/columns";
import { PostBody } from "@/components/PostBody";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";

const ENTRY = getEntry("writing");

// 한 섹션에 싣는 편수. 넘치는 만큼은 ColumnSection이 /columns/<slug> 링크로 넘긴다.
const PER_SECTION = 6;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  return entryMetadata(ENTRY, isLocale(raw) ? raw : DEFAULT_LOCALE);
}

// 글 목록. 다른 상세 페이지와 달리 본문이 아니라 목록이라 children으로 넣는다.
//
// 이 페이지가 없으면 글 31편은 사이트 어디에서도 링크되지 않는다 — 1면을 걷어낸
// 뒤로 /posts와 /columns로 들어가는 입구가 여기뿐이다.
// (test/published-posts.test.mts에 적힌 사고가 그 상태였다.)
export default async function WritingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const intro = await getPageContent(ENTRY.id, locale);
  const groups = groupBySection(await getAllPosts(), PER_SECTION);

  return (
    <EntryPageShell entry={ENTRY} locale={locale}>
      {intro && (
        <div className="prose w-full max-w-content mb-16">
          <PostBody content={intro.content} imageMeta={intro.imageMeta} />
        </div>
      )}

      {groups.map((group) => (
        <ColumnSection key={group.value} group={group} locale={locale} />
      ))}
    </EntryPageShell>
  );
}
