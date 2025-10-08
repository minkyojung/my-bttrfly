import { getAllPosts, getPinnedPosts } from "@/lib/markdown";
import { MainPage } from "@/components/MainPage";

export default async function Home() {
  const [posts, pinnedPosts] = await Promise.all([
    getAllPosts(),
    getPinnedPosts()
  ]);

  return <MainPage posts={posts} pinnedPosts={pinnedPosts} />;
}
