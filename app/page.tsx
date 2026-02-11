import { getAllPosts, getPinnedPosts } from "@/lib/markdown";
import { getGalleryPhotos } from "@/lib/gallery";
import { MainPage } from "@/components/MainPage";

export default async function Home() {
  const [posts, pinnedPosts, photos] = await Promise.all([
    getAllPosts(),
    getPinnedPosts(),
    getGalleryPhotos()
  ]);

  return <MainPage posts={posts} pinnedPosts={pinnedPosts} photos={photos} />;
}
