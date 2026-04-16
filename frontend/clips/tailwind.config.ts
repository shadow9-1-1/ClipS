import type { Config } from "tailwindcss";

/**
 * Tailwind v4 works primarily via CSS (`@import "tailwindcss"` in `globals.css`).
 * This file documents content paths and allows IDE / tooling to resolve Tailwind.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
