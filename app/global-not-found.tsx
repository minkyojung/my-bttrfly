import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { NotFoundContent } from "@/components/NotFoundContent";
import { DEFAULT_LOCALE, HTML_LANG } from "@/lib/i18n";

// 어떤 라우트에도 걸리지 않은 주소를 받는다.
//
// 이 앱에는 app/layout.tsx가 없다 — <html lang>을 로케일마다 바꾸려고
// [locale]/layout.tsx를 루트 레이아웃으로 삼았기 때문이다. 루트 레이아웃이 없으면
// 루트 not-found도 둘 수 없어서 Next 기본 404(흰 배경에 다른 폰트)가 그대로 나갔다.
// global-not-found는 자기 문서를 직접 그리므로 그 제약을 받지 않는다.
//
// lang은 기본 로케일로 둔다. 어디에도 걸리지 않은 주소라 로케일을 알 수 없고,
// 본문은 어차피 두 언어를 나란히 보여준다.
const serif = Noto_Serif_KR({
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang={HTML_LANG[DEFAULT_LOCALE]} className={serif.variable}>
      <body className="antialiased">
        <NotFoundContent />
      </body>
    </html>
  );
}
