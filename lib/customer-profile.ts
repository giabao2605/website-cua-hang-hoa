import { z } from "zod";
import { normalizeVietnamPhone } from "./commerce.ts";
import { getD1Binding, requireD1Binding } from "./platform.ts";

export type CustomerProfile = Readonly<{
  fullName: string;
  email: string;
  phone: string;
  address: string;
}>;

export type CustomerIdentity = Readonly<{
  authUserId: string;
  email: string;
  fullName?: string;
}>;

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).transform((value, context) => {
    if (!value) return "";
    try {
      return normalizeVietnamPhone(value);
    } catch {
      context.addIssue({ code: "custom", message: "Số điện thoại không hợp lệ." });
      return z.NEVER;
    }
  }),
  address: z.string().trim().max(240),
}).strict();

export function parseCustomerProfileInput(value: unknown) {
  const parsed = profileSchema.safeParse(value);
  if (!parsed.success) throw new Error("Thông tin hồ sơ không hợp lệ.");
  return parsed.data;
}

export async function getCustomerProfile(identity: CustomerIdentity): Promise<CustomerProfile> {
  const fallback = profileFallback(identity);
  const db = getD1Binding();
  if (!db) return fallback;
  const row = await db.prepare(`
    SELECT full_name, email, phone, address
    FROM profiles
    WHERE disabled = 0 AND (auth_user_id = ? OR email = ?)
    LIMIT 1
  `).bind(identity.authUserId, identity.email.toLowerCase()).first<Record<string, string>>();
  return row ? {
    fullName: row.full_name || fallback.fullName,
    email: row.email,
    phone: row.phone || "",
    address: row.address || "",
  } : fallback;
}

export async function saveCustomerProfile(identity: CustomerIdentity, value: unknown): Promise<CustomerProfile> {
  const input = parseCustomerProfileInput(value);
  const db = requireD1Binding();
  const email = identity.email.toLowerCase();
  const existing = await db.prepare("SELECT id, disabled FROM profiles WHERE auth_user_id = ? OR email = ? LIMIT 1")
    .bind(identity.authUserId, email)
    .first<Record<string, string | number>>();
  const now = new Date().toISOString();
  if (existing) {
    if (existing.disabled) throw new Error("Tài khoản này hiện không thể cập nhật hồ sơ.");
    const result = await db.prepare(`
      UPDATE profiles
      SET auth_user_id = ?, email = ?, full_name = ?, phone = ?, address = ?, updated_at = ?
      WHERE id = ? AND disabled = 0
    `).bind(identity.authUserId, email, input.fullName, input.phone, input.address, now, String(existing.id)).run();
    if (Number(result.meta.changes ?? 0) !== 1) throw new Error("Không thể cập nhật hồ sơ lúc này.");
  } else {
    await db.prepare(`
      INSERT INTO profiles (id, auth_user_id, email, full_name, phone, address, role, disabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'customer', 0, ?, ?)
    `).bind(crypto.randomUUID(), identity.authUserId, email, input.fullName, input.phone, input.address, now, now).run();
  }
  return { ...input, email };
}

function profileFallback(identity: CustomerIdentity): CustomerProfile {
  return {
    fullName: identity.fullName?.trim() || identity.email.split("@", 1)[0],
    email: identity.email.toLowerCase(),
    phone: "",
    address: "",
  };
}
