import { notFound } from "next/navigation";
import { getPostBySlugForEdit } from "@/lib/markdown";
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
