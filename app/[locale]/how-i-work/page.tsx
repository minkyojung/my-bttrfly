import type { Metadata } from "next";
import { EntryPageShell } from "@/components/EntryPageShell";
import { getEntry } from "@/lib/nav-entries";
import { entryMetadata } from "@/lib/site-config";
import { getPageContent } from "@/lib/pages";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";

const ENTRY = getEntry("how-i-work");

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  return entryMetadata(ENTRY, isLocale(raw) ? raw : DEFAULT_LOCALE);
}

export default async function HowIWorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const page = await getPageContent(ENTRY.id, locale);

  return <EntryPageShell entry={ENTRY} locale={locale} page={page} />;
}
