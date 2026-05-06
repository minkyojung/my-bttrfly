import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.alternateName}`;

function loadProfile() {
  const file = path.join(process.cwd(), "public", "images", "profile.png");
  const buffer = fs.readFileSync(file);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function loadFont() {
  const file = path.join(process.cwd(), "public", "fonts", "Pretendard-Bold.otf");
  return fs.readFileSync(file);
}

export default async function OpengraphImage() {
  const profile = loadProfile();
  const fontData = loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          color: "#ffffff",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          fontFamily: "Pretendard",
        }}
      >
        <img
          src={profile}
          width={200}
          height={200}
          style={{
            width: 200,
            height: 200,
            borderRadius: 9999,
            objectFit: "cover",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          {siteConfig.alternateName}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Pretendard",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
