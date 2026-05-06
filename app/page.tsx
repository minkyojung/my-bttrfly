import { getAllPosts } from "@/lib/markdown";
import { getGitHubData } from "@/lib/github";
import { ProfileSection } from "@/components/ProfileSection/ProfileSection";
import { AboutSection } from "@/components/AboutSection";
import { PostList } from "@/components/PostList";
import { Container } from "@/components/ui/container";

export default async function Home() {
  const [posts, githubData] = await Promise.all([
    getAllPosts(),
    getGitHubData(),
  ]);

  return (
    <main className="min-h-screen bg-bg pt-16 pb-24">
      <Container>
        <ProfileSection githubData={githubData} />

        <section className="mt-16">
          <AboutSection />
        </section>

        {posts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-fg-subtle text-xs font-medium tracking-[0.08em] uppercase mb-4">
              Writing
            </h2>
            <PostList posts={posts} />
          </section>
        )}
      </Container>
    </main>
  );
}
