import type { Post } from "@/lib/markdown";
import type { Locale } from "@/lib/i18n";
import { StoryCard } from "@/components/post/StoryCard";

// 필터 탭(All/Personal/Interviews)은 없앴다 — StoryCard가 이미 출처(from
// Substack/Disquiet)를 달고 나오고, 좁혀 보고 싶어할 만큼 글이 많지 않다.
// 상태가 없어져서 클라이언트일 이유도 없다.
export function WritingFeed({ posts, locale }: { posts: Post[]; locale: Locale }) {
  return (
    // 카드가 각자 테두리로 나뉘어 있어 hairline 구분선 대신 간격으로 띄운다.
    // 카드 위에 작성자 줄까지 붙어 있어(StoryCard) 항목 하나의 키가 커진
    // 만큼 항목 사이 간격도 넉넉히 둔다 — 그래야 "이 줄이 이 카드 것"이
    // 한눈에 읽힌다.
    <div className="flex flex-col gap-12">
      {posts.map((post) => (
        <StoryCard key={post.slug} post={post} locale={locale} />
      ))}
    </div>
  );
}
