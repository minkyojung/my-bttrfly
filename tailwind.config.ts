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
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
