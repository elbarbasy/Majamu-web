"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <h1 className="text-2xl font-extrabold text-primary">Terjadi kesalahan</h1>
      <p className="max-w-sm text-sm text-black/60">
        Maaf, ada masalah saat memuat halaman ini.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Coba lagi
      </button>
    </div>
  );
}
