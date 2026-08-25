import Link from "next/link";
import Image from "next/image";
import type { NavEntry } from "@/lib/nav-entries";
import { localePath, type Locale } from "@/lib/i18n";
import { postPath } from "@/lib/site-config";
import type { Post } from "@/lib/markdown";

// 문장 안에 들어가므로 크기를 em으로 잡는다 — px로 박으면 본문 크기를 바꿀 때
// 표시만 어긋난다.
const MARK_BASE = "mx-[0.2em] inline-block";

// 로고는 본문 글자 크기(1em)만큼 쓴다. 원본 셋 다 가장자리에 여백이 있어서
// 박스를 1em으로 잡으면 정작 그림은 그보다 작게 읽힌다 — 그만큼 키워서 상쇄한다.
// 모서리도 em으로 잡는다. px로 박으면 본문 크기를 키웠을 때 아이콘만 각져 보인다.
// 0.6em ≈ 박스의 44%.
const ICON = `${MARK_BASE} h-[1.35em] w-[1.35em] align-[-0.32em] rounded-[0.6em] object-contain`;
const DOT = `${MARK_BASE} h-[0.62em] w-[0.62em] align-baseline rounded-full border border-fg-muted transition-colors duration-200 group-hover:border-fg group-hover:bg-fg group-focus-within:border-fg group-focus-within:bg-fg`;

// 문단 속 진입점. 문구와 표시가 하나의 링크이고, 어느 쪽에 커서를 올려도
// 둘이 함께 강조된다 — 표시만 노리면 조준이 너무 정밀해진다.
//
// 프리뷰는 CSS만으로 연다(group-hover / group-focus-visible). 클라이언트 컴포넌트로
// 만들면 문단 전체가 하이드레이션 대상이 되는데, 이건 그냥 읽는 문단이다.
export function EntryLink({
  entry,
  phrase,
  locale,
  postLinks,
}: {
  entry: NavEntry;
  phrase: string;
  locale: Locale;
  // 카드 안에 글 링크를 몇 개 추가로 걸고 싶을 때만 넘긴다(현재는 disquiet 항목).
  postLinks?: Post[];
}) {
  const preview = entry.preview[locale];
  const tooltipId = `entry-preview-${entry.id}`;

  // 바깥으로 나가는 항목은 next/link를 쓸 이유가 없다 — 프리페치할 라우트가 없다.
  const Wrapper = entry.externalUrl ? "a" : Link;
  const linkProps = entry.externalUrl
    ? { href: entry.externalUrl, target: "_blank", rel: "noopener noreferrer" }
    : { href: localePath(locale, entry.path) };

  return (
    // 문구+아이콘 전체를 위치 기준점으로 삼는다 — 카드 왼쪽 모서리가 문구
    // 시작점과 맞아야 하므로, 기준이 되는 이 span은 relative + inline-block이어야
    // 한다(아이콘만 기준으로 삼으면 카드가 문구 길이만큼 오른쪽으로 밀려 보인다).
    // inline-block이라 문구+아이콘은 이제 통짜로 움직인다 — 줄 끝에 걸리면
    // 통째로 다음 줄로 넘어간다(문구 중간이 아니라). 여기 쓰이는 문구는 다
    // 짧은 단어라 실제로 줄바꿈이 걸릴 일이 거의 없다.
    //
    // group-hover는 조상-자손 관계면 깊이 상관없이 적용되므로, 문구·아이콘·카드
    // 어디를 호버해도 이 group의 :hover로 잡힌다.
    <span className="group relative inline-block">
      <Wrapper
        {...linkProps}
        aria-describedby={tooltipId}
        // 카드를 이 안에 중첩하지 않는다 — <a> 안에 <a>는 유효하지 않은 HTML이라
        // 브라우저가 임의로 닫아버린다.
        className="rounded-sm px-[0.2em] underline decoration-fg-subtle underline-offset-2 transition-colors duration-200 hover:bg-surface-elevated focus-visible:bg-surface-elevated"
      >
        {phrase}
      </Wrapper>

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

      {/* 문구 시작점(왼쪽 모서리)에 맞춰 바로 아래에 띄운다. max-w는 화면보다
          좁은 창에서도 가로 스크롤이 생기지 않게 하는 안전장치일 뿐, 평소엔
          w-[22rem](352px)로 고정된다. pointer-events는 평소 꺼둔다 — opacity-0인
          채로도 카드가 아래 문단 내용을 클릭 못 하게 가로막는 사고를 막기
          위해서다. 열렸을 때만 켠다. gap은 margin이 아니라 padding-top으로
          준다 — margin은 커서가 지나가도 '호버 중'으로 잡히지 않는 빈 공간이라,
          아이콘에서 카드로 마우스를 내리는 도중 그 틈에서 호버가 끊겨 카드가
          열리기 전에 닫혀버렸다. padding은 이 span의 히트박스 안에 포함되므로
          그 문제가 없다. */}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute top-full left-0 z-popover block w-[22rem] max-w-[calc(100vw-3rem)] pt-2 text-left opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
      >
        <span className="block overflow-hidden rounded-md border border-border-strong bg-surface-elevated shadow-popover">
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
            <span className="block text-fg text-[15px] font-bold leading-snug">
              {preview.title}
            </span>
            <span className="mt-2 block whitespace-pre-line text-fg-muted text-[14px] font-normal leading-[1.65]">
              {preview.body}
            </span>
          </span>

          {postLinks && postLinks.length > 0 && (
            <span className="block border-t border-border-strong">
              {postLinks.map((post) => (
                <Link
                  key={post.slug}
                  href={localePath(locale, postPath(post.slug))}
                  className="block truncate px-3 py-1.5 text-fg-muted text-[12px] leading-tight no-underline transition-colors duration-150 hover:bg-surface hover:text-fg"
                >
                  {post.title}
                </Link>
              ))}
            </span>
          )}
        </span>
      </span>
    </span>
  );
}
