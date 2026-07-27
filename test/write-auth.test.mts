import { test } from "node:test";
import assert from "node:assert/strict";

// write-auth는 호출 시점에 env를 읽으므로 import 전에 심어둔다.
process.env.WRITE_SESSION_SECRET = "test-secret-do-not-use-in-production";
process.env.WRITE_PASSWORD = "correct-horse";

const { signSession, verifySession, verifyPassword } = await import(
  "../lib/write-auth.ts"
);

function b64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// 만료 시각을 직접 지정해 서명한 토큰(signSession은 항상 7일 뒤로 만들기 때문).
async function signWithExp(exp: number, secret: string): Promise<string> {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ exp })));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return `${payload}.${b64url(new Uint8Array(sig))}`;
}

test("정상 세션은 통과한다", async () => {
  assert.equal(await verifySession(await signSession()), true);
});

test("만료된 세션은 거부된다", async () => {
  const expired = await signWithExp(
    Date.now() - 1000,
    process.env.WRITE_SESSION_SECRET!
  );
  assert.equal(await verifySession(expired), false);
});

test("다른 비밀키로 서명한 토큰은 거부된다", async () => {
  // 서명 검증이 실제로 동작하는지 — 이게 뚫리면 누구나 세션을 위조할 수 있다.
  const forged = await signWithExp(Date.now() + 60_000, "attacker-secret");
  assert.equal(await verifySession(forged), false);
});

test("페이로드를 변조하면 거부된다", async () => {
  const token = await signSession();
  const [, signature] = token.split(".");
  const tampered = await signWithExp(
    Date.now() + 999_999_999,
    "attacker-secret"
  );
  const tamperedPayload = tampered.split(".")[0];
  assert.equal(await verifySession(`${tamperedPayload}.${signature}`), false);
});

test("망가진 값들은 조용히 거부된다(예외를 던지지 않는다)", async () => {
  for (const bad of [
    undefined,
    "",
    "no-dot",
    ".",
    "a.b",
    "!!!.!!!",
    "a.b.c",
  ]) {
    assert.equal(await verifySession(bad as string | undefined), false, `입력: ${bad}`);
  }
});

test("올바른 비밀번호만 통과한다", async () => {
  assert.equal(await verifyPassword("correct-horse"), true);
  assert.equal(await verifyPassword("wrong"), false);
  assert.equal(await verifyPassword(""), false);
  assert.equal(await verifyPassword("correct-horse "), false); // 공백 하나 차이
  assert.equal(await verifyPassword("CORRECT-HORSE"), false);  // 대소문자
});
