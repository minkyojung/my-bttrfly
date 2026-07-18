import type { Post } from "@/lib/markdown";
import { SmartLink } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { SourceBadge } from "@/components/ui/source-badge";
import { CoverSlot } from "./CoverSlot";
import { Kicker } from "./Kicker";

interface StoryCardProps {
  post: Post;
  // "list": 세로로 쌓이는 단일 컬럼(구분선 있음, 기존 히어로 블록 좌/우).
  // "grid": 여러 열 그리드에 놓이는 카드(구분선 없음, 칼럼 섹션용).
  variant?: "list" | "grid";
}

export function StoryCard({ post, variant = "list" }: StoryCardProps) {
  return (
    <SmartLink
      href={post.external ?? `/posts/${post.slug}`}
      className={cn(
        "block group",
        variant === "list" &&
          "py-5 first:pt-0 border-b border-border last:border-b-0"
      )}
    >
      <CoverSlot
        src={post.cover}
        alt={post.title}
        aspect="card"
        sizes="(min-width: 1024px) 25vw, 100vw"
      />
      <div className="mt-3">
        <div className="flex items-center gap-1.5">
          <SourceBadge source={post.source} />
          <Kicker category={post.category} date={post.date} />
        </div>
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
