import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        forest: "rgb(var(--color-forest) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
      },
      animation: {
        "pulse-slow": "pulse-slow 2.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
