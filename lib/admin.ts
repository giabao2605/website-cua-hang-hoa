import { getCurrentAuthUser } from "./supabase/server.ts";
import { hasAdminAccess } from "./admin-access.ts";

export async function requireAdmin() {
  const user = await getCurrentAuthUser();
  if (!user) return { ok: false as const, reason: "unauthenticated" as const };
  if (!user.email_confirmed_at) return { ok: false as const, reason: "unverified" as const };
  if (!hasAdminAccess(user)) return { ok: false as const, reason: "forbidden" as const };
  return { ok: true as const, user };
}
