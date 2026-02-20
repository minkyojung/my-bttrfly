import type { Metadata } from 'next';
import { ProfileSection } from '@/components/ProfileSection/ProfileSection';

export const metadata: Metadata = {
  title: 'About - Minkyo Jung',
  description: 'About Minkyo Jung',
};

export default function AboutPage() {
  return (
    <main style={{
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '44px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <ProfileSection />
      </div>
    </main>
  );
}
