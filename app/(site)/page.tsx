import { getAllPosts } from "@/lib/markdown";
import { sliceFrontPage } from "@/lib/front-page";
import { Masthead } from "@/components/front-page/Masthead";
import { HeroStory } from "@/components/front-page/HeroStory";
import { StoryCard } from "@/components/front-page/StoryCard";
import { RecentList } from "@/components/front-page/RecentList";
import { PostList } from "@/components/PostList";
import { Container } from "@/components/ui/container";

export default async function Home() {
  const posts = await getAllPosts();
  const slices = sliceFrontPage(posts);

  return (
    <main className="min-h-screen bg-bg pt-16 pb-24">
      <Container className="max-w-wide">
        <Masthead />

        {slices && (
          <>
            {/* DOM 순서 = 모바일 스택 순서: hero → secondary → recent */}
            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.7fr_1fr] lg:gap-0">
              <section className="lg:order-2 lg:px-8 lg:border-x lg:border-border">
                <HeroStory post={slices.hero} />
              </section>
              <section className="lg:order-1 lg:pr-8">
                {slices.secondary.map((post) => (
                  <StoryCard key={post.slug} post={post} />
                ))}
              </section>
              <aside className="lg:order-3 lg:pl-8">
                <RecentList posts={slices.recent} />
              </aside>
            </div>

            {slices.archive.length > 0 && (
              <section className="mt-20 mx-auto max-w-content">
                <h2 className="text-fg-subtle text-xs font-medium tracking-[0.08em] uppercase mb-4">
                  Archive
                </h2>
                <PostList posts={slices.archive} />
              </section>
            )}
          </>
        )}
      </Container>
    </main>
  );
}
