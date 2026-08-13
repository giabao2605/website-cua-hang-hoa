import { getCurrentAuthUser } from "./supabase/server.ts";

export async function requireAdmin() {
  const user = await getCurrentAuthUser();
  if (!user) return { ok: false as const, reason: "unauthenticated" as const };
  if (!user.email_confirmed_at) return { ok: false as const, reason: "unverified" as const };
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) return { ok: false as const, reason: "forbidden" as const };
  return { ok: true as const, user };
}
