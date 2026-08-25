// 홈의 섹션 리듬을 여기 한 곳에서만 정한다.
//
// 라벨 스타일과 섹션 간 간격이 각 컴포넌트에 흩어져 있으면 섹션을 하나 더할 때마다
// 눈대중으로 맞추게 되고, 결국 조금씩 어긋난다. 간격은 Section이 단독으로 갖는다 —
// 호출부에서 mt-*를 붙이지 않는다.

// 섹션 본문 텍스트. 소개·이력·제품 설명이 모두 같은 크기여야 목록으로 읽힌다.
export const SECTION_TEXT =
  "text-fg-muted text-[15px] font-normal leading-[1.6]";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-fg-subtle text-xs font-medium tracking-[0.08em] uppercase mb-3">
      {children}
    </h2>
  );
}

export function Section({
  label,
  children,
  compact,
}: {
  label: string;
  children: React.ReactNode;
  // 사이드바처럼 좁고 세로로 긴 자리에 놓일 때 섹션 간 여백을 줄인다.
  compact?: boolean;
}) {
  return (
    <section className={compact ? "mt-6 first:mt-0" : "mt-14 first:mt-0"}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </section>
  );
}
