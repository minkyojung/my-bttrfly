import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
        },
        fg: {
          DEFAULT: "var(--color-fg)",
          muted: "var(--color-fg-muted)",
          subtle: "var(--color-fg-subtle)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        accent: {
          warm: "var(--color-accent-warm)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      maxWidth: {
        content: "var(--content-width)",
        wide: "var(--front-page-width)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "'KoPub Batang'", "'Noto Serif KR'", "'Batang'", "'Georgia'", "serif"],
      },
      // 글 본문의 타이포그래피 단일 출처. 본문을 렌더하는 곳이 `prose` 하나만
      // 붙이면 같은 모습이 되도록 여기에 모아둔다. 예전에는 크기·간격이 발행
      // 페이지의 클래스 문자열에 흩어져 있어서 화면마다 결과가 달랐다.
      // 폭·최소높이 같은 '배치'는 위치마다 달라야 하므로 각 호출부에 남긴다.
      typography: (theme: (path: string) => string[]) => ({
        DEFAULT: {
          css: {
            fontFamily: theme("fontFamily.serif").join(", "),
            fontSize: "18px",
            lineHeight: "1.7",
            fontWeight: "400",
            // 폭은 각 화면이 정한다(발행 페이지는 max-w-content로 제한).
            // 플러그인 기본값 65ch가 끼어들지 않게 푼다.
            maxWidth: "none",

            "h1, h2, h3, h4, h5, h6": { fontWeight: "900" },
            h1: {
              fontSize: "1.875rem",
              lineHeight: "2.25rem",
              marginTop: "2.5rem",
              marginBottom: "1.5rem",
            },
            h2: {
              fontSize: "1.5rem",
              lineHeight: "2rem",
              marginTop: "2rem",
              marginBottom: "1rem",
            },
            h3: {
              fontSize: "1.25rem",
              lineHeight: "1.75rem",
              marginTop: "1.5rem",
              marginBottom: "0.75rem",
            },
            p: { marginBottom: "0.5rem" },
            blockquote: {
              borderLeftWidth: "2px",
              paddingLeft: "1rem",
              fontStyle: "italic",
              marginBottom: "0.5rem",
            },
            // 플러그인이 인용문 앞뒤에 따옴표를 자동으로 넣는다. 좌측 선과
            // 기울임으로 이미 구분되므로 지운다(인라인 코드의 백틱과 같은 경우).
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:last-of-type::after": { content: "none" },
            ul: {
              listStyleType: "disc",
              paddingLeft: "1.25rem",
              marginBottom: "0.5rem",
            },
            ol: {
              listStyleType: "decimal",
              paddingLeft: "1.25rem",
              marginBottom: "0.5rem",
            },
            // 위아래를 모두 지정한다. 한쪽만 지정하면 플러그인 기본값(marginTop
            // 0.5em)이 남아 실제 간격을 그쪽이 결정해 버린다.
            li: { marginTop: "0.125rem", marginBottom: "0.125rem" },
            "li > ul, li > ol": {
              marginTop: "0.125rem",
              marginBottom: "0.125rem",
            },
            // 항목 사이에 빈 줄을 넣으면 마크다운이 각 항목을 <p>로 감싼다.
            // 그대로 두면 같은 목록이 작성 방식에 따라 5배 다른 간격으로 보이므로,
            // 감싸진 경우에도 위와 같은 간격이 되게 맞춘다.
            "li p": { marginTop: "0.125rem", marginBottom: "0.125rem" },
            "li > p:first-child": { marginTop: "0.125rem" },
            "li > p:last-child": { marginBottom: "0.125rem" },
            hr: { marginTop: "2rem", marginBottom: "2rem" },
            code: {
              // 배경이 있어야 좌우 여백이 의미를 갖는다(예전엔 여백만 있고
              // 배경이 없어 아무 구분도 되지 않았다).
              backgroundColor: "var(--color-surface)",
              paddingLeft: "0.25rem",
              paddingRight: "0.25rem",
              borderRadius: "var(--radius-sm)",
              // em이라 주변 글자 크기를 따라간다. 고정 크기면 본문 18px 옆에서
              // 유독 작아 보이고, 제목 안에 들어갈 때도 어긋난다.
              fontSize: "0.9em",
            },
            // 플러그인이 인라인 코드 앞뒤에 백틱 문자를 넣는다. 배경으로 이미
            // 구분되므로 지운다.
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            pre: {
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
            },
            a: {
              textDecorationLine: "underline",
              "&:hover": { opacity: "0.6" },
            },

            // 이미지. max-width(100%)라서 본문보다 크면 줄어들고 작으면 원본
            // 크기를 지킨다 — width:100%로 두면 작은 스크린샷이 억지로 늘어나
            // 흐려진다. 비율은 어떤 경우에도 브라우저가 알아서 지킨다.
            img: {
              display: "block",
              maxWidth: "100%",
              height: "auto",
              borderRadius: "var(--radius-md)",
            },

            // 표. 플러그인 기본값은 가로선만 긋는 신문 기사 스타일인데,
            // 셀 경계가 보이는 격자 모양을 쓴다(remark-gfm이 표를 켜둔다).
            table: {
              borderCollapse: "collapse",
              tableLayout: "auto",
              width: "100%",
              marginTop: "1rem",
              marginBottom: "1rem",
            },
            // 선택자를 'table th, table td'로 적는 이유: 'th, td'는 플러그인에도
            // 있는 키라 병합되면서 그 자리(앞쪽)에 놓이고, 뒤에 오는 플러그인의
            // 세부 규칙(tbody td, 양끝 셀 여백 0 등)에 덮인다. 플러그인에 없는
            // 선택자를 쓰면 뒤에 출력되어 의도대로 적용된다.
            "table th, table td": {
              border: "1px solid var(--color-border-strong)",
              padding: "6px 10px",
              verticalAlign: "top",
              textAlign: "left",
            },
            "table th": {
              backgroundColor: "var(--color-surface)",
              fontWeight: "700",
            },
            // 셀 안의 문단은 표 높이를 키우지 않도록 마진을 없앤다.
            "table th p, table td p": { marginTop: "0", marginBottom: "0" },
            // 아래는 플러그인의 기본 표 스타일을 무력화하는 것들이다. 그대로 두면
            // 셀 격자 위에 가로선이 겹치고, 양끝 셀의 안쪽 여백이 0이 된다.
            thead: { borderBottomWidth: "0" },
            "tbody tr": { borderBottomWidth: "0" },

            // 강조(굵게·링크·코드·인용)는 본문과 같은 밝기로 둔다. 굵기·밑줄·
            // 배경이 이미 구분 역할을 하므로, 대비까지 낮추면 강조하려던 것이
            // 오히려 본문보다 흐려진다. fg-muted는 날짜·캡션처럼 덜 중요한 것에 쓴다.
            "--tw-prose-headings": "var(--color-fg)",
            "--tw-prose-body": "var(--color-fg)",
            "--tw-prose-bold": "var(--color-fg)",
            "--tw-prose-quotes": "var(--color-fg)",
            "--tw-prose-quote-borders": "var(--color-fg)",
            "--tw-prose-links": "var(--color-fg)",
            "--tw-prose-code": "var(--color-fg)",
            "--tw-prose-pre-code": "var(--color-fg)",
            // 페이지 배경과 같은 색이면 블록이 전혀 구분되지 않는다.
            "--tw-prose-pre-bg": "var(--color-surface)",
            "--tw-prose-borders": "var(--color-surface-elevated)",
            "--tw-prose-counters": "var(--color-fg)",
            "--tw-prose-bullets": "var(--color-fg)",
            "--tw-prose-hr": "var(--color-fg-subtle)",
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
