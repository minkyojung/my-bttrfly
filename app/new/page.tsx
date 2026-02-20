import { getAllPosts } from "@/lib/markdown";
import { getGalleryPhotos } from "@/lib/gallery";
import { NewMainPage } from "@/components/NewMainPage";

export const metadata = {
  title: "Minkyo Jung",
  description: "A minimal photo-centric blog",
};

export default async function NewPage() {
  const [posts, photos] = await Promise.all([
    getAllPosts(),
    getGalleryPhotos(),
  ]);

  return <NewMainPage posts={posts} photos={photos} />;
}
