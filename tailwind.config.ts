import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        gold: "#F59E0B",
        bg: {
          DEFAULT: "#02020a",
          2: "#0a0a0f",
          3: "#0f0f18",
        },
      },
    },
  },
  plugins: [],
};

export default config;
