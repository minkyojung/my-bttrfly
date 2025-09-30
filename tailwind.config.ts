import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'KoPub Batang'", "'Noto Serif KR'", "'Batang'", "'Georgia'", "serif"],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;