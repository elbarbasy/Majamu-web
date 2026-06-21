import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Kontainer kartu untuk seksi konten Owner. */
export function SectionCard({
  title,
  action,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-card bg-surface p-5 shadow-sm ring-1 ring-black/5",
        className
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && (
            <h2 className="text-sm font-bold uppercase tracking-wide text-black/60">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
