import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import {
  loadProfile,
  avatarStyle,
  ogImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
  OG_ROOT_STYLE,
} from "@/lib/og";

export const alt = "Post cover";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function PostOpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return ogImage(
    <div
      style={{
        ...OG_ROOT_STYLE,
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src={loadProfile()} alt="" style={avatarStyle(72)} />
        <div style={{ display: "flex", fontSize: 28, color: "#e5e5e5" }}>
          {siteConfig.name}
        </div>
      </div>

      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          display: "flex",
          maxWidth: 1000,
        }}
      >
        {post.title}
      </div>

      <div style={{ display: "flex", fontSize: 24, color: "#888888" }}>
        {formatDate(post.date)}
      </div>
    </div>
  );
}
