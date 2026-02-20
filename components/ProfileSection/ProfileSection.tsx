'use client';

import { ASCIIHeader } from './ASCIIHeader';
import { ProfileInfo } from './ProfileInfo';
import { GitHubContributions } from './GitHubContributions';
import styles from './ProfileSection.module.css';

export function ProfileSection() {
  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <ASCIIHeader />
        <div className={styles.profilePhoto} />
      </div>

      <ProfileInfo />

      <GitHubContributions />
    </div>
  );
}
