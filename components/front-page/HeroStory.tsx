import type { Post } from "@/lib/markdown";
import { SmartLink } from "@/components/ui/link";
import { CoverSlot } from "./CoverSlot";
import { Kicker } from "./Kicker";

export function HeroStory({ post }: { post: Post }) {
  return (
    <SmartLink
      href={post.external ?? `/posts/${post.slug}`}
      className="block group hover:!opacity-100"
    >
      <CoverSlot
        src={post.cover}
        alt={post.title}
        aspect="hero"
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <div className="mt-6">
        <Kicker category={post.category} date={post.date} />
        <h2 className="font-serif text-fg text-3xl md:text-4xl font-bold leading-snug tracking-[-0.01em] mt-3 group-hover:opacity-60 transition-opacity">
          {post.title}
          {post.external && (
            <span className="text-fg-subtle text-2xl align-super ml-1">↗</span>
          )}
        </h2>
        {(post.summary ?? post.preview) && (
          <p className="text-fg-muted text-[15px] font-normal leading-relaxed line-clamp-3 mt-4">
            {post.summary ?? post.preview}
          </p>
        )}
      </div>
    </SmartLink>
  );
}
