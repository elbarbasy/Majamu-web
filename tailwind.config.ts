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
        success: "#6B9A63",
        warning: "#E0B973",
        danger: "#C86A5A",
        error: "#C86A5A",
        gold: "#E0B973",
        ink: "#2D2D2D", // text
        muted: "#8C8C8C", // text-secondary
        line: "#ECE6DD", // soft warm border
      },
      fontFamily: {
        // Body / UI
        sans: [
          "var(--font-body)",
          "Hanken Grotesk",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        // Display
        display: ["var(--font-display)", "Fraunces", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        micro: ["12px", { lineHeight: "16px" }],
        lead: ["19px", { lineHeight: "26px" }],
        title: ["23px", { lineHeight: "30px" }],
        page: ["28px", { lineHeight: "34px" }],
        display: ["34px", { lineHeight: "40px" }],
        hero: ["44px", { lineHeight: "48px" }],
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
