import { NextResponse } from "next/server";

// 세션이 실제로 붙었는지 확인만 하는 엔드포인트. 로그인 응답이 200이라는 사실은
// "비밀번호가 맞았다"까지만 말해주고 브라우저가 Set-Cookie를 받아들였는지는
// 말해주지 않아서, 로그인 직후 이 경로를 한 번 찔러 확인한다.
//
// 본문에 인증 로직이 없는 게 정상이다 — 미들웨어의 /api/write/:path* 매처에 걸리고
// PUBLIC_PATHS에 없으므로, 세션이 없으면 이 함수에 닿기 전에 401이 난다.
export async function GET() {
  return NextResponse.json({ ok: true });
}
