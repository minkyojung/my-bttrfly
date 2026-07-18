import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getAllPosts, getPostBySlug } from "@/lib/markdown";
import { cn, formatDate } from "@/lib/utils";
import { PostBody } from "@/components/PostBody";
import { PageHeader } from "@/components/ui/page-header";
import { JsonLd } from "@/components/JsonLd";
import { blogPostingSchema, postUrl } from "@/lib/site-config";
import type { Metadata } from "next";

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
  const canonical = post.external ?? postUrl(post.slug);

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
            meta={<time dateTime={post.date}>{formatDate(post.date)}</time>}
          />

          <div
            className="prose prose-serif w-full max-w-content text-[18px] leading-[1.7] font-medium
              prose-headings:font-black
              prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-10
              prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
              prose-p:mb-2
              prose-blockquote:border-l-2 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-2
              prose-ul:mb-2 prose-ul:list-disc prose-ul:pl-5
              prose-ol:mb-2 prose-ol:list-decimal prose-ol:pl-5
              prose-li:mb-1
              prose-hr:my-8
              prose-code:px-1 prose-code:rounded-sm prose-code:text-sm
              prose-pre:rounded-md prose-pre:p-4 prose-pre:mb-4
              prose-a:underline hover:prose-a:opacity-60"
          >
            <PostBody content={post.content} imageMeta={post.imageMeta} />
          </div>
        </article>
      </div>
    </main>
  );
}
