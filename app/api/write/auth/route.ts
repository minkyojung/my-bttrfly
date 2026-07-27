import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  signSession,
  WRITE_SESSION_COOKIE,
  WRITE_SESSION_MAX_AGE_SECONDS,
} from "@/lib/write-auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = (body as { password?: unknown })?.password;
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await signSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(WRITE_SESSION_COOKIE, token, {
    httpOnly: true,
    // 실제 연결이 TLS일 때만 Secure를 붙인다. Safari는 http://localhost를 신뢰할 수
    // 있는 출처로 보지 않아 Secure 쿠키를 조용히 버리므로, 늘 켜두면 로컬 개발에서
    // 로그인이 되지 않는다. NODE_ENV로 가르지 않는 이유는 그게 알고 싶은 사실이
    // 아니기 때문이다 — NODE_ENV가 production이 아닌 HTTPS 프리뷰 배포에서는
    // 반대로 Secure 없는 쿠키가 나간다. Vercel은 엣지에서 TLS를 끝내므로 이 값은
    // x-forwarded-proto에서 온다.
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: WRITE_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
