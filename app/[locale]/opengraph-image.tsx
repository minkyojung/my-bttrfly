import { siteConfig } from "@/lib/site-config";
import { LOCALES } from "@/lib/i18n";
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

// 카드 그림에 로케일별 차이는 없지만, [locale] 아래 있으므로 조합을 선언해야
// 정적으로 생성된다.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

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
