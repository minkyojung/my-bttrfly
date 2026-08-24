import type { Post } from "@/lib/markdown";
import { SmartLink } from "@/components/ui/link";
import { cn } from "@/lib/utils";
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
  return (
    <SmartLink
      href={post.external ?? postPath(post.slug)}
      className={cn(
        "block group",
        variant === "list" &&
          "py-5 first:pt-0 border-b border-border last:border-b-0"
      )}
    >
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
