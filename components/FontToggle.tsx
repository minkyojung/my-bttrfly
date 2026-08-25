"use client";

import { useEffect, useState } from "react";

// 테스트용 폰트 스위치. 지금(제목·자기소개 문단은 세리프, 나머지는 Pretendard)
// 섞인 상태 말고, 사이트 전체를 하나로 통일했을 때 어떤지 눈으로 비교해보기
// 위한 것 — 눌러보고 마음에 드는 쪽으로 정해지면 이 컴포넌트는 지운다.
//
// html[data-font-test] 값에 따라 globals.css가 `*`에 !important로 폰트를
// 덮어씌운다. 값이 없는 기본 상태는 지금 사이트 그대로(섞인 디자인)다.
//
// localStorage에 저장해 새로고침해도 유지되게 한다 — 매번 다시 누르면
// 비교하기 번거롭다.
const STORAGE_KEY = "font-test";
type Mode = "mixed" | "sans" | "serif";
const NEXT: Record<Mode, Mode> = { mixed: "sans", sans: "serif", serif: "mixed" };
const LABEL: Record<Mode, string> = {
  mixed: "지금 그대로",
  sans: "전체 Pretendard",
  serif: "전체 Serif",
};

export function FontToggle() {
  const [mode, setMode] = useState<Mode>("mixed");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial: Mode = saved === "sans" || saved === "serif" ? saved : "mixed";
    setMode(initial);
    apply(initial);
  }, []);

  const apply = (m: Mode) => {
    if (m === "mixed") {
      document.documentElement.removeAttribute("data-font-test");
    } else {
      document.documentElement.setAttribute("data-font-test", m);
    }
  };

  const toggle = () => {
    const next = NEXT[mode];
    setMode(next);
    apply(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-fg-subtle text-[13px] font-medium tracking-[0.02em] no-underline transition-opacity duration-300 hover:opacity-60"
    >
      {LABEL[mode]}
    </button>
  );
}
