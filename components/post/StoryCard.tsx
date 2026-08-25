import Image from "next/image";
import type { Post } from "@/lib/markdown";
import { SmartLink } from "@/components/ui/link";
import { cn, formatDate } from "@/lib/utils";
import { SourceBadge } from "@/components/ui/source-badge";
import { siteConfig, postPath } from "@/lib/site-config";
import type { Locale } from "@/lib/i18n";
import { Kicker } from "./Kicker";

// 작성자 줄의 "from ○○" 에 쓰는 출처 이름·링크. SourceBadge는 아이콘만
// 그리고 글자·주소는 없어서 여기서 따로 붙인다.
const SOURCE_LABEL: Record<NonNullable<Post["source"]>, string> = {
  substack: "Substack",
  disquiet: "Disquiet",
};
const SOURCE_URL: Record<NonNullable<Post["source"]>, string> = {
  substack: siteConfig.social.substack,
  disquiet: siteConfig.social.disquiet,
};

interface StoryCardProps {
  post: Post;
  locale: Locale;
  // "list": 피드형 카드(테두리로 분리, 커버 이미지+미리보기). "grid": 여러 열
  // 그리드에 놓이는 카드(구분선 없음, 칼럼 섹션용).
  variant?: "list" | "grid";
}

export function StoryCard({ post, locale, variant = "list" }: StoryCardProps) {
  if (variant === "list") {
    // 본문 첫 이미지를 커버로 쓴다. imageMeta는 lib/markdown.ts에서 본문에
    // 나온 순서대로 쌓인다 — 여기서 굳이 헬퍼를 따로 안 쓰는 이유는 이 컴포넌트가
    // WritingTabs("use client") 트리에 걸려 있어, "server-only" 가드가 붙은
    // lib/markdown.ts의 런타임 export를 끌어오면 빌드가 깨지기 때문이다(타입만
    // import하는 건 괜찮다 — 컴파일 시 지워진다).
    // 본문이 로컬에 없는 외부 링크 글은 post.cover(scripts/backfill-covers.mjs가
    // 채워둔 원문 og:image)로 대체한다. 그 이미지는 실제 크기를 몰라 1200x630로
    // 근사한다 — object-cover라 카드에 그려지는 결과는 어차피 같다.
    const localCover = Object.keys(post.imageMeta)[0] as string | undefined;
    const cover = localCover ?? post.cover;
    const dim = localCover ? post.imageMeta[localCover] : undefined;

    return (
      <div>
        {/* 작성자 줄. 카드(테두리 박스) 밖에 그린다 — 카드마다 붙지만, 카드
            껍데기 안에 넣으면 "카드의 일부"처럼 보인다. 트위터 타임라인처럼
            글 하나하나의 메타데이터로 카드 위에 얹혀 있는 모양을 원한 것.
            이름 줄과 날짜 줄을 나눈다 — 출처(from Substack)가 끼면서 한 줄에
            다 넣기엔 정보가 많아졌다. */}
        <div className="flex items-start gap-3 mb-3">
          <Image
            src="/images/profile.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate text-[15px] leading-tight">
              <span className="font-semibold text-fg">{siteConfig.displayName[locale]}</span>
              {post.source && (
                <>
                  <span className="text-fg-subtle">from</span>
                  {/* 카드 자체는 아직 이 줄 밖(형제)의 별도 <a>라 여기 또 다른
                      <a>를 넣어도 중첩이 아니다 — 클릭하면 이 사람의 substack/
                      disquiet 프로필로 간다. */}
                  <a
                    href={SOURCE_URL[post.source]}
                    target="_blank"
                    rel="noopener noreferrer"
                    // 왼쪽은 부모 flex의 gap-1.5("from"과의 간격)에 살짝 더
                    // 파고들어(-ml-2) pl을 얕게(pl-1) 주고, 오른쪽은 gap이
                    // 안 붙는 마지막 요소라 pr을 그대로(pr-1.5) 둔다.
                    className="-my-0.5 -ml-2 inline-flex items-center gap-1 rounded-md pl-1 pr-1.5 py-0.5 text-fg-subtle no-underline transition-colors duration-150 hover:bg-surface-elevated"
                  >
                    <SourceBadge source={post.source} />
                    {SOURCE_LABEL[post.source]}
                  </a>
                </>
              )}
            </div>
            <div className="mt-0.5 text-fg-subtle text-sm">{formatDate(post.date)}</div>
          </div>
        </div>

        <SmartLink
          href={post.external ?? postPath(post.slug)}
          // 좌측 사이드바 카드(page.tsx)와 같은 스타일 값 — rounded-lg, border-border,
          // bg-surface. 여기만 다른 껍데기를 쓰면 사이드바 옆에서 튀어 보인다.
          className="group block overflow-hidden rounded-lg border border-border bg-surface no-underline transition-colors duration-150 hover:bg-surface-elevated"
        >
          {/* 커버가 없는 글(본문이 여기 없는 외부 링크 글 등)은 이미지 블록째
              건너뛴다 — 빈 회색 박스보다 없는 편이 낫다. */}
          {cover && (
            <Image
              src={cover}
              alt=""
              aria-hidden
              width={dim?.width ?? 1200}
              height={dim?.height ?? 630}
              sizes="(min-width: 1024px) 700px, 100vw"
              className="block h-[280px] w-full object-cover"
            />
          )}

          <div className="p-3">
            <h3 className="font-serif text-fg text-xl font-bold leading-snug text-balance">
              {post.title}
              {post.external && (
                <span className="text-fg-subtle text-sm align-super ml-1">↗</span>
              )}
            </h3>
            {/* 본문이 로컬에 없는 외부 링크 글은 preview(본문에서 뽑음)가 비어
                있다 — summary(손으로 쓴 요약)가 있으면 그걸 대신 쓴다. 상세
                페이지 메타 설명과 같은 우선순위(post.summary ?? post.preview). */}
            {(post.summary ?? post.preview) && (
              <p className="mt-2 line-clamp-3 text-fg-muted text-[15px] font-normal leading-[1.55]">
                {post.summary ?? post.preview}
              </p>
            )}
          </div>
        </SmartLink>
      </div>
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
