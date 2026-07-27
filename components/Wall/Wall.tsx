"use client";

import { useEffect, useRef, useState } from "react";
import { openingNarration, mockAnswer } from "@/lib/wall-script";

// 화면에 쌓이는 한 줄. 화자(narrator)는 대괄호로 감싸 흘러나오고,
// 방문자(visitor)는 그 아래 조용히 개입한다.
type Line = {
  id: number;
  role: "narrator" | "visitor";
  text: string;
};

// 글자별 타이핑 간격(ms). 문장부호 뒤에서 숨을 고르며 제4의 벽 특유의
// 띄엄띄엄한 호흡을 만든다.
function delayAfter(char: string): number {
  if (char === "…" || char === ".") return 340;
  if (char === "," || char === "?") return 200;
  if (char === " ") return 24;
  return 34;
}

// 한 줄을 글자 단위로 드러낸다. signal.aborted면 즉시 멈춘다(언마운트 안전).
function typewrite(
  text: string,
  onUpdate: (partial: string) => void,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const stop = () => {
      clearTimeout(timer);
      resolve();
    };
    signal.addEventListener("abort", stop, { once: true });

    const tick = () => {
      if (signal.aborted) return;
      i += 1;
      onUpdate(text.slice(0, i));
      if (i >= text.length) {
        signal.removeEventListener("abort", stop);
        return resolve();
      }
      timer = setTimeout(tick, delayAfter(text[i - 1]));
    };
    timer = setTimeout(tick, 0);
  });
}

const pause = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(t); resolve(); }, { once: true });
  });

export function Wall() {
  const [lines, setLines] = useState<Line[]>([]);
  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(true);
  const [input, setInput] = useState("");

  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 화자의 여러 줄을 순서대로 타이핑해 화면에 확정한다.
  async function narrate(texts: string[], signal: AbortSignal) {
    for (const text of texts) {
      await pause(500, signal);
      if (signal.aborted) return;
      await typewrite(text, setStreaming, signal);
      if (signal.aborted) return;
      const id = nextId.current++;
      setLines((prev) => [...prev, { id, role: "narrator", text }]);
      setStreaming("");
    }
  }

  // 진입 시 도입부 서술이 스스로 흘러나온다.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      await narrate(openingNarration, controller.signal);
      if (!controller.signal.aborted) setBusy(false);
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새 줄이 쌓이거나 타이핑될 때 항상 바닥을 본다.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, streaming]);

  async function ask(question: string) {
    const controller = new AbortController();
    setBusy(true);
    setLines((prev) => [...prev, { id: nextId.current++, role: "visitor", text: question }]);
    await narrate(mockAnswer(question), controller.signal);
    setBusy(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    void ask(q);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-bg px-6 pt-24 pb-10">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex w-full max-w-[640px] flex-1 flex-col gap-6 overflow-y-auto"
      >
        {lines.map((line) =>
          line.role === "narrator" ? (
            <p
              key={line.id}
              className="font-serif text-[20px] leading-[36px] tracking-[-0.01em] text-fg"
            >
              <span className="text-fg-subtle">[ </span>
              {line.text}
              <span className="text-fg-subtle"> ]</span>
            </p>
          ) : (
            <p
              key={line.id}
              className="font-serif text-[18px] leading-[32px] text-fg-muted"
            >
              — {line.text}
            </p>
          )
        )}

        {streaming && (
          <p className="font-serif text-[20px] leading-[36px] tracking-[-0.01em] text-fg">
            <span className="text-fg-subtle">[ </span>
            {streaming}
            <span className="ml-[1px] inline-block h-[20px] w-[2px] translate-y-[3px] animate-pulse bg-fg" />
          </p>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 w-full max-w-[640px] border-t border-border-strong pt-5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder={busy ? "……" : "그에 대해 무엇이 궁금한가"}
          aria-label="화자에게 묻기"
          className="w-full bg-transparent font-serif text-[18px] leading-[32px] text-fg placeholder:text-fg-subtle focus:outline-none disabled:opacity-40"
        />
      </form>
    </div>
  );
}
