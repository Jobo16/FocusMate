import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f7f5ef",
        mist: "#e7eef0",
        moss: "#4d6659",
        coral: "#d86444",
        amber: "#e5a93f"
      },
      boxShadow: {
        sheet: "0 -18px 60px rgba(23, 23, 23, 0.18)"
      }
    }
  },
  plugins: []
} satisfies Config;
