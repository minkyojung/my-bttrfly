"use client";

import { useState } from "react";
import type { Post } from "@/lib/markdown";
import type { Locale } from "@/lib/i18n";
import { StoryCard } from "@/components/post/StoryCard";

type Tab = "all" | "personal" | "work";

// 탭 전환 상태만 클라이언트에 둔다. 글 목록·문구는 서버가 만들어 props로
// 넘긴다 — 여기서 ui-strings나 getAllPosts를 부르면 두 언어 사전과 전체 글
// 목록이 통째로 클라이언트 번들에 실린다.
//
// 기본값은 All이다. 탭은 카드를 숨기는 필터일 뿐 분류를 알려주는 장치가 아니다 —
// StoryCard가 이미 SourceBadge와 Kicker로 제 출처와 카테고리를 달고 나온다.
// 그래서 처음에는 전부 보여주고, 좁혀 보고 싶은 사람만 탭을 누르게 한다.
export function WritingTabs({
  all,
  personal,
  work,
  locale,
}: {
  all: Post[];
  personal: Post[];
  work: Post[];
  locale: Locale;
}) {
  const [tab, setTab] = useState<Tab>("all");

  // 라벨은 lib/columns.ts의 SECTIONS와 같은 이름을 쓴다. 같은 목록이 홈,
  // /writing, /columns/work에서 다른 이름으로 불리면 안 된다.
  const tabs = [
    { key: "all", label: "All", posts: all },
    { key: "personal", label: "Personal", posts: personal },
    { key: "work", label: "Interviews", posts: work },
  ] as const;

  const shown = tabs.find((t) => t.key === tab)!.posts;

  return (
    <div>
      <div className="flex gap-1 mb-4" role="tablist">
        {tabs.map(({ key, label, posts }) =>
          // 빈 탭은 아예 만들지 않는다. All은 나머지가 비면 함께 비므로 같은 검사로 걸린다.
          posts.length === 0 ? null : (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                tab === key
                  ? "bg-fg text-bg"
                  : "bg-surface text-fg-muted hover:text-fg"
              }`}
            >
              {label}
              {/* 편수를 함께 보여준다 — 목록이 잘려 있는지 전부인지가 눌러보기 전에 읽힌다. */}
              <span className="ml-1.5 tabular-nums opacity-60">
                {posts.length}
              </span>
            </button>
          )
        )}
      </div>

      <div className="flex flex-col">
        {shown.map((post) => (
          <StoryCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </div>
  );
}
