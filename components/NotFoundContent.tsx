import Link from "next/link";
import { LOCALES, localePath } from "@/lib/i18n";
import { getStrings } from "@/lib/ui-strings";

// 404 화면의 본문.
//
// Next는 404를 그릴 때 어느 로케일에서 났는지 알려주지 않는다. 한쪽 언어를 고르면
// 반대쪽 방문자는 읽지 못하는 안내를 받게 되므로 둘 다 보여주고, 각 언어의 홈으로
// 가는 길을 나란히 둔다. 404는 문장을 읽는 화면이 아니라 나가는 길을 찾는 화면이라
// 두 줄이 나란한 편이 오히려 빠르다.
//
// 두 곳에서 쓴다 — 주소가 어디에도 안 걸렸을 때(app/global-not-found.tsx)와
// 페이지가 notFound()를 불렀을 때(app/[locale]/not-found.tsx).
export function NotFoundContent() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-fg text-[72px] font-bold leading-none tracking-[-0.05em]">
          404
        </h1>

        <div className="mt-6 flex flex-col gap-1">
          {LOCALES.map((locale) => (
            <p
              key={locale}
              lang={locale}
              className="text-fg-muted text-[15px] font-normal"
            >
              {getStrings(locale).notFound}
            </p>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          {LOCALES.map((locale) => (
            <Link
              key={locale}
              href={localePath(locale, "/")}
              hrefLang={locale}
              lang={locale}
              className="text-fg text-[13px] font-medium underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              {getStrings(locale).nav.backHome}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
