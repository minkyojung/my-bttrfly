import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getAllPosts, getPostBySlug } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { PostBody } from "@/components/PostBody";
import { PageHeader } from "@/components/ui/page-header";
import { Kicker } from "@/components/front-page/Kicker";
import { ColumnSection } from "@/components/front-page/ColumnSection";
import { JsonLd } from "@/components/JsonLd";
import { blogPostingSchema, postUrl } from "@/lib/site-config";
import type { Metadata } from "next";

// 본문 타이포그래피는 tailwind.config.ts의 typography에 있다(에디터·미리보기와
// 공유). 여기서는 이 페이지에서만 다른 '폭'만 지정한다.
const postProseClass = "prose w-full max-w-content";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // 외부 발행 글: 목록에서는 원문으로 직접 링크되지만, 옛 링크/검색 유입은
  // 이 경로로 들어오므로 원문으로 리다이렉트한다.
  if (post.external) redirect(post.external);

  const morePosts = post.category
    ? (await getAllPosts())
        .filter((p) => p.category === post.category && p.slug !== post.slug)
        .slice(0, 3)
    : [];

  return (
    <main className="min-h-screen bg-bg">
      <JsonLd
        data={blogPostingSchema({
          title: post.title,
          slug: post.slug,
          date: post.date,
          description: post.summary ?? post.preview,
          image: post.cover,
        })}
      />
      {post.cover && (
        <div className="p-[10px]">
          <div
            className="relative w-full overflow-hidden rounded-lg"
            style={{
              maxHeight: "70vh",
              aspectRatio: post.coverMeta
                ? `${post.coverMeta.width} / ${post.coverMeta.height}`
                : "16 / 9",
            }}
          >
            <Image
              src={post.cover}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              {...(post.coverMeta ? {} : { unoptimized: true })}
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          "max-w-3xl mx-auto px-6 py-12",
          post.cover ? "pt-12" : "pt-16"
        )}
      >
        <article className="flex flex-col items-center">
          <PageHeader
            title={post.title}
            eyebrow={<Kicker category={post.category} date={post.date} />}
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
            group={{
              value: post.category!,
              label: `More in ${post.category}`,
              posts: morePosts,
            }}
          />
        </div>
      )}
    </main>
  );
}
