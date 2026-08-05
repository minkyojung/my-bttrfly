import { aboutContent } from "./about-content";

export const siteConfig = {
  url: "https://www.minkyojung.com",
  name: "William Jung",
  alternateName: "Minkyo Jung",
  role: "Operator × Engineer",
  description:
    "Operator × engineer. Previously led operations at Disquiet, growing the community from 15,000 to 100,000 members. Now building independent products and writing about products & AI.",
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
} as const;

// 글 주소는 여기서만 만든다. 목록·본문은 상대 경로(postPath), sitemap과
// 구조화 데이터는 절대 URL(postUrl)이 필요하다 — lib/columns.ts와 같은 형태.
export const postPath = (slug: string) => `/posts/${slug}`;
export const postUrl = (slug: string) => `${siteConfig.url}${postPath(slug)}`;

export function blogPostingSchema(input: {
  title: string;
  slug: string;
  date: string;
  description: string;
  image?: string;
  canonicalUrl?: string;
}) {
  const url = input.canonicalUrl ?? postUrl(input.slug);
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

