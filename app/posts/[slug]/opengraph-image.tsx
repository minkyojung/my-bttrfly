import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function loadProfile() {
  const file = path.join(process.cwd(), "public", "images", "profile.png");
  const buffer = fs.readFileSync(file);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function loadFont() {
  const file = path.join(process.cwd(), "public", "fonts", "Pretendard-Bold.otf");
  return fs.readFileSync(file);
}

export default async function PostOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.title ?? "Post";
  const date = post?.date ? formatDate(post.date) : "";
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
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img
            src={profile}
            width={72}
            height={72}
            style={{
              width: 72,
              height: 72,
              borderRadius: 9999,
              objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", fontSize: 28, color: "#e5e5e5" }}>
            {siteConfig.alternateName}
          </div>
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            display: "flex",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#888888" }}>
          {date}
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
