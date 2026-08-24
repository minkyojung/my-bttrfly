import { Container } from "@/components/ui/container";
import { ProfileSection } from "@/components/ProfileSection/ProfileSection";
import { IntroParagraph } from "@/components/home/IntroParagraph";
import { BackgroundSection } from "@/components/home/BackgroundSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { WritingSection } from "@/components/home/WritingSection";
import { getGitHubData } from "@/lib/github";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";

// 홈이 곧 포트폴리오다 — 프로필(사진·잔디), 자기소개 문단, 이력, 만든 것, 글.
// /about은 여기로 흡수됐고 홈으로 리다이렉트한다.
//
// 자기소개 문단은 장식이 아니라 네비게이션이다 — 문장 속 명사에 박힌 아이콘이
// 각 상세 페이지로 가는 유일한 입구다. MoreLinks(하단 "더 보기")를 지우면서
// unlisted 항목(how-i-work, now)이 이 문단에마저 안 걸려 있으면 사이트 어디서도
// 안 보이게 된다 — 지금 이 둘이 그 상태다.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const githubData = await getGitHubData();

  return (
    <main className="min-h-screen bg-bg pt-24 pb-24">
      <Container>
        <ProfileSection githubData={githubData} locale={locale} />

        <div className="mt-12">
          <IntroParagraph locale={locale} />
        </div>

        <div className="mt-14">
          <BackgroundSection locale={locale} />
          <ProductsSection locale={locale} />
          <WritingSection locale={locale} />
        </div>
      </Container>
    </main>
  );
}
