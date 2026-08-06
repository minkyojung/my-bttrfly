import type { Metadata } from "next";
import { EntryPageShell } from "@/components/EntryPageShell";
import { getEntry, entryMetadata } from "@/lib/nav-entries";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";

const ENTRY = getEntry("bookclub");

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

export default async function BookClubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return <EntryPageShell entry={ENTRY} locale={locale} />;
}
