import type { Post } from "@/lib/markdown";
import { SmartLink } from "@/components/ui/link";
import { SourceBadge } from "@/components/ui/source-badge";
import { postPath } from "@/lib/site-config";
import { CoverSlot } from "./CoverSlot";
import { Kicker } from "./Kicker";

export function HeroStory({ post }: { post: Post }) {
  return (
    <SmartLink
      href={post.external ?? postPath(post.slug)}
      className="block group"
    >
      <CoverSlot />
      <div className="mt-6">
        <div className="flex items-center gap-1.5">
          <SourceBadge source={post.source} />
          <Kicker category={post.category} date={post.date} />
        </div>
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
