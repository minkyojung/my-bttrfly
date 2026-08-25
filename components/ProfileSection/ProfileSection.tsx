import { ProfileInfo } from "./ProfileInfo";
import { GitHubContributions } from "./GitHubContributions";
import { StackBadges } from "./StackBadges";
import type { GitHubData } from "@/lib/github";
import type { Locale } from "@/lib/i18n";

interface ProfileSectionProps {
  githubData: GitHubData | null;
  locale: Locale;
}

export function ProfileSection({ githubData, locale }: ProfileSectionProps) {
  return (
    // 좌우 여백과 폭은 감싸는 Container가 정한다 — 여기서 또 정하면 모바일에서
    // 이 블록만 안쪽으로 밀려 다른 섹션과 왼쪽 정렬이 어긋난다.
    <header className="w-full">
      <ProfileInfo locale={locale} />

      <GitHubContributions data={githubData} />

      {/* 기술 스택은 잔디 바로 밑에 둔다 — 둘 다 "무엇으로 어떻게 일하는지"를
          보여주는 같은 종류의 정보라 떨어뜨려 두면 안 된다. 라벨 없이 로고
          배지만 늘어놓는다 — 잔디 바로 아래라는 위치가 이미 그 뜻을 말한다. */}
      <StackBadges />
    </header>
  );
}
