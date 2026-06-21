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
        // Majamu — jamu modern, premium, hangat, natural.
        primary: { DEFAULT: "#8B5E34", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#D9B382", foreground: "#3B2A18" },
        accent: { DEFAULT: "#7DAA65", foreground: "#FFFFFF" },
        background: "#FAF7F2",
        surface: "#FFFFFF",
        success: "#7DAA65",
        warning: "#ED6C02",
        error: "#D32F2F",
        ink: "#2E2E2E", // text primary
        muted: "#6B7280", // text secondary
        line: "#E5E7EB", // border
      },
      borderRadius: {
        card: "24px",
        modal: "28px",
        btn: "16px",
        input: "16px",
      },
      boxShadow: {
        soft: "0 6px 24px -10px rgba(80, 52, 24, 0.18)",
        "soft-sm": "0 2px 10px -4px rgba(80, 52, 24, 0.14)",
        "soft-lg": "0 18px 48px -18px rgba(80, 52, 24, 0.28)",
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
        "panel-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "sheet-in": "sheet-in 0.30s cubic-bezier(0.22,1,0.36,1)",
        "panel-in": "panel-in 0.28s cubic-bezier(0.22,1,0.36,1)",
        "fade-in": "fade-in 0.2s ease-out",
        "pop-in": "pop-in 0.25s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
