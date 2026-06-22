import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Pastikan kelas warna status kasir SELALU di-generate (dipakai via
  // peta string di constants, agar tidak terlewat oleh content scan/cache).
  safelist: [
    // tint header/footer
    "bg-amber-50", "bg-blue-50", "bg-orange-50", "bg-green-50", "bg-gray-50", "bg-red-50",
    // badge bg
    "bg-amber-100", "bg-blue-100", "bg-orange-100", "bg-green-100", "bg-gray-100", "bg-red-100",
    // bar
    "bg-amber-400", "bg-gray-400",
    // solid / dot
    "bg-amber-500", "bg-blue-500", "bg-blue-600", "bg-orange-500", "bg-green-500",
    "bg-green-600", "bg-gray-500", "bg-red-600",
    // text
    "text-amber-700", "text-amber-800", "text-blue-800", "text-orange-800",
    "text-green-700", "text-green-800", "text-gray-700", "text-red-600", "text-red-700",
    // border
    "border-amber-300", "border-amber-400", "border-amber-500",
    "border-blue-300", "border-blue-600", "border-orange-300", "border-orange-500",
    "border-green-300", "border-green-600", "border-gray-300", "border-gray-500",
    "border-red-100", "border-red-400", "border-red-600",
    // ring
    "ring-amber-100", "ring-amber-200", "ring-red-100", "ring-red-200",
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
