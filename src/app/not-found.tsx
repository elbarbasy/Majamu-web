import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <h1 className="text-2xl font-extrabold text-primary">Halaman tidak ditemukan</h1>
      <p className="text-sm text-black/60">
        Maaf, halaman yang Anda cari tidak tersedia.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
