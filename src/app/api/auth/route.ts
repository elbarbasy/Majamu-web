import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/auth — placeholder (login ditangani client via Supabase Auth SDK).
 * DELETE /api/auth — placeholder (logout via client).
 */
export async function POST() {
  return NextResponse.json({ message: "Use client SDK signInWithPassword" }, { status: 200 });
}

export async function DELETE() {
  return NextResponse.json({ message: "Use client SDK signOut" }, { status: 200 });
}
