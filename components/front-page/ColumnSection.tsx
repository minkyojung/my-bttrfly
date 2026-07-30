import Link from "next/link";
import type { ColumnGroup } from "@/lib/front-page";
import { columnUrl } from "@/lib/columns";
import { StoryCard } from "./StoryCard";

export function ColumnSection({ group }: { group: ColumnGroup }) {
  // 1면은 칼럼마다 앞 몇 편만 보여준다. 섹션 페이지로 가는 링크가 없으면 나머지
  // 글은 사이트 어디에서도 링크되지 않는 상태가 된다(실제로 14편이 그랬다).
  const href = columnUrl(group.value);
  const hidden = group.total - group.posts.length;

  return (
    <section className="mt-16 first:mt-0">
      <div className="flex items-baseline justify-between border-b border-border pb-2">
        <h2 className="text-fg text-[11px] font-semibold uppercase tracking-[0.12em]">
          <Link href={href} className="transition-opacity hover:opacity-60">
            {group.label}
          </Link>
        </h2>
        {hidden > 0 && (
          <Link
            href={href}
            className="text-fg-subtle text-[11px] font-medium uppercase tracking-[0.12em] transition-opacity hover:opacity-60"
          >
            전체 {group.total}편 →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
        {group.posts.map((post) => (
          <StoryCard key={post.slug} post={post} variant="grid" />
        ))}
      </div>
    </section>
  );
}
