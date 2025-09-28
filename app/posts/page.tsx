import { redirect } from 'next/navigation';

export default async function PostsIndex() {
  // 글 목록 페이지는 홈페이지로 리다이렉트 (모든 글이 홈에서 피드로 표시됨)
  redirect('/');
}