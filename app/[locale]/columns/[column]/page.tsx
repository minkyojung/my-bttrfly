import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/markdown";
import { SECTIONS, sectionFromSlug } from "@/lib/columns";
import { StoryCard } from "@/components/post/StoryCard";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";
import { getStrings } from "@/lib/ui-strings";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// 섹션(칼럼) 목록 페이지. 1면은 칼럼마다 앞 몇 편만 싣기 때문에, 이 페이지가 없으면
// 나머지 글은 sitemap 말고는 아무 데서도 링크되지 않는다 — 실제로 발행글 31편 중
// 14편이 그 상태였다. 발행 사이트의 정보구조에서 섹션 랜딩 페이지가 맡는 역할이다.

// 슬러그를 섹션으로 푼다. SECTIONS 밖의 값이면(예전 카테고리 주소가 남아있어도)
// 404 — /writing이 이제 이 두 섹션으로만 링크한다.
function resolveColumn(slug: string) {
  const section = sectionFromSlug(slug);
  return section ? { categories: section.categories, label: section.label } : null;
}

// 섹션 목록도 글과 같이 기본 로케일에만 존재한다.
export const dynamicParams = false;

export async function generateStaticParams() {
  return SECTIONS.map((s) => ({
    locale: DEFAULT_LOCALE,
    column: s.key,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; column: string }>;
}): Promise<Metadata> {
  const { column } = await params;
  const resolved = resolveColumn(column);
  if (!resolved) return { title: "Not found" };

  return {
    title: resolved.label,
    description: `${resolved.label} — ${siteConfig.name}`,
    alternates: { canonical: `${siteConfig.url}/columns/${column}` },
    openGraph: {
      title: resolved.label,
      url: `/columns/${column}`,
    },
  };
}

export default async function ColumnPage({
  params,
}: {
  params: Promise<{ locale: string; column: string }>;
}) {
  const { column } = await params;
  const resolved = resolveColumn(column);
  if (!resolved) notFound();

  // getAllPosts()는 draft를 걸러 날짜 내림차순으로 준다.
  const posts = (await getAllPosts()).filter(
    (post) => post.category && (resolved.categories as readonly string[]).includes(post.category)
  );
  if (posts.length === 0) notFound();

  return (
    <main className="min-h-screen bg-bg pt-16 pb-24">
      <Container className="max-w-wide">
        <header className="flex items-baseline justify-between border-b border-border pb-2">
          <h1 className="text-fg text-[11px] font-semibold uppercase tracking-[0.12em]">
            {resolved.label}
          </h1>
          <span className="text-fg-subtle text-[11px] font-medium uppercase tracking-[0.12em]">
            {getStrings(DEFAULT_LOCALE).column.count(posts.length)}
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
          {posts.map((post) => (
            <StoryCard
              key={post.slug}
              post={post}
              locale={DEFAULT_LOCALE}
              variant="grid"
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
