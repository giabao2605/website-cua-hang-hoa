import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { assertSameOrigin } from "../../../../lib/api-security";
export async function POST(request: Request) { try { assertSameOrigin(request); } catch { return Response.json({ error: { message: "Yêu cầu không hợp lệ." } }, { status: 403 }); } const supabase = await createSupabaseServerClient(); if (supabase) await supabase.auth.signOut(); return NextResponse.redirect(new URL("/", request.url), 303); }
