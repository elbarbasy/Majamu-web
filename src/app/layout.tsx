import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";

import "./globals.css";

/** Display font (judul, angka besar) */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

/** Body / UI font */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Majamu — Jamu Modern",
  description:
    "Pesan jamu modern langsung dari meja Anda dengan memindai QR. Hangat, alami, dan menyehatkan.",
};

export const viewport: Viewport = {
  themeColor: "#5B3A29",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${hanken.variable}`}>
      <body className="min-h-[100dvh] bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
