import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'minkyojung';
const GITHUB_ORG = process.env.GITHUB_ORG; // Optional: filter to specific org

interface GitHubStats {
  username: string;
  totalRepos: number;
  personalRepos: number;
  orgRepos: number;
  totalStars: number;
  topLanguages: Array<{ name: string; count: number; percentage: number }>;
  commitsByMonth: Record<string, number>;
  commitsByDay: Record<string, number>;
  totalCommitsLast3Months: number;
  hourlyActivity: Record<number, number[]>;
  moodAnalysis: Array<{ mood: string; count: number; percentage: number }>;
  collaboration: {
    prOpened: number;
    prMerged: number;
    issuesCreated: number;
    issuesClosed: number;
  };
  codeImpact: {
    additions: number;
    deletions: number;
    netGrowth: number;
    filesChanged: number;
    avgPRAdditions: number;
    avgPRDeletions: number;
  };
  productivity: {
    weeklyAvg: number;
    activeDays: number;
    longestStreak: number;
    currentStreak: number;
  };
  peakCodingHour: {
    hour: number;
    count: number;
  };
  deadHour: {
    hour: number;
    count: number;
  };
  personality: string[];
  organizations: Array<{
    name: string;
    repos: number;
    stars: number;
    commits: number;
    totalCommits: number;
    events: number;
    topRepos: Array<{ name: string; commits: number }>;
  }>;
  personalRepoStats: {
    topRepos: Array<{ name: string; commits: number }>;
    totalCommits: number;
  };
}

// In-memory cache
let cache: { data: GitHubStats; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  owner: {
    login: string;
    type: string;
  };
}

interface GitHubEvent {
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
  payload?: {
    commits?: Array<{ message: string }>;
  };
}

interface GitHubOrganization {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string;
}

