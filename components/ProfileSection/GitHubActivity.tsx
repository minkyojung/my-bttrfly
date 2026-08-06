import type { GitHubData } from "@/lib/github";
import { getStrings } from "@/lib/ui-strings";
import { HTML_LANG, type Locale } from "@/lib/i18n";

interface GitHubActivityProps {
  data: GitHubData | null;
  locale: Locale;
}

export function GitHubActivity({ data, locale }: GitHubActivityProps) {
  if (!data) return null;

  const t = getStrings(locale);
  const total = data.totalContributions.toLocaleString(HTML_LANG[locale]);
  const languages = t.github.languageList(
    data.topLanguages.slice(0, 2).map((l) => l.name)
  );

  return (
    <p className="text-fg-muted text-[15px] font-normal leading-[1.6]">
      {t.github.summary(total, languages)}
    </p>
  );
}
