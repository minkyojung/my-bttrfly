import { getAllPosts } from "@/lib/markdown";
import { sliceFrontPage, groupByColumn } from "@/lib/front-page";
import { Masthead } from "@/components/front-page/Masthead";
import { HeroStory } from "@/components/front-page/HeroStory";
import { StoryCard } from "@/components/front-page/StoryCard";
import { ColumnSection } from "@/components/front-page/ColumnSection";
import { Container } from "@/components/ui/container";

export default async function Home() {
  const posts = await getAllPosts();
  const slices = sliceFrontPage(posts);

  // 히어로 블록(히어로 + 좌/우 카드)에 이미 나온 글은 아래 칼럼 섹션에서
  // 다시 보이지 않도록 제외한다 — 같은 글이 한 페이지에 두 번 뜨는 걸 방지.
  const shown = slices
    ? new Set([slices.hero, ...slices.secondary, ...slices.recent].map((p) => p.slug))
    : new Set<string>();
  const columns = groupByColumn(posts.filter((post) => !shown.has(post.slug)));

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
              <section className="lg:order-3 lg:pl-8">
                {slices.recent.map((post) => (
                  <StoryCard key={post.slug} post={post} />
                ))}
              </section>
            </div>
          </>
        )}

        {columns.length > 0 && (
          <div className="mt-4">
            {columns.map((group) => (
              <ColumnSection key={group.value} group={group} />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
