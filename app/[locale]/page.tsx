import { Container } from "@/components/ui/container";
import { ProfileSection } from "@/components/ProfileSection/ProfileSection";
import { IntroParagraph } from "@/components/home/IntroParagraph";
import { BackgroundSection } from "@/components/home/BackgroundSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { WritingSection } from "@/components/home/WritingSection";
import { HomeTabsProvider, HomeMainColumn, ReadEssaysCTA } from "@/components/home/HomeTabs";
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
      {/* max-w-wide(1200px): 기본 Container 폭(max-w-content, 600px)은 글 본문
          읽기 폭이라 사이드바+본문 2컬럼이 들어갈 자리가 없다. 좁은 채로 두면
          grid의 1fr 트랙이 오른쪽 컬럼 내용 크기만큼 억지로 넓어지며 컨테이너
          밖으로 흘러넘쳐, 중앙정렬 박스는 좁은데 콘텐츠만 오른쪽으로 삐져나와
          보이는 비대칭이 생긴다. /columns 같은 다른 목록형 페이지와 같은 폭을
          쓴다. */}
      <Container className="max-w-wide">
        {/* lg 미만: 세로 스택(프로필 → 이력 → 만든 것 → 글, 전부 항상 보임).
            lg 이상: 왼쪽 사이드바(프로필+이력+만든 것)가 오른쪽(자기소개+글)과
            나란히 놓인다. 접어서 숨기지 않는다 — 대신 사이드바 쪽 목록은
            간격을 좁혀 좁은 화면에서도 스크롤 부담이 크지 않게 한다.
            minmax(0,1fr): 1fr 트랙은 기본적으로 내용의 최소 크기 밑으로
            줄어들지 않아, 오른쪽 컬럼이 길면 grid 전체가 넘친다. 0을 최소값으로
            줘서 필요하면 안의 텍스트가 줄바꿈되며 폭 안에 갇히게 한다.
            max-w-content(600px)+mx-auto: 오른쪽 컬럼을 1fr이 주는 만큼(container가
            넓을수록 계속 커짐) 다 쓰지 않는다 — 글 피드 카드가 화면 너비만큼
            늘어나면 타임라인이 아니라 배너처럼 보인다. 사이트의 읽기 폭과
            같은 값으로 고정하고 남는 공간은 컬럼 안에서 양옆 여백으로 둔다. */}
        {/* HomeTabsProvider가 사이드바의 CTA(ReadEssaysCTA)와 오른쪽 컬럼
            (HomeMainColumn)의 공통 조상이다 — 둘 다 이 grid 밑에서만 같은
            탭 상태를 공유할 수 있다. */}
        <HomeTabsProvider>
          <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-3">
              <div className="rounded-lg border border-border bg-surface p-3">
                <ProfileSection githubData={githubData} locale={locale} />
              </div>

              <div className="rounded-lg border border-border bg-surface p-3">
                <BackgroundSection locale={locale} compact />
              </div>

              <div className="rounded-lg border border-border bg-surface p-3">
                <ProductsSection locale={locale} compact />
              </div>

              <ReadEssaysCTA />
            </div>

            <div className="mt-12 lg:mt-0 lg:max-w-content">
              <HomeMainColumn
                intro={<IntroParagraph locale={locale} />}
                essays={<WritingSection locale={locale} />}
              />
            </div>
          </div>
        </HomeTabsProvider>
      </Container>
    </main>
  );
}
