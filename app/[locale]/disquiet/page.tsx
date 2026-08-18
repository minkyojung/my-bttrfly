import type { Metadata } from "next";
import { EntryPageShell } from "@/components/EntryPageShell";
import { ColumnSection } from "@/components/post/ColumnSection";
import { PostBody } from "@/components/PostBody";
import { getEntry } from "@/lib/nav-entries";
import { entryMetadata } from "@/lib/site-config";
import { getPageContent } from "@/lib/pages";
import { getAllPosts } from "@/lib/markdown";
import { groupBySection } from "@/lib/columns";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";

const ENTRY = getEntry("disquiet");

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

// 소개 문단만 있고 실제 인터뷰 글로 가는 링크가 없었다 — 홈은 이 문단으로
// 들어오는 게 전부라, 여기서도 안 걸면 인터뷰 4편은 사이트 어디서도 안 보인다.
// children으로 직접 채우는 이유는 /writing과 같다: page(마크다운 하나)와
// 목록(ColumnSection)을 EntryPageShell이 동시에 받을 방법이 없다.
export default async function DisquietPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const page = await getPageContent(ENTRY.id, locale);
  const work = groupBySection(await getAllPosts(), 10).find(
    (group) => group.value === "work"
  );

  return (
    <EntryPageShell entry={ENTRY} locale={locale}>
      {page && (
        <div className="prose w-full max-w-content mb-16">
          <PostBody content={page.content} imageMeta={page.imageMeta} />
        </div>
      )}

      {work && <ColumnSection group={work} locale={locale} />}
    </EntryPageShell>
  );
}
