import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Clinical Atelier — Monochrome Spectrum */
        surface: {
          DEFAULT: "#f9f9f9",
          low: "#f3f3f3",
          container: "#eeeeee",
          high: "#e2e2e2",
          bright: "#ffffff",
        },
        on: {
          surface: "#1a1c1c",
          "surface-variant": "#474747",
          "surface-muted": "#7a7a7a",
        },
        outline: {
          DEFAULT: "#c6c6c6",
          light: "rgba(198, 198, 198, 0.2)",
          medium: "rgba(198, 198, 198, 0.35)",
        },
        primary: {
          DEFAULT: "#000000",
          on: "#e5e2e1",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "0.125rem",
        md: "0.375rem",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tight: "-0.02em",
        wide: "0.05em",
        wider: "0.1em",
      },
    },
  },
  plugins: [],
};

export default config;