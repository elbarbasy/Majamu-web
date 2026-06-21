"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

import { OwnerSidebar } from "@/components/owner/owner-sidebar";

/**
 * Shell desktop modern modul Owner: sidebar tetap (lg+) + konten lebar.
 * Pada layar kecil, sidebar tampil sebagai drawer (tombol hamburger).
 */
export function OwnerShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Sidebar tetap (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-black/5 bg-surface lg:block">
        <OwnerSidebar />
      </aside>

      {/* Top bar mobile */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-black/5 bg-surface px-4 lg:hidden">
        <button
          onClick={() => setDrawer(true)}
          aria-label="Buka menu"
          className="touch-target flex items-center justify-center rounded-full text-primary hover:bg-primary/10"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-lg font-extrabold text-primary">Majamu Owner</span>
      </header>

      {/* Drawer mobile */}
      {mounted &&
        drawer &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 animate-fade-in bg-black/40"
              onClick={() => setDrawer(false)}
              aria-hidden
            />
            <div className="absolute left-0 top-0 h-full w-72 animate-panel-in bg-surface shadow-2xl">
              <button
                onClick={() => setDrawer(false)}
                aria-label="Tutup"
                className="absolute right-3 top-4 text-black/50"
              >
                <X className="h-5 w-5" />
              </button>
              <OwnerSidebar onNavigate={() => setDrawer(false)} />
            </div>
          </div>,
          document.body
        )}

      {/* Konten */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-screen-xl px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
