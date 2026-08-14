import { z } from "zod";
import { isAdminEmail } from "./admin-access.ts";
import { getD1Binding } from "./platform.ts";
import { createSupabaseAdminClient } from "./supabase/admin.ts";

export type AdminAccount = Readonly<{
  id: string;
  email: string;
  fullName: string;
  phone: string;
  provider: string;
  createdAt: string;
  lastSignInAt: string;
  disabled: boolean;
  isAdmin: boolean;
}>;

export type AdminAccountList = Readonly<{
  accounts: readonly AdminAccount[];
  ready: boolean;
  truncated: boolean;
}>;

type ProfileRow = Record<string, string | number | null>;

const updateSchema = z.object({ disabled: z.boolean() }).strict();
const deletionSchema = z.object({ confirmEmail: z.string().trim().toLowerCase().email().max(254) }).strict();
const accountIdSchema = z.string().uuid();

export function parseAdminAccountUpdate(value: unknown) {
  const parsed = updateSchema.safeParse(value);
  if (!parsed.success) throw new Error("Dữ liệu tài khoản không hợp lệ.");
  return parsed.data;
}

export function parseAdminAccountDeletion(value: unknown) {
  const parsed = deletionSchema.safeParse(value);
  if (!parsed.success) throw new Error("Xác nhận xóa tài khoản không hợp lệ.");
  return parsed.data;
}

export function isAccountDisabled(bannedUntil?: string, now = Date.now()) {
  return Boolean(bannedUntil && Date.parse(bannedUntil) > now);
}

export function assertAccountManageable(targetId: string, actorId: string, targetEmail: string) {
  if (targetId === actorId) throw new Error("Bạn không thể khóa chính mình.");
  if (targetEmail && isAdminEmail(targetEmail)) throw new Error("Không thể thay đổi trạng thái tài khoản quản trị.");
}

export async function listAdminAccounts(): Promise<AdminAccountList> {
  const client = createSupabaseAdminClient();
  if (!client) return { accounts: [], ready: false, truncated: false };
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1_000 });
  if (error) return { accounts: [], ready: false, truncated: false };

  const profiles = await listProfiles();
  const byAuthId = new Map(profiles.map((profile) => [String(profile.auth_user_id), profile]));
  const byEmail = new Map(profiles.map((profile) => [String(profile.email).toLowerCase(), profile]));
  const accounts = data.users.map((user): AdminAccount => {
    const email = user.email?.toLowerCase() ?? "";
    const profile = byAuthId.get(user.id) ?? byEmail.get(email);
    const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
    return {
      id: user.id,
      email,
      fullName: String(profile?.full_name ?? "").trim() || metadataName || email.split("@", 1)[0] || "Khách hàng",
      phone: String(profile?.phone ?? user.phone ?? ""),
      provider: String(user.app_metadata?.provider ?? "email"),
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? "",
      disabled: isAccountDisabled(user.banned_until) || Boolean(profile?.disabled),
      isAdmin: Boolean(email && isAdminEmail(email)),
    };
  }).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return { accounts, ready: true, truncated: Number(data.total ?? accounts.length) > accounts.length };
}

export async function setAdminAccountDisabled(targetId: string, actorId: string, value: unknown) {
  if (!accountIdSchema.safeParse(targetId).success) throw new Error("Mã tài khoản không hợp lệ.");
  const input = parseAdminAccountUpdate(value);
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Dịch vụ xác thực chưa sẵn sàng.");
  const { data: current, error: readError } = await client.auth.admin.getUserById(targetId);
  if (readError || !current.user) throw new Error("Không tìm thấy tài khoản.");
  const email = current.user.email?.toLowerCase() ?? "";
  assertAccountManageable(targetId, actorId, email);
  const previousDisabled = isAccountDisabled(current.user.banned_until);
  const { error: updateError } = await client.auth.admin.updateUserById(targetId, {
    ban_duration: input.disabled ? "876000h" : "none",
  });
  if (updateError) throw new Error("Không thể cập nhật trạng thái xác thực.");

  try {
    const db = getD1Binding();
    if (db) await db.prepare("UPDATE profiles SET disabled = ?, updated_at = ? WHERE auth_user_id = ? OR email = ?")
      .bind(input.disabled ? 1 : 0, new Date().toISOString(), targetId, email)
      .run();
  } catch {
    await client.auth.admin.updateUserById(targetId, { ban_duration: previousDisabled ? "876000h" : "none" });
    throw new Error("Không thể đồng bộ trạng thái tài khoản.");
  }
  return { id: targetId, disabled: input.disabled } as const;
}

export async function deleteAdminAccount(targetId: string, actorId: string, value: unknown) {
  if (!accountIdSchema.safeParse(targetId).success) throw new Error("Mã tài khoản không hợp lệ.");
  const input = parseAdminAccountDeletion(value);
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Dịch vụ xác thực chưa sẵn sàng.");
  const { data: current, error: readError } = await client.auth.admin.getUserById(targetId);
  if (readError || !current.user) throw new Error("Không tìm thấy tài khoản.");
  const email = current.user.email?.toLowerCase() ?? "";
  assertAccountManageable(targetId, actorId, email);
  if (!email || input.confirmEmail !== email) throw new Error("Email xác nhận không khớp với tài khoản.");

  const db = getD1Binding();
  const profile = db ? await db.prepare("SELECT id, auth_user_id, email, full_name, phone, address, disabled, updated_at FROM profiles WHERE auth_user_id = ? OR email = ? LIMIT 1")
    .bind(targetId, email)
    .first<ProfileRow>() : null;
  if (db && profile) {
    const result = await db.prepare("UPDATE profiles SET auth_user_id = ?, email = ?, full_name = 'Tài khoản đã xóa', phone = '', address = '', disabled = 1, updated_at = ? WHERE id = ?")
      .bind(`deleted:${targetId}`, `deleted-${targetId}@invalid.local`, new Date().toISOString(), String(profile.id))
      .run();
    if (Number(result.meta.changes ?? 0) !== 1) throw new Error("Không thể ẩn danh hồ sơ tài khoản.");
  }

  const { error: deleteError } = await client.auth.admin.deleteUser(targetId);
  if (deleteError) {
    if (db && profile) await restoreProfile(db, profile);
    throw new Error("Không thể xóa tài khoản xác thực.");
  }
  return { id: targetId } as const;
}

async function listProfiles(): Promise<readonly ProfileRow[]> {
  const db = getD1Binding();
  if (!db) return [];
  try {
    const result = await db.prepare("SELECT auth_user_id, email, full_name, phone, disabled FROM profiles").all<ProfileRow>();
    return result.results;
  } catch {
    return [];
  }
}

async function restoreProfile(db: D1Database, profile: ProfileRow) {
  await db.prepare("UPDATE profiles SET auth_user_id = ?, email = ?, full_name = ?, phone = ?, address = ?, disabled = ?, updated_at = ? WHERE id = ?")
    .bind(profile.auth_user_id, profile.email, profile.full_name, profile.phone, profile.address, profile.disabled, profile.updated_at, profile.id)
    .run();
}
