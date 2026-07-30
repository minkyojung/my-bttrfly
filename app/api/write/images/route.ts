import { NextRequest, NextResponse } from "next/server";
import { putBinaryFile, GitHubWriteError } from "@/lib/github-write";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-image";

// SVG는 뺀다. SVG는 스크립트를 품을 수 있고, 업로드된 파일은 블로그와 같은
// 출처에서 서빙되므로 그 스크립트가 이 사이트의 권한으로 돈다. <img>로 삽입할
// 때는 브라우저가 실행을 막지만 파일 주소로 직접 열면 실행된다 — next/image가
// dangerouslyAllowSVG 없이는 SVG를 다루지 않는 것도 같은 이유다.
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];

function sanitizeFilename(originalName: string, extension: string): string {
  const withoutExtension = originalName.slice(0, originalName.length - extension.length - 1);
  const sanitizedBase = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${Date.now()}-${sanitizedBase}.${extension.toLowerCase()}`;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // 상한은 lib/upload-image.ts와 공유한다. 예전에는 여기만 5MB였는데 Vercel 함수의
  // 요청 본문 한도가 4.5MB라, 4.5~5MB 파일은 이 검사에 닿기도 전에 플랫폼이 413으로
  // 끊어서 아래 친절한 메시지가 나올 기회 자체가 없었다.
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Image must be ${MAX_UPLOAD_LABEL} or smaller` },
      { status: 400 }
    );
  }

  const extensionMatch = /\.([a-zA-Z0-9]+)$/.exec(file.name);
  const extension = extensionMatch?.[1]?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const filename = sanitizeFilename(file.name.toLowerCase(), extension);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    await putBinaryFile(
      `public/images/uploads/${filename}`,
      base64,
      `chore: upload image ${filename}`
    );

    return NextResponse.json({ path: `/images/uploads/${filename}` }, { status: 200 });
  } catch (err) {
    if (err instanceof GitHubWriteError) {
      const status = err.status && err.status >= 100 ? err.status : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("Failed to upload image", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
