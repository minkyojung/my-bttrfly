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
      },
      fontFamily: {
        serif: ["'KoPub Batang'", "'Noto Serif KR'", "'Batang'", "'Georgia'", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
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
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
