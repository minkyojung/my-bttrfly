// GitHub 저장소 "owner/name" 단일 출처.
// keystatic.config(클라이언트 어드민)와 lib/github-write(서버 API)가 이 값을
// 공유한다. 서버 모듈이 keystatic.config 전체(=@keystatic/core)를 import하지
// 않도록 여기서만 정의한다.
export const GITHUB_REPO = "minkyojung/my-bttrfly";
