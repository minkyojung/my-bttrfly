import { ASCIIHeader } from "./ASCIIHeader";
import { ProfileInfo } from "./ProfileInfo";
import { GitHubActivity } from "./GitHubActivity";
import { GitHubContributions } from "./GitHubContributions";
import type { GitHubData } from "@/lib/github";
import styles from "./ProfileSection.module.css";

interface ProfileSectionProps {
  githubData: GitHubData | null;
}

export function ProfileSection({ githubData }: ProfileSectionProps) {
  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <ASCIIHeader />
        <div className={styles.profilePhoto} />
      </div>

      <ProfileInfo />

      <GitHubContributions data={githubData} />

      {githubData && (
        <div className="mt-2">
          <GitHubActivity data={githubData} />
        </div>
      )}
    </div>
  );
}
