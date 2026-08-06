import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/markdown";
import { COLUMNS, columnSlug, columnFromSlug } from "@/lib/columns";
import { StoryCard } from "@/components/post/StoryCard";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";
import { getStrings } from "@/lib/ui-strings";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// 섹션(칼럼) 목록 페이지. 1면은 칼럼마다 앞 몇 편만 싣기 때문에, 이 페이지가 없으면
// 나머지 글은 sitemap 말고는 아무 데서도 링크되지 않는다 — 실제로 발행글 31편 중
// 14편이 그 상태였다. 발행 사이트의 정보구조에서 섹션 랜딩 페이지가 맡는 역할이다.

// 카테고리 값을 찾는다. COLUMNS에 있으면 그 label을, 없으면(손으로 커밋된 레거시
// 카테고리) 실제 글에서 쓰인 값을 그대로 쓴다. 어느 쪽도 아니면 404.
async function resolveColumn(slug: string) {
  const known = columnFromSlug(slug);
  if (known) return { value: known.value as string, label: known.label as string };

  const posts = await getAllPosts();
  const match = posts.find(
    (post) => post.category && columnSlug(post.category) === slug
  );
  return match?.category
    ? { value: match.category, label: match.category }
    : null;
}

// 섹션 목록도 글과 같이 기본 로케일에만 존재한다.
export const dynamicParams = false;

export async function generateStaticParams() {
  return COLUMNS.map((c) => ({
    locale: DEFAULT_LOCALE,
    column: columnSlug(c.value),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; column: string }>;
}): Promise<Metadata> {
  const { column } = await params;
  const resolved = await resolveColumn(column);
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
  const resolved = await resolveColumn(column);
  if (!resolved) notFound();

  // getAllPosts()는 draft를 걸러 날짜 내림차순으로 준다.
  const posts = (await getAllPosts()).filter(
    (post) => post.category === resolved.value
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
