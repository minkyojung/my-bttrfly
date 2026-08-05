import { siteConfig } from "@/lib/site-config";
import {
  loadProfile,
  avatarStyle,
  ogImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
  OG_ROOT_STYLE,
} from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${siteConfig.alternateName}`;

export default async function OpengraphImage() {
  return ogImage(
    <div
      style={{
        ...OG_ROOT_STYLE,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
      }}
    >
      <img src={loadProfile()} alt="" style={avatarStyle(200)} />
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
  );
}
