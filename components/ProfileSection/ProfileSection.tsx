import Image from "next/image";
import { ProfileInfo } from "./ProfileInfo";
import { GitHubActivity } from "./GitHubActivity";
import { GitHubContributions } from "./GitHubContributions";
import type { GitHubData } from "@/lib/github";
import { siteConfig } from "@/lib/site-config";
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
      {/* 예전엔 이 사진이 ASCII 캔버스 위로 겹쳐 올라가느라 grid + 음수 마진이
          필요했다. 캔버스가 사라졌으므로 그냥 위에 놓는다. */}
      <div className="w-28 h-28 mb-5 rounded-full border border-border-strong bg-surface-elevated overflow-hidden max-[640px]:w-20 max-[640px]:h-20">
        <Image
          src="/images/profile.png"
          alt={`${siteConfig.name} profile photo`}
          width={112}
          height={112}
          priority
          className="w-full h-full object-cover block"
        />
      </div>

      <ProfileInfo locale={locale} />

      <GitHubContributions data={githubData} />

      {githubData && (
        <div className="mt-2">
          <GitHubActivity data={githubData} locale={locale} />
        </div>
      )}
    </header>
  );
}
