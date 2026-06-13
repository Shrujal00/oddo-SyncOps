import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:           "rgb(var(--bg) / <alpha-value>)",
        surface:      "rgb(var(--surface) / <alpha-value>)",
        elevated:     "rgb(var(--elevated) / <alpha-value>)",
        border:       "rgb(var(--border) / <alpha-value>)",
        muted:        "rgb(var(--muted) / <alpha-value>)",
        accent:       "rgb(var(--accent) / <alpha-value>)",
        "accent-hover":  "rgb(var(--accent-hover) / <alpha-value>)",
        "accent-light":  "rgb(var(--accent-light) / <alpha-value>)",
        "text-1":     "rgb(var(--text-1) / <alpha-value>)",
        "text-2":     "rgb(var(--text-2) / <alpha-value>)",
        "text-3":     "rgb(var(--text-3) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
