import { aboutContent } from "./about-content";
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from "./i18n";

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

// canonical + hreflang을 한 번에 만든다.
//
// 둘을 따로 두면 안 되는 이유: Next의 메타데이터는 최상위 키 단위로 덮어쓴다.
// 하위 페이지가 alternates.canonical만 지정하면 부모의 alternates.languages가
// 통째로 날아가 hreflang이 사라진다. 그래서 두 값을 항상 함께 만든다.
export function alternatesFor(locale: Locale, path: string) {
  const urlFor = (l: Locale) => `${siteConfig.url}${localePath(l, path)}`;

  return {
    canonical: urlFor(locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, urlFor(l)])),
      // 어느 언어에도 해당하지 않는 방문자에게 보여줄 판. 없으면 검색엔진이
      // 임의로 고르고, 그 선택은 우리가 통제할 수 없다.
      "x-default": urlFor(DEFAULT_LOCALE),
    },
  };
}

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

