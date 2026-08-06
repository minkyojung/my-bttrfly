import { notFound, redirect } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/markdown";
import { PostBody } from "@/components/PostBody";
import { PageHeader } from "@/components/ui/page-header";
import { Kicker } from "@/components/post/Kicker";
import { ColumnSection } from "@/components/post/ColumnSection";
import { JsonLd } from "@/components/JsonLd";
import { blogPostingSchema, postUrl } from "@/lib/site-config";
import { getStrings } from "@/lib/ui-strings";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import type { Metadata } from "next";

// 본문 타이포그래피는 tailwind.config.ts의 typography에 있다.
// 여기서는 이 페이지에서만 다른 '폭'만 지정한다.
const postProseClass = "prose w-full max-w-content";

// 글은 사실상 한국어 콘텐츠라 기본 로케일에만 존재한다. locale까지 직접 돌려주고
// dynamicParams를 끄면 /en/posts/* 는 생성되지도, 요청 시 만들어지지도 않는다.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ locale: DEFAULT_LOCALE, slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };

  const description = post.summary ?? post.preview;
  const canonical = post.external ?? post.canonical ?? postUrl(post.slug);

  return {
    title: post.title,
    description,
    alternates: { canonical },
    robots: post.external ? { index: false, follow: true } : undefined,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.date,
      url: canonical,
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // 외부 발행 글: 목록에서는 원문으로 직접 링크되지만, 옛 링크/검색 유입은
  // 이 경로로 들어오므로 원문으로 리다이렉트한다.
  if (post.external) redirect(post.external);

  // 같은 섹션의 다른 글. 앞 3편만 싣고, 그보다 많으면 ColumnSection이 섹션 페이지로
  // 가는 링크를 띄운다(그래서 자른 편수도 함께 넘긴다).
  const siblings = post.category
    ? (await getAllPosts()).filter(
        (p) => p.category === post.category && p.slug !== post.slug
      )
    : [];
  const morePosts = siblings.slice(0, 3);

  return (
    <main className="min-h-screen bg-bg">
      <JsonLd
        data={blogPostingSchema({
          title: post.title,
          slug: post.slug,
          date: post.date,
          description: post.summary ?? post.preview,
        })}
      />

      <div className="max-w-3xl mx-auto px-6 py-12 pt-16">
        <article className="flex flex-col items-center">
          <PageHeader
            title={post.title}
            eyebrow={
              <Kicker
                category={post.category}
                date={post.date}
                locale={DEFAULT_LOCALE}
              />
            }
            dek={post.summary}
          />

          <div className={postProseClass}>
            <PostBody content={post.content} imageMeta={post.imageMeta} />
          </div>
        </article>
      </div>

      {morePosts.length > 0 && (
        <div className="max-w-wide mx-auto px-6 pb-20 mt-8">
          <ColumnSection
            locale={DEFAULT_LOCALE}
            group={{
              value: post.category!,
              label: getStrings(DEFAULT_LOCALE).post.moreIn(post.category!),
              posts: morePosts,
              total: siblings.length,
            }}
          />
        </div>
      )}
    </main>
  );
}
