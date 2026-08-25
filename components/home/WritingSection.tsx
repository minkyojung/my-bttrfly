import { getAllPosts } from "@/lib/markdown";
import { SECTIONS } from "@/lib/columns";
import { WritingFeed } from "./WritingFeed";
import type { Locale } from "@/lib/i18n";

// 홈 피드에 싣는 Personal 글 편수. 나머지는 /writing이 보여준다. Work는
// 디스콰이엇 인터뷰 전부를 실어도 몇 편 안 되니 자르지 않는다.
const RECENT = 20;

const sectionCategories = (key: string) =>
  SECTIONS.find((s) => s.key === key)!.categories as readonly string[];

const PERSONAL_CATEGORIES = sectionCategories("personal");
const WORK_CATEGORIES = sectionCategories("work");

export async function WritingSection({ locale }: { locale: Locale }) {
  const posts = await getAllPosts();
  if (posts.length === 0) return null;

  // 최신순이 아니라 직접 고른 글이 우선이다 — 최근 날짜라는 이유만으로
  // 회고·잡담이 대표 글 자리를 차지하는 걸 막는다. 고른 글이 없으면(featured
  // 미지정) 예전처럼 최신순으로 채운다.
  //
  // 고르는 범위를 Personal로 먼저 좁힌다. 전체에서 featured만 걸러내면 인터뷰에
  // featured가 붙는 순간 그 글이 Personal 탭에도 나타난다.
  const personalAll = posts.filter(
    (post) => post.category && PERSONAL_CATEGORIES.includes(post.category)
  );
  const featured = personalAll.filter((post) => post.featured);
  const personal = (featured.length > 0 ? featured : personalAll).slice(0, RECENT);

  const work = posts.filter(
    (post) => post.category && WORK_CATEGORIES.includes(post.category)
  );

  // 두 목록을 합치되 고른 글을 위로 올린다. 날짜순으로 그냥 섞으면
  // 2024년에 몰려 있는 인터뷰가 위를 다 차지해 featured를 고른 의미가 없어진다.
  // 두 섹션의 카테고리는 서로 겹치지 않으므로 이어붙여도 중복이 없다.
  const merged = [...personal, ...work];
  const all = [
    ...merged.filter((post) => post.featured),
    ...merged.filter((post) => !post.featured),
  ];

  return <WritingFeed posts={all} locale={locale} />;
}
