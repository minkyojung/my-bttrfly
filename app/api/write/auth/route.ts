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
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: WRITE_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
