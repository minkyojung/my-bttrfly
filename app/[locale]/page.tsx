import { Container } from "@/components/ui/container";
import { IntroParagraph } from "@/components/home/IntroParagraph";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";

// 홈은 자기소개 문단 하나다. 문장 속 명사에 박힌 아이콘이 각 상세 페이지로 가는
// 입구이고, 그래서 별도의 메뉴가 없다.
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

  return (
    <main className="min-h-screen bg-bg pt-32 pb-24">
      <Container>
        <IntroParagraph locale={locale} />
      </Container>
    </main>
  );
}
