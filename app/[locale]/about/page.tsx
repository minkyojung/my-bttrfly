import type { Metadata } from "next";
import { getGitHubData } from "@/lib/github";
import { ProfileSection } from "@/components/ProfileSection/ProfileSection";
import { AboutSection } from "@/components/AboutSection";
import { Container } from "@/components/ui/container";
import { siteConfig, alternatesFor } from "@/lib/site-config";
import { DEFAULT_LOCALE, LOCALES, isLocale, localePath } from "@/lib/i18n";
import { getStrings } from "@/lib/ui-strings";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return {
    title: getStrings(locale).nav.about,
    description: siteConfig.description,
    alternates: alternatesFor(locale, "/about"),
    openGraph: {
      title: getStrings(locale).nav.about,
      url: localePath(locale, "/about"),
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const githubData = await getGitHubData();

  return (
    <main className="min-h-screen bg-bg pt-16 pb-24">
      <Container>
        <ProfileSection githubData={githubData} locale={locale} />

        <section className="mt-16">
          <AboutSection />
        </section>
      </Container>
    </main>
  );
}
