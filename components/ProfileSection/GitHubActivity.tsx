import type { GitHubData } from "@/lib/github";

interface GitHubActivityProps {
  data: GitHubData | null;
}

function formatLanguageList(languages: GitHubData["topLanguages"]): string {
  const top = languages.slice(0, 2).map((l) => l.name);
  if (top.length === 0) return "";
  if (top.length === 1) return top[0];
  return `${top[0]} and ${top[1]}`;
}

export function GitHubActivity({ data }: GitHubActivityProps) {
  if (!data) return null;

  const total = data.totalContributions.toLocaleString("en-US");
  const languages = formatLanguageList(data.topLanguages);

  return (
    <p className="text-fg-muted text-[15px] font-normal leading-[1.6]">
      {total} contributions in the last year
      {languages && ` — primarily ${languages}.`}
    </p>
  );
}
