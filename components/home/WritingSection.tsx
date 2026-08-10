import Link from "next/link";
import { getAllPosts } from "@/lib/markdown";
import { StoryCard } from "@/components/post/StoryCard";
import { Section } from "@/components/ui/section";
import { getStrings } from "@/lib/ui-strings";
import { localePath, type Locale } from "@/lib/i18n";

// 홈에 싣는 편수. 나머지는 /writing이 칼럼별로 보여준다.
const RECENT = 5;

export async function WritingSection({ locale }: { locale: Locale }) {
  const posts = await getAllPosts();
  if (posts.length === 0) return null;

  const t = getStrings(locale);

  return (
    <Section label={t.home.writing}>
      <div className="flex flex-col">
        {posts.slice(0, RECENT).map((post) => (
          <StoryCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>

      <Link
        href={localePath(locale, "/writing")}
        className="inline-block mt-5 text-fg-subtle text-[13px] font-medium no-underline transition-colors duration-200 hover:text-accent-warm"
      >
        {t.column.seeAll(posts.length)}
      </Link>
    </Section>
  );
}
