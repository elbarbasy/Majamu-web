import { OwnerShell } from "@/components/owner/owner-shell";

/** Shell modul Owner — desktop layout modern (sidebar + konten). */
export default function OwnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <OwnerShell>{children}</OwnerShell>;
}
