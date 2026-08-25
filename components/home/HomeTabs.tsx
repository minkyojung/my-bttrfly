"use client";

import { createContext, useContext, useState } from "react";

type Tab = "intro" | "essays";

// 트리거(사이드바의 CTA 버튼)와 그게 바꾸는 콘텐츠(중앙 컬럼)가 화면에서
// 서로 다른 자리에 있어 — 사이드바는 왼쪽 컬럼, 콘텐츠는 오른쪽 컬럼.
// 두 서버 트리(page.tsx) 사이에서 같은 탭 상태를 공유해야 해서 Context로
// 든다. Provider가 이 둘의 공통 조상(page.tsx의 grid 전체)을 감싼다.
const HomeTabsContext = createContext<{
  tab: Tab;
  setTab: (t: Tab) => void;
} | null>(null);

export function HomeTabsProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <HomeTabsContext.Provider value={{ tab, setTab }}>
      {children}
    </HomeTabsContext.Provider>
  );
}

function useHomeTabs() {
  const ctx = useContext(HomeTabsContext);
  if (!ctx) throw new Error("useHomeTabs는 HomeTabsProvider 안에서만 쓴다");
  return ctx;
}

// 사이드바 Selected Work 밑에 놓는 CTA. 지금 상태가 아니라 눌렀을 때
// 갈 곳을 라벨로 보여준다. 문구는 버튼 이름표가 아니라 말을 거는 한 문장으로 —
// "Read Essays"/"Read Intro" 같은 기능성 라벨보다 사람 목소리에 가깝게.
export function ReadEssaysCTA() {
  const { tab, setTab } = useHomeTabs();
  const next: Tab = tab === "intro" ? "essays" : "intro";
  const label = next === "essays" ? "Read my essays" : "Let me introduce myself";

  return (
    <button
      type="button"
      onClick={() => setTab(next)}
      // rounded-lg: 위에 쌓인 사이드바 카드들(page.tsx)과 같은 반경.
      // 여기만 rounded-full로 두면 카드 무더기 밑에서 튀어 보인다.
      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent-warm px-4 py-2.5 text-white text-base font-bold transition-opacity duration-200 hover:opacity-90"
    >
      {label}
      <span aria-hidden>→</span>
    </button>
  );
}

// 중앙 컬럼. 자기소개 문단과 글 피드 둘 다 서버가 미리 그려서 children으로
// 받는다 — 여기서는 어느 쪽을 display:block으로 켤지만 정한다. unmount하지
// 않고 display만 바꾸는 이유: 나중에 Essays 쪽에 다시 클라이언트 상태(필터
// 등)가 생기면 Intro와 왔다갔다할 때마다 초기화되지 않게 하기 위해서다.
export function HomeMainColumn({
  intro,
  essays,
}: {
  intro: React.ReactNode;
  essays: React.ReactNode;
}) {
  const { tab } = useHomeTabs();
  return (
    <div>
      <div className={tab === "intro" ? "block" : "hidden"}>{intro}</div>
      <div className={tab === "essays" ? "block" : "hidden"}>{essays}</div>
    </div>
  );
}
