import { aboutContent } from "./about-content";

export const siteConfig = {
  url: "https://www.minkyojung.com",
  name: "William Jung",
  alternateName: "Minkyo Jung",
  role: "Operations × Engineering",
  headline: "Building AI Memory at Momo",
  description:
    "Operations × engineering. Previously led operations at Disquiet (15K → 100K members). Now building flowcap and writing about products & AI.",
  locale: "ko_KR",
  email: "williamjung0130@gmail.com",
  social: {
    twitter: {
      handle: "@imwilliamjung",
      url: "https://x.com/imwilliamjung",
    },
    github: {
      handle: "minkyojung",
      url: "https://github.com/minkyojung",
    },
    substack: "https://williamjung0130.substack.com",
    disquiet: "https://disquiet.io/@williamjung",
  },
  employer: {
    name: "Momo",
    url: "https://usemomo.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function blogPostingSchema(input: {
  title: string;
  slug: string;
  date: string;
  description: string;
  image?: string;
}) {
  const url = `${siteConfig.url}/posts/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    datePublished: input.date,
    dateModified: input.date,
    description: input.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: input.image ? `${siteConfig.url}${input.image}` : undefined,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  } as const;
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    alternateName: siteConfig.alternateName,
    url: siteConfig.url,
    description: aboutContent.intro.join(" "),
    email: `mailto:${siteConfig.email}`,
    knowsAbout: [...aboutContent.stack, ...aboutContent.exploring],
    sameAs: [
      siteConfig.social.twitter.url,
      siteConfig.social.github.url,
      siteConfig.social.substack,
      siteConfig.social.disquiet,
    ],
  } as const;
}

