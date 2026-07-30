// /write의 이미지 업로드 단일 출처. 툴바·붙여넣기·드래그·커버가 모두 이 함수를 쓴다.
// 예전에는 툴바용과 커버용이 각자 fetch를 갖고 있어서, 한쪽만 고쳐지는 일이 실제로
// 있었다(같은 파일 재선택 허용이 툴바에만 들어갔다).
//
// 서버 라우트도 상한을 여기서 가져간다. 두 곳에 다른 숫자가 있으면 "폼은 통과시켰는데
// 서버가 막는" 상태가 생긴다.
//
// 상한이 4MB인 이유는 Vercel 함수의 요청 본문 한도가 4.5MB이기 때문이다. 그보다 크면
// 요청이 핸들러에 닿기도 전에 플랫폼이 413(HTML)으로 끊어서, 서버가 준비한 친절한
// 메시지가 나올 기회 자체가 없다. 멀티파트 봉투 여유를 두고 4MB로 잡는다.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4MB";

export type UploadResult = { path: string } | { error: string };

export async function uploadImage(file: File): Promise<UploadResult> {
  // 보내기 전에 걸러서 즉시 알려준다(업로드 왕복을 기다리게 하지 않는다).
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: `Image must be ${MAX_UPLOAD_LABEL} or smaller` };
  }

  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/write/images", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json().catch(() => ({}))) as {
      path?: string;
      error?: string;
    };
    if (!res.ok) {
      // 413은 플랫폼이 HTML로 돌려주므로 data.error가 없다. 그대로 두면
      // "Image upload failed"만 뜨고 이유를 알 수 없다.
      if (res.status === 413) {
        return { error: `Image must be ${MAX_UPLOAD_LABEL} or smaller` };
      }
      return { error: data.error ?? "Image upload failed" };
    }
    return data.path ? { path: data.path } : { error: "Image upload failed" };
  } catch {
    return { error: "Image upload failed" };
  }
}
