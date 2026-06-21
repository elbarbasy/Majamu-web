import { NextResponse } from "next/server";

/**
 * Placeholder handler untuk Route Handlers API.
 *
 * Pada MVP, logika data dijalankan melalui client services (lihat
 * src/services/*) yang memakai Supabase langsung. Endpoint REST ini
 * disediakan sesuai FEATURE_MATRIX.md/ROUTES.md dan akan diisi saat
 * migrasi ke server-side. Sementara mengembalikan 501.
 */
export function notImplemented() {
  return NextResponse.json(
    {
      error: "not_implemented",
      message:
        "Endpoint ini placeholder. Pada MVP, operasi data ditangani via client services (Supabase).",
    },
    { status: 501 }
  );
}
