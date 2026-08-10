import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, isLocale, localePath } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// /about은 홈으로 흡수됐다 — 프로필·이력·만든 것·글이 전부 홈에 있다.
// 라우트를 지우지 않고 남겨두는 이유: 밖에서 이미 걸린 링크가 404가 되지 않게
// 하려는 것뿐이다. 여기에 내용을 다시 넣지 말 것.
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  permanentRedirect(localePath(isLocale(raw) ? raw : DEFAULT_LOCALE, "/"));
}
