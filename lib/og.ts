import fs from "node:fs";
import path from "node:path";

export function loadProfile() {
  const file = path.join(process.cwd(), "public", "images", "profile.png");
  const buffer = fs.readFileSync(file);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export function loadFont() {
  const file = path.join(process.cwd(), "public", "fonts", "Pretendard-Bold.otf");
  return fs.readFileSync(file);
}