export async function GET() {
  // Check cache
  const now = Date.now();
  if (cache && (now - cache.timestamp) < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'bttrfly-blog',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers });
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    // Fetch user's organizations (public orgs)
    const orgsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/orgs`, { headers });
    const organizations: GitHubOrganization[] = await orgsResponse.json();

    // Fetch all repos - use /user/repos for authenticated requests to get org repos
    const reposEndpoint = GITHUB_TOKEN
      ? `https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member`
      : `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

    const reposResponse = await fetch(reposEndpoint, { headers });
    const allRepos: GitHubRepo[] = await reposResponse.json();

    // Filter to only repos where user is involved (for /user/repos endpoint)
    const repos = GITHUB_TOKEN
      ? allRepos
      : allRepos.filter(r => r.owner.login === GITHUB_USERNAME);

    // Fetch recent activity (300 events for better analysis)
    const eventsResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`,
      { headers }
    );
    const events: GitHubEvent[] = await eventsResponse.json();

    // Fetch pull requests
    const searchPRs = await fetch(
      `https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:pr&per_page=100`,
      { headers }
    );
    const prsData = await searchPRs.json();
    const pullRequests = prsData.items || [];

    // Fetch issues
    const searchIssues = await fetch(
      `https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:issue&per_page=100`,
      { headers }
    );
    const issuesData = await searchIssues.json();
    const issues = issuesData.items || [];

    // Filter data to specific org if GITHUB_ORG is set
    const filteredRepos = GITHUB_ORG
      ? repos.filter(r => r.owner.login === GITHUB_ORG || r.owner.login === GITHUB_USERNAME)
      : repos;

    const filteredEvents = GITHUB_ORG
      ? events.filter(e => e.repo.name.startsWith(`${GITHUB_ORG}/`) || e.repo.name.startsWith(`${GITHUB_USERNAME}/`))
      : events;

    interface GitHubItem {
      repository_url: string;
      user?: { login: string };
      merged_at?: string | null;
      closed_at?: string | null;
    }

    const filteredPRs = GITHUB_ORG
      ? pullRequests.filter((pr: GitHubItem) => pr.repository_url.includes(`/${GITHUB_ORG}/`) || pr.repository_url.includes(`/${GITHUB_USERNAME}/`))
      : pullRequests;

    const filteredIssues = GITHUB_ORG
      ? issues.filter((issue: GitHubItem) => issue.repository_url.includes(`/${GITHUB_ORG}/`) || issue.repository_url.includes(`/${GITHUB_USERNAME}/`))
      : issues;

    // Calculate basic stats
    const totalStars = filteredRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    // Separate personal and org repos
    const personalRepos = filteredRepos.filter(r => r.owner.login === GITHUB_USERNAME);
    const orgRepos = filteredRepos.filter(r => r.owner.type === 'Organization');

    // Group repos by organization
    const reposByOrg: { [orgName: string]: GitHubRepo[] } = {};
    orgRepos.forEach(repo => {
      const orgName = repo.owner.login;
      if (!reposByOrg[orgName]) {
        reposByOrg[orgName] = [];
      }
      reposByOrg[orgName].push(repo);
    });

    // Group events by organization
    const eventsByOrg: { [orgName: string]: GitHubEvent[] } = {};
    filteredEvents.forEach(event => {
      // Check if event is from an org repo
      const repoFullName = event.repo.name;
      const repoOwner = repoFullName.split('/')[0];
      if (organizations.some((org) => org.login === repoOwner)) {
        if (!eventsByOrg[repoOwner]) {
          eventsByOrg[repoOwner] = [];
        }
        eventsByOrg[repoOwner].push(event);
      }
    });

    // Language breakdown
    const languageCounts: { [key: string]: number } = {};
    filteredRepos.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });

    const totalReposWithLang = Object.values(languageCounts).reduce((a, b) => a + b, 0);
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalReposWithLang) * 100)
      }));

    // Commits analysis
    const pushEvents = filteredEvents.filter(e => e.type === 'PushEvent');

    // Activity by month (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const last3MonthsEvents = filteredEvents.filter(e => new Date(e.created_at) > threeMonthsAgo);

    const commitsByMonth: { [key: string]: number } = {};
    pushEvents.forEach(event => {
      const date = new Date(event.created_at);
      if (date > threeMonthsAgo) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const commits = event.payload?.commits?.length || 1;
        commitsByMonth[monthKey] = (commitsByMonth[monthKey] || 0) + commits;
      }
    });

    // Daily commits for contribution graph (last 3 months)
    const commitsByDay: { [key: string]: number } = {};
    pushEvents.forEach(event => {
      const date = new Date(event.created_at);
      if (date > threeMonthsAgo) {
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const commits = event.payload?.commits?.length || 1;
        commitsByDay[dateKey] = (commitsByDay[dateKey] || 0) + commits;
      }
    });

    // Calculate streaks and productivity metrics
    const sortedDates = Object.keys(commitsByDay).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check current streak (from today backwards)
    const checkDate = new Date();
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (commitsByDay[dateKey]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const activeDays = sortedDates.length;
    const weeklyAvg = activeDays > 0 ? Math.round((Object.values(commitsByDay).reduce((a, b) => a + b, 0) / activeDays) * 7) : 0;

    // Time-based heatmap (hour x day of week)
    const heatmapData: { [key: string]: number } = {};
    last3MonthsEvents.forEach(event => {
      const date = new Date(event.created_at);
      const hour = date.getHours();
      const dayOfWeek = date.getDay(); // 0 = Sunday
      const key = `${dayOfWeek}-${hour}`;
      heatmapData[key] = (heatmapData[key] || 0) + 1;
    });

    // Hour distribution for heatmap display
    const hourlyActivity: { [key: number]: number[] } = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };

    for (let day = 0; day < 7; day++) {
      const hours = [6, 9, 12, 15, 18, 21, 0, 3]; // Representative hours
      hourlyActivity[day] = hours.map(hour => heatmapData[`${day}-${hour}`] || 0);
    }

    // Commit message mood analysis
    const moodKeywords = {
      feature: ['feat', 'add', 'new', 'implement', '✨', '🎉'],
      bugfix: ['fix', 'bug', 'issue', 'error', '🐛', '🔧'],
      refactor: ['refactor', 'clean', 'improve', 'update', '♻️', '⚡'],
      docs: ['doc', 'readme', 'comment', '📝', '📚'],
    };

    const moodCounts = {
      feature: 0,
      bugfix: 0,
      refactor: 0,
      docs: 0,
      other: 0,
    };

    pushEvents.forEach(event => {
      const commits = event.payload?.commits || [];
      commits.forEach((commit) => {
        const message = (commit.message || '').toLowerCase();
        let matched = false;

        for (const [mood, keywords] of Object.entries(moodKeywords)) {
          if (keywords.some(kw => message.includes(kw))) {
            moodCounts[mood as keyof typeof moodCounts]++;
            matched = true;
            break;
          }
        }

        if (!matched) {
          moodCounts.other++;
        }
      });
    });

    const totalMoodCommits = Object.values(moodCounts).reduce((a, b) => a + b, 0);
    const moodAnalysis = Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: totalMoodCommits > 0 ? Math.round((count / totalMoodCommits) * 100) : 0
      }))
      .filter(m => m.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);

    // Collaboration network
    const prOpened = filteredPRs.filter((pr: GitHubItem) => pr.user?.login === GITHUB_USERNAME).length;
    const prMerged = filteredPRs.filter((pr: GitHubItem) => pr.merged_at !== null).length;
    const issuesCreated = filteredIssues.filter((issue: GitHubItem) => issue.user?.login === GITHUB_USERNAME).length;
    const issuesClosed = filteredIssues.filter((issue: GitHubItem) => issue.closed_at !== null).length;

    // Code impact (estimate from events)
    let totalAdditions = 0;
    let totalDeletions = 0;
    pushEvents.forEach(event => {
      // Estimate based on commit count (rough approximation)
      const commits = event.payload?.commits?.length || 1;
      totalAdditions += commits * 50; // Rough estimate
      totalDeletions += commits * 20; // Rough estimate
    });

    // Peak coding hours
    const hourCounts: { [key: number]: number } = {};
    last3MonthsEvents.forEach(event => {
      const hour = new Date(event.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];
    const deadHour = Object.entries(Array.from({ length: 24 }, (_, i) => [i.toString(), hourCounts[i] || 0]))
      .sort((a, b) => (a[1] as number) - (b[1] as number))[0];

    // Personality traits (same as before)
    const personality: string[] = [];

    const nightActivity = (hourCounts[22] || 0) + (hourCounts[23] || 0) + (hourCounts[0] || 0) + (hourCounts[1] || 0);
    const morningActivity = (hourCounts[6] || 0) + (hourCounts[7] || 0) + (hourCounts[8] || 0) + (hourCounts[9] || 0);
    const afternoonActivity = (hourCounts[14] || 0) + (hourCounts[15] || 0) + (hourCounts[16] || 0) + (hourCounts[17] || 0);

    if (nightActivity > morningActivity && nightActivity > afternoonActivity) {
      personality.push('🌙 Night Owl');
    } else if (morningActivity > nightActivity && morningActivity > afternoonActivity) {
      personality.push('🌅 Early Bird');
    } else {
      personality.push('☀️ Day Worker');
    }

    const dayOfWeekCounts: { [key: number]: number } = {};
    last3MonthsEvents.forEach(event => {
      const dayOfWeek = new Date(event.created_at).getDay();
      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
    });

    const weekendActivity = (dayOfWeekCounts[0] || 0) + (dayOfWeekCounts[6] || 0);
    const weekdayActivity = Object.entries(dayOfWeekCounts)
      .filter(([day]) => parseInt(day) !== 0 && parseInt(day) !== 6)
      .reduce((sum, [, count]) => sum + count, 0);

    if (weekendActivity > weekdayActivity * 0.4) {
      personality.push('🏖️ Weekend Warrior');
    } else {
      personality.push('💼 Weekday Grinder');
    }

    const eventTypeCounts: { [key: string]: number } = {};
    last3MonthsEvents.forEach(event => {
      eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
    });

    const prActivity = eventTypeCounts['PullRequestEvent'] || 0;
    const issueActivity = eventTypeCounts['IssuesEvent'] || 0;
    const pushActivity = eventTypeCounts['PushEvent'] || 0;

    if (prActivity + issueActivity > pushActivity * 0.3) {
      personality.push('🤝 Team Player');
    } else {
      personality.push('🚀 Solo Builder');
    }

    // Calculate personal repo stats (in parallel)
    const personalRepoStats: { name: string; commits: number }[] = [];
    let totalPersonalCommits = 0;

    const personalRepoPromises = personalRepos.map(async (repo) => {
      try {
        const contributorsRes = await fetch(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contributors?per_page=100`,
          { headers }
        );
        if (contributorsRes.ok) {
          const contributors = await contributorsRes.json();
          const userContributions = contributors.find((c: { login: string; contributions: number }) => c.login === GITHUB_USERNAME);
          if (userContributions) {
            return {
              name: repo.name,
              commits: userContributions.contributions,
            };
          }
        }
      } catch {
        // Silently fail for individual repos
      }
      return null;
    });

    const personalResults = await Promise.all(personalRepoPromises);
    personalResults.forEach(result => {
      if (result) {
        personalRepoStats.push(result);
        totalPersonalCommits += result.commits;
      }
    });
    personalRepoStats.sort((a, b) => b.commits - a.commits);

    // Calculate organization-specific stats with actual commit counts
    const organizationStats = await Promise.all(
      Object.entries(reposByOrg)
        .filter(([orgName]) => !GITHUB_ORG || orgName === GITHUB_ORG) // Filter to specific org if set
        .map(async ([orgName, orgReposList]) => {
          const orgEvents = eventsByOrg[orgName] || [];
          const orgPushEvents = orgEvents.filter(e => e.type === 'PushEvent');
          const orgCommitsLast3Months = orgPushEvents
            .filter(e => new Date(e.created_at) > threeMonthsAgo)
            .reduce((sum, e) => sum + (e.payload?.commits?.length || 1), 0);

          const orgStars = orgReposList.reduce((sum, repo) => sum + repo.stargazers_count, 0);

          // Fetch actual total commits from each repo (in parallel)
          const repoPromises = orgReposList.map(async (repo) => {
            try {
              const contributorsRes = await fetch(
                `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contributors?per_page=100`,
                { headers }
              );
              if (contributorsRes.ok) {
                const contributors = await contributorsRes.json();
                const userContributions = contributors.find((c: { login: string; contributions: number }) => c.login === GITHUB_USERNAME);
                if (userContributions) {
                  return {
                    name: repo.name,
                    commits: userContributions.contributions,
                  };
                }
              }
            } catch {
              // Silently fail for individual repos
            }
            return null;
          });

          const repoResults = await Promise.all(repoPromises);
          const repoContributions: { name: string; commits: number }[] = [];
          let totalCommits = 0;

          repoResults.forEach(result => {
            if (result) {
              repoContributions.push(result);
              totalCommits += result.commits;
            }
          });

          // Sort repos by commit count
          repoContributions.sort((a, b) => b.commits - a.commits);

          return {
            name: orgName,
            repos: orgReposList.length,
            stars: orgStars,
            commits: orgCommitsLast3Months,
            totalCommits, // All-time commits
            events: orgEvents.length,
            topRepos: repoContributions.slice(0, 5), // Top 5 repos by commits
          };
        })
    );

    organizationStats.sort((a, b) => b.totalCommits - a.totalCommits); // Sort by total commits

    // Calculate files changed estimate
    const filesChanged = pushEvents.reduce((sum, event) => {
      const commits = event.payload?.commits?.length || 1;
      return sum + (commits * 8); // Estimate ~8 files per commit
    }, 0);

    // Calculate average PR size
    const avgPRAdditions = totalAdditions / (prOpened || 1);
    const avgPRDeletions = totalDeletions / (prOpened || 1);

    const stats = {
      username: GITHUB_USERNAME,
      totalRepos: filteredRepos.length,
      personalRepos: personalRepos.length,
      orgRepos: orgRepos.length,
      totalStars,
      topLanguages,
      commitsByMonth,
      commitsByDay,
      totalCommitsLast3Months: pushEvents.filter(e => new Date(e.created_at) > threeMonthsAgo).length,
      hourlyActivity,
      moodAnalysis,
      collaboration: {
        prOpened,
        prMerged,
        issuesCreated,
        issuesClosed,
      },
      codeImpact: {
        additions: totalAdditions,
        deletions: totalDeletions,
        netGrowth: totalAdditions - totalDeletions,
        filesChanged,
        avgPRAdditions: Math.round(avgPRAdditions),
        avgPRDeletions: Math.round(avgPRDeletions),
      },
      productivity: {
        weeklyAvg,
        activeDays,
        longestStreak,
        currentStreak,
      },
      peakCodingHour: {
        hour: parseInt(peakHour?.[0] || '0'),
        count: parseInt(peakHour?.[1]?.toString() || '0'),
      },
      deadHour: {
        hour: parseInt(deadHour?.[0] || '0'),
        count: parseInt(deadHour?.[1]?.toString() || '0'),
      },
      personality,
      organizations: organizationStats,
      personalRepoStats: {
        topRepos: personalRepoStats.slice(0, 5),
        totalCommits: totalPersonalCommits,
      },
    };

    // Save to cache
    cache = {
      data: stats,
      timestamp: Date.now(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('GitHub API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch GitHub stats', details: errorMessage },
      { status: 500 }
    );
  }
}
