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
        // Majamu — herbal wellness premium.
        primary: { DEFAULT: "#5B3A29", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#E0B973", foreground: "#3A2A12" },
        accent: { DEFAULT: "#7E9F6E", foreground: "#FFFFFF" },
        background: "#FCFAF7",
        surface: "#FFFFFF",
        success: "#7E9F6E",
        warning: "#C98A1E",
        error: "#D14343",
        gold: "#E0B973",
        ink: "#2D2D2D", // text
        muted: "#8C8C8C", // text-secondary
        line: "#ECE6DD", // soft warm border
      },
      borderRadius: {
        card: "24px",
        modal: "28px",
        btn: "16px",
        input: "16px",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(91, 58, 41, 0.18)",
        "soft-sm": "0 4px 16px -8px rgba(91, 58, 41, 0.16)",
        "soft-lg": "0 24px 60px -24px rgba(91, 58, 41, 0.30)",
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
        "panel-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "sheet-in": "sheet-in 0.32s cubic-bezier(0.22,1,0.36,1)",
        "panel-in-right": "panel-in-right 0.3s cubic-bezier(0.22,1,0.36,1)",
        "fade-in": "fade-in 0.2s ease-out",
        "pop-in": "pop-in 0.25s cubic-bezier(0.22,1,0.36,1)",
        "rise-in": "rise-in 0.35s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
