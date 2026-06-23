import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";

import "./globals.css";

/** Display font — Fraunces (serif, untuk judul & angka besar) */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

/** Body/UI font — Hanken Grotesk */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Majamu — Diracik Saat Itu Juga",
  description:
    "Jamu modern untuk keluarga profesional dan anak muda. Alami, jujur, terampil. Pesan langsung dari meja Anda.",
};

export const viewport: Viewport = {
  themeColor: "#5B3E2A",
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
