'use client';

import { useState } from 'react';
import { ASCIIHeader } from './ASCIIHeader';
import { ProfileInfo } from './ProfileInfo';
import { GitHubContributions } from './GitHubContributions';
import styles from './ProfileSection.module.css';

export function ProfileSection() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={styles.container}>
      {/* ASCII 헤더 + 프로필 사진 겹침 영역 */}
      <div className={styles.headerWrapper}>
        <ASCIIHeader />
        <div
          className={styles.profilePhoto}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {showTooltip && (
            <div className={styles.tooltip}>
              Scroll down to read my posts
            </div>
          )}
        </div>
      </div>

      {/* 프로필 정보 (이름, 소개) */}
      <ProfileInfo />

      {/* GitHub 잔디 */}
      <GitHubContributions />
    </div>
  );
}
