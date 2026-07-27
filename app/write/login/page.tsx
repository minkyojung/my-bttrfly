"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WriteLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/write/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // 200은 비밀번호가 맞았다는 뜻일 뿐, 브라우저가 세션 쿠키를 받아들였다는
        // 뜻은 아니다. 거부되면 미들웨어가 곧바로 로그인으로 되돌려보내는데,
        // 화면에는 아무 이유도 안 뜬 채 폼만 비워져서 원인을 알 수 없다.
        // 넘어가기 전에 세션이 실제로 붙었는지 확인한다.
        const check = await fetch("/api/write/session", {
          credentials: "same-origin",
        });
        if (!check.ok) {
          setError(
            "브라우저가 로그인 쿠키를 거부했습니다. HTTPS로 접속했는지 확인해 주세요."
          );
          return;
        }
        router.push("/write");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
    } catch {
      setError("Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="rounded-sm border border-border bg-bg px-3 py-2 text-fg"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-accent-warm px-3 py-2 font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
