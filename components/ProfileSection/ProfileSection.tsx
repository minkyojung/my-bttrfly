import Image from "next/image";
import { ASCIIHeader } from "./ASCIIHeader";
import { ProfileInfo } from "./ProfileInfo";
import { GitHubActivity } from "./GitHubActivity";
import { GitHubContributions } from "./GitHubContributions";
import type { GitHubData } from "@/lib/github";
import { siteConfig } from "@/lib/site-config";

interface ProfileSectionProps {
  githubData: GitHubData | null;
}

export function ProfileSection({ githubData }: ProfileSectionProps) {
  return (
    <header className="w-full max-w-content mx-auto max-[640px]:px-4">
      <div className="grid grid-rows-[auto_auto] grid-cols-[1fr_auto] [&>:first-child]:[grid-area:1/1/3/3]">
        <ASCIIHeader />
        <div className="row-start-2 col-start-2 self-end mr-3 -mb-12 w-28 h-28 rounded-full border border-[rgba(255,255,255,0.15)] bg-surface-elevated z-10 relative overflow-hidden max-[640px]:w-20 max-[640px]:h-20">
          <Image
            src="/images/profile.png"
            alt={`${siteConfig.name} profile photo`}
            width={112}
            height={112}
            priority
            className="w-full h-full object-cover block"
          />
        </div>
      </div>

      <ProfileInfo />

      <GitHubContributions data={githubData} />

      {githubData && (
        <div className="mt-2">
          <GitHubActivity data={githubData} />
        </div>
      )}
    </header>
  );
}
