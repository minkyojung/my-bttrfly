import type { Post } from "@/lib/markdown";
import { SmartLink } from "@/components/ui/link";
import { CoverSlot } from "./CoverSlot";
import { Kicker } from "./Kicker";

export function StoryCard({ post }: { post: Post }) {
  return (
    <SmartLink
      href={post.external ?? `/posts/${post.slug}`}
      className="block group hover:!opacity-100 py-5 first:pt-0 border-b border-border last:border-b-0"
    >
      <CoverSlot
        src={post.cover}
        alt={post.title}
        aspect="card"
        sizes="(min-width: 1024px) 25vw, 100vw"
      />
      <div className="mt-3">
        <Kicker category={post.category} date={post.date} />
        <h3 className="font-serif text-fg text-lg font-bold leading-snug line-clamp-3 mt-1.5 group-hover:opacity-60 transition-opacity">
          {post.title}
          {post.external && (
            <span className="text-fg-subtle text-sm align-super ml-1">↗</span>
          )}
        </h3>
      </div>
    </SmartLink>
  );
}
