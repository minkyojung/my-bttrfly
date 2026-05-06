import Image from "next/image";
import { ASCIIHeader } from "./ASCIIHeader";
import { ProfileInfo } from "./ProfileInfo";
import { GitHubActivity } from "./GitHubActivity";
import { GitHubContributions } from "./GitHubContributions";
import type { GitHubData } from "@/lib/github";
import { siteConfig } from "@/lib/site-config";
import styles from "./ProfileSection.module.css";

interface ProfileSectionProps {
  githubData: GitHubData | null;
}

export function ProfileSection({ githubData }: ProfileSectionProps) {
  return (
    <header className={styles.container}>
      <div className={styles.headerWrapper}>
        <ASCIIHeader />
        <div className={styles.profilePhoto}>
          <Image
            src="/images/profile.png"
            alt={`${siteConfig.name} profile photo`}
            width={112}
            height={112}
            priority
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
