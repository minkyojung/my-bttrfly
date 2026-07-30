import "server-only";
import { NextResponse } from "next/server";
import { GitHubWriteError, WriteConfigError } from "@/lib/github-write";

/**
 * /api/write/* 의 공통 실패 응답. 다섯 라우트(create · update · patch · delete ·
 * image)에 같은 catch 블록이 로그 문구만 바꿔 복사돼 있던 것을 합쳤다.
 *
 * GitHub 응답 본문은 그대로 내보내지 않는다 — 저장소·브랜치·경로·ruleset 같은 내부
 * 사정이 섞여 있다. app/write/[slug]/page.tsx가 이미 같은 규칙을 세워두고
 * "응답 본문은 그대로 노출하지 않는다"고 적어놨는데 API 쪽만 예외였다.
 * 원본은 서버 로그에만 남긴다.
 *
 * lib/에서 NextResponse를 쓰는 건 이 파일이 처음이다. HTTP 응답을 만드는 서버 전용
 * 헬퍼라 정당하고, server-only로 경계를 명시했다.
 */
export function writeErrorResponse(
  err: unknown,
  context: string
): NextResponse {
  // 설정 누락은 저자 자신의 배포 문제이고 인증 뒤에서만 보이므로 그대로 알려준다.
  // 예전에는 평범한 Error였어서 "Unexpected error" 500으로 뭉개졌다.
  // (/write 페이지들은 이미 같은 정보를 노출한다.)
  if (err instanceof WriteConfigError) {
    console.error(context, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  if (err instanceof GitHubWriteError) {
    console.error(`${context} (GitHub ${err.status})`, err.message);
    // 409/422는 sha 불일치 = 읽은 뒤 파일이 바뀐 경우다. 저자가 할 수 있는
    // 행동으로 번역해준다.
    if (err.status === 409 || err.status === 422) {
      return NextResponse.json(
        {
          error:
            "This post changed somewhere else since you opened it. Reload to get the latest version.",
        },
        { status: 409 }
      );
    }
    // 3xx를 그대로 흘리면 Location 없는 리다이렉트가 되어 클라이언트가 해석할 수
    // 없다(저장소 이름이 바뀌면 GitHub이 301을 준다). 4xx/5xx만 통과시킨다.
    const status = err.status >= 400 && err.status <= 599 ? err.status : 502;
    return NextResponse.json(
      { error: `GitHub rejected the request (${err.status}).` },
      { status }
    );
  }

  console.error(context, err);
  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}
