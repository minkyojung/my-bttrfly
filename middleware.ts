import { NextRequest, NextResponse } from "next/server";
import { WRITE_SESSION_COOKIE, verifySession } from "@/lib/write-auth";

// 로그인 자체는 세션이 없어도 통과해야 하므로 명시적으로 허용.
const PUBLIC_PATHS = new Set(["/write/login", "/api/write/auth"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const session = request.cookies.get(WRITE_SESSION_COOKIE)?.value;
  const authenticated = await verifySession(session);
  if (authenticated) return NextResponse.next();

  if (pathname.startsWith("/api/write")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/write/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/write/:path*", "/api/write/:path*"],
};
