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
          subtle: "var(--color-border-subtle)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
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
      // 글 본문의 타이포그래피 단일 출처. 에디터(/write)·미리보기·발행 페이지가
      // 모두 `prose` 하나만 붙이면 같은 모습이 되도록 여기에 모아둔다. 예전에는
      // 크기·간격이 발행 페이지의 클래스 문자열에만 있어서, 글을 쓰는 화면과
      // 실제 발행 결과가 서로 달랐다.
      // 폭·최소높이 같은 '배치'는 위치마다 달라야 하므로 각 호출부에 남긴다.
      typography: (theme: (path: string) => string[]) => ({
        DEFAULT: {
          css: {
            fontFamily: theme("fontFamily.serif").join(", "),
            fontSize: "18px",
            lineHeight: "1.7",
            fontWeight: "400",
            // 폭은 각 화면이 정한다(에디터는 편집 영역을 채우고, 발행 페이지는
            // max-w-content로 제한). 플러그인 기본값 65ch가 끼어들지 않게 푼다.
            maxWidth: "none",

            "h1, h2, h3, h4, h5, h6, th": { fontWeight: "900" },
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
            li: { marginBottom: "0.25rem" },
            hr: { marginTop: "2rem", marginBottom: "2rem" },
            code: {
              paddingLeft: "0.25rem",
              paddingRight: "0.25rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              lineHeight: "1.25rem",
            },
            pre: {
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
            },
            a: {
              textDecorationLine: "underline",
              "&:hover": { opacity: "0.6" },
            },

            "--tw-prose-headings": "var(--color-fg)",
            "--tw-prose-body": "var(--color-fg)",
            "--tw-prose-bold": "var(--color-fg-muted)",
            "--tw-prose-quotes": "var(--color-fg-muted)",
            "--tw-prose-quote-borders": "var(--color-fg)",
            "--tw-prose-links": "var(--color-fg-muted)",
            "--tw-prose-code": "var(--color-fg-muted)",
            "--tw-prose-pre-code": "var(--color-fg-muted)",
            "--tw-prose-pre-bg": "var(--color-bg)",
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
