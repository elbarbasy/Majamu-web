/**
 * POST /api/cashiers — buat akun Kasir (PRD: akun kasir dibuat oleh owner).
 * Membuat user Supabase Auth (admin) lalu profil di tabel users (role=cashier).
 * GET/PUT belum diimplementasi (operasi profil ditangani client service).
 */
import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export { notImplemented as GET, notImplemented as PUT } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { name, email, password } = body;
  if (!name || !email || !password) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  let supabase: ReturnType<typeof createServiceRoleClient>;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "server_not_configured" }, { status: 501 });
  }

  // 1) Buat akun Auth (kredensial).
  const { data: created, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr || !created.user) {
    return NextResponse.json(
      { error: "auth_create_failed", message: authErr?.message },
      { status: 400 }
    );
  }

  // 2) Buat profil di tabel users.
  const { data: profile, error: profErr } = await supabase
    .from("users")
    .insert({
      auth_user_id: created.user.id,
      name,
      email,
      role: "cashier",
      is_active: true,
    })
    .select("id, name, email, is_active")
    .single();

  if (profErr || !profile) {
    // Rollback agar tidak ada akun Auth yatim.
    await supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: "profile_create_failed", message: profErr?.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    isActive: profile.is_active ?? true,
  });
}
