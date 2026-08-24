import type { Post } from "@/lib/markdown";
import { SmartLink } from "@/components/ui/link";
import { cn, formatDate } from "@/lib/utils";
import { SourceBadge } from "@/components/ui/source-badge";
import { postPath } from "@/lib/site-config";
import type { Locale } from "@/lib/i18n";
import { Kicker } from "./Kicker";

interface StoryCardProps {
  post: Post;
  locale: Locale;
  // "list": 세로로 쌓이는 단일 컬럼(구분선 있음).
  // "grid": 여러 열 그리드에 놓이는 카드(구분선 없음, 칼럼 섹션용).
  variant?: "list" | "grid";
}

export function StoryCard({ post, locale, variant = "list" }: StoryCardProps) {
  if (variant === "list") {
    return (
      <SmartLink
        href={post.external ?? postPath(post.slug)}
        className="group flex items-center gap-2 py-2.5 first:pt-0 border-b border-border last:border-b-0"
      >
        <SourceBadge source={post.source} />
        <h3 className="min-w-0 flex-1 truncate font-serif text-fg text-[15px] font-medium group-hover:opacity-60 transition-opacity">
          {post.title}
          {post.external && (
            <span className="text-fg-subtle text-sm align-super ml-1">↗</span>
          )}
        </h3>
        <time
          dateTime={post.date}
          className="shrink-0 text-fg-subtle text-xs tabular-nums"
        >
          {formatDate(post.date)}
        </time>
      </SmartLink>
    );
  }

  return (
    <SmartLink href={post.external ?? postPath(post.slug)} className="block group">
      <div>
        <div className="flex items-center gap-1.5">
          <SourceBadge source={post.source} />
          <Kicker category={post.category} date={post.date} locale={locale} />
        </div>
        <h3 className="font-serif text-fg text-lg font-semibold leading-snug line-clamp-3 mt-1.5 group-hover:opacity-60 transition-opacity">
          {post.title}
          {post.external && (
            <span className="text-fg-subtle text-sm align-super ml-1">↗</span>
          )}
        </h3>
      </div>
    </SmartLink>
  );
}
