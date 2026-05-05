export const siteConfig = {
  url: "https://www.minkyojung.com",
  name: "William Jung",
  alternateName: "Minkyo Jung",
  role: "Founding Engineer at Momo",
  headline: "Building AI Memory at Momo",
  description:
    "Founding engineer at Momo, building AI memory systems. Writing about products, AI, and craft.",
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
