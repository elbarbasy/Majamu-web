import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-amber-50", "bg-blue-50", "bg-orange-50", "bg-green-50", "bg-gray-50", "bg-red-50",
    "bg-amber-100", "bg-blue-100", "bg-orange-100", "bg-green-100", "bg-gray-100", "bg-red-100",
    "bg-amber-400", "bg-gray-400",
    "bg-amber-500", "bg-blue-500", "bg-blue-600", "bg-orange-500", "bg-green-500",
    "bg-green-600", "bg-gray-500", "bg-red-600",
    "text-amber-700", "text-amber-800", "text-blue-800", "text-orange-800",
    "text-green-700", "text-green-800", "text-gray-700", "text-red-600", "text-red-700",
    "border-amber-300", "border-amber-400", "border-amber-500",
    "border-blue-300", "border-blue-600", "border-orange-300", "border-orange-500",
    "border-green-300", "border-green-600", "border-gray-300", "border-gray-500",
    "border-red-100", "border-red-400", "border-red-600",
    "ring-amber-100", "ring-amber-200", "ring-red-100", "ring-red-200",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Majamu — identitas final.
        primary: { DEFAULT: "#5B3E2A", foreground: "#FFFFFF" },       // Mocca Brown
        secondary: { DEFAULT: "#E6AA2C", foreground: "#3A2A12" },     // Turmeric Gold
        accent: { DEFAULT: "#7E9F6E", foreground: "#FFFFFF" },        // Herbal Green
        background: "#F6F1E6",                                         // Milk Cream
        surface: "#FFFFFF",
        gold: "#E6AA2C",                                               // Turmeric Gold
        success: "#6B9A63",
        warning: "#E6AA2C",
        danger: "#C86A5A",
        error: "#C86A5A",
        ink: "#2D2D2D",
        muted: "#8C8C8C",
        line: "#E8E0D0",
      },
      fontFamily: {
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
        display: [
          "var(--font-display)",
          "Fraunces",
          "ui-serif",
          "Georgia",
          "serif",
        ],
      },
      borderRadius: {
        card: "24px",
        modal: "28px",
        btn: "16px",
        input: "16px",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(91, 62, 42, 0.18)",
        "soft-sm": "0 4px 16px -8px rgba(91, 62, 42, 0.16)",
        "soft-lg": "0 24px 60px -24px rgba(91, 62, 42, 0.30)",
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
