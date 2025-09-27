import { redirect } from 'next/navigation';
import { getAllPosts } from "@/lib/markdown";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Post() {
  // 모든 개별 포스트 페이지는 홈페이지로 리다이렉트
  redirect('/');
}