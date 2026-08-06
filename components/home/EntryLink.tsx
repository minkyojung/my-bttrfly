import Link from "next/link";
import type { NavEntry } from "@/lib/nav-entries";
import { localePath, type Locale } from "@/lib/i18n";

// 문단 속 진입점. 문구와 동그라미가 하나의 링크이고, 어느 쪽에 커서를 올려도
// 둘이 함께 강조된다 — 동그라미만 노리면 조준이 너무 정밀해진다.
//
// 아이콘은 지금 동그라미 플레이스홀더다.
//
// 프리뷰는 CSS만으로 연다(group-hover / group-focus-visible). 클라이언트 컴포넌트로
// 만들면 문단 전체가 하이드레이션 대상이 되는데, 이건 그냥 읽는 문단이다.
export function EntryLink({
  entry,
  phrase,
  locale,
}: {
  entry: NavEntry;
  phrase: string;
  locale: Locale;
}) {
  const preview = entry.preview[locale];
  const tooltipId = `entry-preview-${entry.id}`;

  return (
    <Link
      href={localePath(locale, entry.path)}
      aria-describedby={tooltipId}
      // box-decoration-clone: 문구가 줄 끝에서 넘어갈 때 배경이 두 줄 모두에
      // 제대로 그려지게 한다. 없으면 넘어간 쪽 모서리가 잘린 채로 남는다.
      className="group box-decoration-clone rounded-sm px-[0.2em] no-underline transition-colors duration-200 hover:bg-surface-elevated focus-visible:bg-surface-elevated"
    >
      {phrase}

      {/* 동그라미와 카드를 감싸는 앵커. 링크 전체는 줄바꿈으로 쪼개질 수 있어
          위치 기준으로 쓸 수 없으므로, 쪼개지지 않는 이 span에 카드를 붙인다. */}
      <span className="relative inline-block">
        <span
          aria-hidden
          className="mx-[0.18em] inline-block h-[0.62em] w-[0.62em] rounded-full border border-fg-muted align-baseline transition-colors duration-200 group-hover:border-fg group-hover:bg-fg group-focus-visible:border-fg group-focus-visible:bg-fg"
        />

        {/* 터치 기기에는 호버가 없다. 거기서는 탭이 곧 이동이므로 프리뷰를 띄우지
            않는다 — 화면도 좁아 카드가 잘린다. */}
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-popover mb-2 hidden w-56 -translate-x-1/2 rounded-md border border-border-strong bg-surface-elevated p-3 text-left opacity-0 shadow-popover transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
        >
          <span className="block text-fg text-[13px] font-semibold leading-snug">
            {preview.title}
          </span>
          <span className="mt-1 block text-fg-muted text-[13px] font-normal leading-[1.5]">
            {preview.body}
          </span>
        </span>
      </span>
    </Link>
  );
}
