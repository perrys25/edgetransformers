import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    animation: {
      bounce: "bounce 1s infinite",
    },
    keyframes: {
      bounce: {
        "0%, 100%": { transform: "translateY(6px)" },
        "50%": { transform: "translateY(-6px)" },
      },
    },
    extend: {},
  },
  plugins: [require("tailwindcss-animation-delay")],
};
export default config;
