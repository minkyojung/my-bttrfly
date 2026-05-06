/**
 * Server-only GitHub data fetcher.
 * Uses Next.js fetch caching (revalidate 24h) so the GraphQL endpoint
 * is hit at most once per day per deployment.
 */

const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const REVALIDATE_SECONDS = 60 * 60 * 24; // 24h

const QUERY = /* GraphQL */ `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          pushedAt
          primaryLanguage {
            name
          }
        }
      }
    }
  }
`;

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubData {
  totalContributions: number;
  days: ContributionDay[];
  topLanguages: { name: string; count: number }[];
}

const LEVEL_MAP: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface RawDay {
  date: string;
  contributionCount: number;
  contributionLevel: keyof typeof LEVEL_MAP;
}

interface RawResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: { contributionDays: RawDay[] }[];
        };
      };
      repositories: {
        nodes: {
          pushedAt: string;
          primaryLanguage: { name: string } | null;
        }[];
      };
    };
  };
  errors?: { message: string }[];
}

export async function getGitHubData(): Promise<GitHubData | null> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) return null;

  let res: Response;
  try {
    res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "minkyojung.com SSR",
      },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const json = (await res.json()) as RawResponse;
  if (!json.data || json.errors) return null;

  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  const days: ContributionDay[] = calendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVEL_MAP[d.contributionLevel] ?? 0,
    }));

  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const languageCounts = new Map<string, number>();
  for (const repo of json.data.user.repositories.nodes) {
    const lang = repo.primaryLanguage?.name;
    if (!lang) continue;
    if (new Date(repo.pushedAt).getTime() < oneYearAgo) continue;
    languageCounts.set(lang, (languageCounts.get(lang) ?? 0) + 1);
  }
  const topLanguages = [...languageCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalContributions: calendar.totalContributions,
    days,
    topLanguages,
  };
}
