import type { ColumnGroup } from "@/lib/front-page";
import { StoryCard } from "./StoryCard";

export function ColumnSection({ group }: { group: ColumnGroup }) {
  return (
    <section className="mt-16 first:mt-0">
      <h2 className="text-fg text-[11px] font-semibold uppercase tracking-[0.12em] border-b border-border pb-2">
        {group.label}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
        {group.posts.map((post) => (
          <StoryCard key={post.slug} post={post} variant="grid" />
        ))}
      </div>
    </section>
  );
}
