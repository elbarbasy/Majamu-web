import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette (DESIGN_SYSTEM.md)
        primary: {
          DEFAULT: "#7A5230",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#D8B98A",
          foreground: "#3F2A16",
        },
        accent: {
          DEFAULT: "#7FA36B",
          foreground: "#FFFFFF",
        },
        background: "#F8F5EF",
        surface: "#FFFFFF",
        success: "#2E7D32",
        warning: "#ED6C02",
        error: "#D32F2F",
      },
      borderRadius: {
        // DESIGN_SYSTEM.md radius scale
        card: "16px",
        modal: "24px",
        btn: "14px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        "sheet-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "sheet-out": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "panel-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "sheet-in": "sheet-in 0.28s ease-out",
        "sheet-out": "sheet-out 0.2s ease-in",
        "panel-in": "panel-in 0.25s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
