import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

// OG 이미지 두 라우트(사이트 전체 / 글별)가 공유하는 설정.
// 크기·폰트·바탕은 두 곳이 어긋나면 안 되므로 여기 한 곳에만 둔다.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// 카드 바탕. 각 라우트는 여기에 배치(padding, flexDirection 등)만 얹는다.
export const OG_ROOT_STYLE = {
  width: "100%",
  height: "100%",
  background: "#000000",
  color: "#ffffff",
  display: "flex",
  fontFamily: "Pretendard",
} as const;

// 프로필 사진은 data URL로 인라인한다. OG 렌더러는 별도 네트워크 요청을 하지
// 않으므로 상대 경로나 사이트 URL로는 이미지를 가져오지 못한다.
export function loadProfile() {
  const file = path.join(process.cwd(), "public", "images", "profile.png");
  const buffer = fs.readFileSync(file);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export function avatarStyle(px: number) {
  return {
    width: px,
    height: px,
    borderRadius: 9999,
    objectFit: "cover",
  } as const;
}

export function ogImage(node: ReactElement) {
  const font = fs.readFileSync(
    path.join(process.cwd(), "public", "fonts", "Pretendard-Bold.otf")
  );
  return new ImageResponse(node, {
    ...OG_SIZE,
    fonts: [{ name: "Pretendard", data: font, weight: 700, style: "normal" }],
  });
}
