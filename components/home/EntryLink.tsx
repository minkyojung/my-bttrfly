import Link from "next/link";
import Image from "next/image";
import type { NavEntry } from "@/lib/nav-entries";
import { localePath, type Locale } from "@/lib/i18n";

// 문장 안에 들어가므로 크기를 em으로 잡는다 — px로 박으면 본문 크기를 바꿀 때
// 표시만 어긋난다.
const MARK_BASE = "mx-[0.2em] inline-block";

// 로고는 본문 글자 크기(1em)만큼 쓴다. 원본 셋 다 가장자리에 여백이 있어서
// 박스를 1em으로 잡으면 정작 그림은 그보다 작게 읽힌다 — 그만큼 키워서 상쇄한다.
// 모서리도 em으로 잡는다. px로 박으면 본문 크기를 키웠을 때 아이콘만 각져 보인다.
// 0.6em ≈ 박스의 44%.
const ICON = `${MARK_BASE} h-[1.35em] w-[1.35em] align-[-0.32em] rounded-[0.6em] object-contain`;
const DOT = `${MARK_BASE} h-[0.62em] w-[0.62em] align-baseline rounded-full border border-fg-muted transition-colors duration-200 group-hover:border-fg group-hover:bg-fg group-focus-visible:border-fg group-focus-visible:bg-fg`;

// 문단 속 진입점. 문구와 표시가 하나의 링크이고, 어느 쪽에 커서를 올려도
// 둘이 함께 강조된다 — 표시만 노리면 조준이 너무 정밀해진다.
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

  // 바깥으로 나가는 항목은 next/link를 쓸 이유가 없다 — 프리페치할 라우트가 없다.
  const Wrapper = entry.externalUrl ? "a" : Link;
  const linkProps = entry.externalUrl
    ? { href: entry.externalUrl, target: "_blank", rel: "noopener noreferrer" }
    : { href: localePath(locale, entry.path) };

  return (
    <Wrapper
      {...linkProps}
      aria-describedby={tooltipId}
      // box-decoration-clone: 문구가 줄 끝에서 넘어갈 때 배경이 두 줄 모두에
      // 제대로 그려지게 한다. 없으면 넘어간 쪽 모서리가 잘린 채로 남는다.
      className="group box-decoration-clone rounded-sm px-[0.2em] no-underline transition-colors duration-200 hover:bg-surface-elevated focus-visible:bg-surface-elevated"
    >
      {phrase}

      {/* 표시와 카드를 감싸는 앵커. 링크 전체는 줄바꿈으로 쪼개질 수 있어
          위치 기준으로 쓸 수 없으므로, 쪼개지지 않는 이 span에 카드를 붙인다. */}
      <span className="relative inline-block">
        {entry.icon ? (
          // 원본은 1000~2000px이지만 실제로는 20px 안팎으로 그려진다. 미리 128px로
          // 줄여 저장소에 넣었고(셋 합쳐 16KB), 여기서는 크기를 em이 정한다.
          <Image
            src={entry.icon}
            alt=""
            aria-hidden
            width={128}
            height={128}
            className={ICON}
          />
        ) : (
          <span aria-hidden className={DOT} />
        )}

        {/* 아이콘 중앙이 아니라 왼쪽에 맞춰 오른쪽으로만 펼친다 — 중앙 정렬이면 문장
            맨 앞 항목의 카드 왼쪽 절반이 좁은 창에서 화면 밖으로 나간다(전에 실제로
            그래서 768px 밑에서는 아예 숨겼었다). 오른쪽으로만 펼치면 그 경우가 없어져
            아무 폭에서나 띄울 수 있다. max-w는 화면보다 좁은 창에서도 가로 스크롤이
            생기지 않게 하는 안전장치일 뿐, 평소엔 w-56(224px)로 고정된다. */}
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute top-full left-0 z-popover mt-2 block w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-md border border-border-strong bg-surface-elevated text-left opacity-0 shadow-popover transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {/* 사진은 카드 폭을 꽉 채운다 — 안쪽 여백은 아래 글 블록만 갖는다. */}
          {entry.previewImage && (
            <Image
              src={entry.previewImage}
              alt=""
              aria-hidden
              width={640}
              height={426}
              sizes="224px"
              className="block h-auto w-full object-cover"
            />
          )}

          <span className="block p-3">
            <span className="block text-fg text-[13px] font-medium leading-snug">
              {preview.title}
            </span>
            <span className="mt-1 block whitespace-pre-line text-fg-muted text-[13px] font-normal leading-[1.5]">
              {preview.body}
            </span>
          </span>
        </span>
      </span>
    </Wrapper>
  );
}
