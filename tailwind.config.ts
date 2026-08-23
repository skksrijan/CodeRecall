import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        success: "hsl(var(--success))",
        danger: "hsl(var(--danger))",
        warning: "hsl(var(--warning))",
        text: "hsl(var(--text))",
        "muted-text": "hsl(var(--muted-text))",
        border: "hsl(var(--border))",
      },
    },
  },
  plugins: [],
};
export default config;
