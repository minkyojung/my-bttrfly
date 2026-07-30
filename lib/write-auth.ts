/**
 * /write 게이팅용 세션 인증. Edge 미들웨어와 Node API 라우트 양쪽에서
 * 동일하게 동작해야 하므로 Web Crypto(`crypto.subtle`)만 사용한다
 * (Node 전용 `crypto` 모듈은 미들웨어 기본 Edge 런타임에서 못 씀).
 */

export const WRITE_SESSION_COOKIE = "write_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일
export const WRITE_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

// WRITE_PASSWORD의 최소 길이. 이 엔드포인트에는 시도 제한이 없고(서버리스에서
// 인스턴스별 카운터는 의미가 없다) 통과하면 저장소 커밋 권한이 7일간 열리므로,
// 온라인 추측을 비현실적으로 만드는 실질 통제는 비밀번호 길이뿐이다.
const MIN_PASSWORD_LENGTH = 20;

function requireEnv(
  name: "WRITE_SESSION_SECRET" | "WRITE_PASSWORD",
  minLength = 0
): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  if (value.length < minLength) {
    throw new Error(
      `${name} must be at least ${minLength} characters (see .env.example)`
    );
  }
  return value;
}

function b64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(value: string): Uint8Array {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// 길이가 같은 두 바이트 배열을 상수 시간에 비교한다(타이밍 공격 방지).
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signSession(): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = b64urlEncode(
    new TextEncoder().encode(JSON.stringify({ exp }))
  );
  const key = await hmacKey(requireEnv("WRITE_SESSION_SECRET"));
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return `${payload}.${b64urlEncode(new Uint8Array(signature))}`;
}

export async function verifySession(
  cookieValue: string | undefined
): Promise<boolean> {
  if (!cookieValue) return false;
  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return false;

  try {
    const key = await hmacKey(requireEnv("WRITE_SESSION_SECRET"));
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(signature) as BufferSource,
      new TextEncoder().encode(payload)
    );
    if (!valid) return false;

    const { exp } = JSON.parse(
      new TextDecoder().decode(b64urlDecode(payload))
    ) as { exp?: unknown };
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

// 길이 검증은 여기서만 한다. verifySession에서 하면 짧은 비밀번호가 설정된 순간
// 이미 로그인해 둔 세션까지 조용히 무효화된다 — 로그인만 막히는 게 맞다.
export async function verifyPassword(candidate: string): Promise<boolean> {
  const actual = requireEnv("WRITE_PASSWORD", MIN_PASSWORD_LENGTH);
  const key = await hmacKey(requireEnv("WRITE_SESSION_SECRET"));
  const [a, b] = await Promise.all([
    crypto.subtle.sign("HMAC", key, new TextEncoder().encode(candidate)),
    crypto.subtle.sign("HMAC", key, new TextEncoder().encode(actual)),
  ]);
  return constantTimeEqual(new Uint8Array(a), new Uint8Array(b));
}
