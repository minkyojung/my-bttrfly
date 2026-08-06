import type { Locale } from "./i18n";

// 화면에 보이는 문구의 단일 출처.
//
// 값이 아니라 함수로 노출한다 — 어순이 언어마다 다르므로 조각을 호출부에서
// 이어붙이면(`{n}` + "편") 번역할 수 없는 형태가 된다. 문장 전체를 여기서 만든다.
//
// Strings 인터페이스가 두 사전을 강제로 맞춰준다. en에 키를 추가하고 ko를 빠뜨리면
// 런타임에 undefined가 새는 게 아니라 typecheck가 먼저 실패한다.
//
// 글 본문과 프론트매터는 여기 들어오지 않는다. 그건 콘텐츠지 UI가 아니다.
interface Strings {
  nav: {
    about: string;
    // 언어 토글이 가리키는 '반대편' 언어의 이름.
    switchTo: string;
    backHome: string;
  };
  // 아직 내용을 쓰지 않은 상세 페이지의 자리 문구.
  comingSoon: string;
  post: {
    uncategorized: string;
    moreIn: (category: string) => string;
  };
  column: {
    count: (n: number) => string;
    seeAll: (total: number) => string;
  };
  github: {
    languageList: (names: string[]) => string;
    summary: (total: string, languages: string) => string;
  };
}

const ko: Strings = {
  nav: {
    about: "소개",
    switchTo: "EN",
    backHome: "← 처음으로",
  },
  comingSoon: "아직 쓰는 중입니다.",
  post: {
    uncategorized: "글",
    moreIn: (category) => `${category} 더 보기`,
  },
  column: {
    count: (n) => `${n}편`,
    seeAll: (total) => `전체 ${total}편 →`,
  },
  github: {
    languageList: (names) => names.join(", "),
    summary: (total, languages) =>
      languages
        ? `지난 1년간 ${total}회 기여 — 주로 ${languages}.`
        : `지난 1년간 ${total}회 기여`,
  },
};

const en: Strings = {
  nav: {
    about: "About",
    switchTo: "KO",
    backHome: "← Back home",
  },
  comingSoon: "Still writing this one.",
  post: {
    uncategorized: "Writing",
    moreIn: (category) => `More in ${category}`,
  },
  column: {
    count: (n) => `${n} posts`,
    seeAll: (total) => `All ${total} posts →`,
  },
  github: {
    languageList: (names) =>
      names.length < 2 ? (names[0] ?? "") : `${names[0]} and ${names[1]}`,
    summary: (total, languages) =>
      languages
        ? `${total} contributions in the last year — primarily ${languages}.`
        : `${total} contributions in the last year`,
  },
};

const DICTIONARIES: Record<Locale, Strings> = { ko, en };

export function getStrings(locale: Locale): Strings {
  return DICTIONARIES[locale];
}
