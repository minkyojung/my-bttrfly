import { NextRequest, NextResponse } from "next/server";
import { putBinaryFile, GitHubWriteError } from "@/lib/github-write";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];

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

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
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
