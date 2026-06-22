/**
 * POST /api/auth/profile — ambil profil user by auth_user_id (service_role, bypass RLS).
 * Dipakai sebagai fallback jika client query terhalang RLS saat login.
 * Body: { authUserId: string }
 */
import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { authUserId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { authUserId } = body;
  if (!authUserId) {
    return NextResponse.json({ error: "authUserId_required" }, { status: 400 });
  }

  let supabase: ReturnType<typeof createServiceRoleClient>;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "server_not_configured" }, { status: 501 });
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("name, role, is_active")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json(
      { error: "profile_not_found", detail: error?.message },
      { status: 404 }
    );
  }

  return NextResponse.json({
    name: profile.name,
    role: profile.role,
    is_active: profile.is_active,
  });
}
