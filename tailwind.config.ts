import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        coral: "#FF6B4A",
        gold: "#E8B65A",
        cream: "#FBF7F0",
        moss: "#3C6E5A"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      }
    }
  },
  plugins: []
};
export default config;
