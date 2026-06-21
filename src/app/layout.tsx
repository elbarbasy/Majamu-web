import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Majamu — Jamu Modern",
  description:
    "Pesan jamu modern langsung dari meja Anda dengan memindai QR. Hangat, alami, dan menyehatkan.",
};

export const viewport: Viewport = {
  themeColor: "#7A5230",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-[100dvh] bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
