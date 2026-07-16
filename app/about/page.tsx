import type { Metadata } from "next";
import { getGitHubData } from "@/lib/github";
import { ProfileSection } from "@/components/ProfileSection/ProfileSection";
import { AboutSection } from "@/components/AboutSection";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
};

export default async function AboutPage() {
  const githubData = await getGitHubData();

  return (
    <main className="min-h-screen bg-bg pt-16 pb-24">
      <Container>
        <ProfileSection githubData={githubData} />

        <section className="mt-16">
          <AboutSection />
        </section>
      </Container>
    </main>
  );
}
