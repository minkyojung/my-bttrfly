// 카드/히어로 위의 이미지 자리. 지금은 어떤 글도 커버를 갖지 않으므로 비어 있는
// 사각형만 그린다 — 목록의 세로 리듬을 잡아주는 역할이다.
export function CoverSlot() {
  return (
    <div
      aria-hidden
      className="bg-surface border border-border rounded-sm aspect-[3/2]"
    />
  );
}
