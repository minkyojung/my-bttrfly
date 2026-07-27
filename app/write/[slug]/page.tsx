import { notFound } from "next/navigation";
import { getPostBySlugForEdit, getPostFileShaForEdit } from "@/lib/markdown";
import { PostForm } from "@/components/write/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlugForEdit(slug);
  if (!post) notFound();

  return (
    <PostForm
      mode="edit"
      slug={slug}
      baseSha={getPostFileShaForEdit(slug) ?? undefined}
      // 이미 계산돼 있는 값이라 프리뷰에 그대로 넘긴다. 없어도 표시는 정상이고,
      // 있으면 로딩 중 화면이 밀리지 않는다.
      imageMeta={post.imageMeta}
      initialValues={{
        title: post.title,
        date: post.date,
        category: post.category,
        summary: post.summary,
        cover: post.cover,
        external: post.external,
        canonical: post.canonical,
        featured: post.featured,
        draft: post.draft,
        source: post.source,
        content: post.content,
      }}
    />
  );
}
