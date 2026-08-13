import type { User } from "@supabase/supabase-js";
import { requireAdmin } from "./admin.ts";
import { assertSameOrigin, consumeRateLimit, getRequestClientKey } from "./api-security.ts";

type AdminAuthorization =
  | Readonly<{ ok: true; user: User }>
  | Readonly<{ ok: false; response: Response }>;

export async function authorizeAdminRequest(request: Request, mutation = true): Promise<AdminAuthorization> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return {
      ok: false,
      response: Response.json(
        { error: { code: admin.reason, message: admin.reason === "unauthenticated" ? "Chưa đăng nhập." : admin.reason === "unverified" ? "Email chưa được xác nhận." : "Không có quyền quản trị." } },
        { status: admin.reason === "unauthenticated" ? 401 : 403 },
      ),
    };
  }
  try {
    if (mutation) assertSameOrigin(request);
  } catch {
    return { ok: false, response: Response.json({ error: { code: "forbidden_origin", message: "Yêu cầu không hợp lệ." } }, { status: 403 }) };
  }
  const key = `admin:${admin.user.id}:${getRequestClientKey(request)}`;
  if (!consumeRateLimit(key, 180, 15 * 60 * 1_000)) {
    return { ok: false, response: Response.json({ error: { code: "rate_limited", message: "Có quá nhiều thao tác quản trị. Vui lòng thử lại sau." } }, { status: 429 }) };
  }
  return { ok: true, user: admin.user };
}

export function adminMutationError(error: unknown): Response {
  const raw = error instanceof Error ? error.message : "";
  const status = /vừa được thay đổi/.test(raw) ? 409 : /không tìm thấy/i.test(raw) ? 404 : 422;
  const message = /SQL|D1|constraint|database/i.test(raw)
    ? "Không thể lưu thay đổi. Kiểm tra dữ liệu trùng lặp và thử lại."
    : raw || "Không thể lưu thay đổi lúc này.";
  return Response.json({ error: { code: "admin_update_failed", message } }, { status });
}
