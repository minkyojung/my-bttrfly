import { getAllPosts } from "@/lib/markdown";
import { siteConfig } from "@/lib/site-config";
import { aboutContent } from "@/lib/about-content";

export const dynamic = "force-static";

function formatPostLine(input: {
  title: string;
  url: string;
  date: string;
  summary?: string;
}): string {
  const head = `- [${input.title}](${input.url}) (${input.date})`;
  return input.summary ? `${head}\n  ${input.summary}` : head;
}

export async function GET() {
  const posts = await getAllPosts();
  const selfHosted = posts.filter((p) => !p.external);
  const external = posts.filter((p) => p.external);

  const sections: string[] = [];

  sections.push(`# ${siteConfig.alternateName}`);
  sections.push("");
  sections.push(`> ${siteConfig.description}`);
  sections.push("");
  sections.push(...aboutContent.intro);
  sections.push("");

  sections.push("## Background");
  for (const item of aboutContent.background) {
    sections.push(`- ${item.period}: ${item.role}`);
  }
  sections.push("");

  sections.push("## Selected work");
  for (const item of aboutContent.selectedWork) {
    sections.push(`- [${item.name}](${item.url}): ${item.description}`);
  }
  sections.push("");

  sections.push("## Stack");
  sections.push(aboutContent.stack.join(", "));
  sections.push("");

  sections.push("## Currently exploring");
  sections.push(aboutContent.exploring.join(", "));
  sections.push("");

  if (selfHosted.length > 0) {
    sections.push("## Writing (on this site)");
    for (const post of selfHosted) {
      sections.push(
        formatPostLine({
          title: post.title,
          url: `${siteConfig.url}/posts/${post.slug}`,
          date: post.date,
          summary: post.summary,
        })
      );
    }
    sections.push("");
  }

  if (external.length > 0) {
    sections.push("## Writing (external)");
    for (const post of external) {
      sections.push(
        formatPostLine({
          title: post.title,
          url: post.external!,
          date: post.date,
          summary: post.summary,
        })
      );
    }
    sections.push("");
  }

  sections.push("## Links");
  sections.push(`- Twitter: ${siteConfig.social.twitter.url}`);
  sections.push(`- GitHub: ${siteConfig.social.github.url}`);
  sections.push(`- Substack: ${siteConfig.social.substack}`);
  sections.push(`- Disquiet: ${siteConfig.social.disquiet}`);
  sections.push(`- Email: ${siteConfig.email}`);
  sections.push("");

  return new Response(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
