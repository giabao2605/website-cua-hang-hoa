import { deleteAdminAccount, setAdminAccountDisabled } from "../../../../../lib/admin-accounts";
import { requireAdmin } from "../../../../../lib/admin";
import { assertSameOrigin, consumeRateLimit, getRequestClientKey, parseJsonRequest } from "../../../../../lib/api-security";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return Response.json({ error: { code: admin.reason, message: "Không có quyền quản trị." } }, { status: admin.reason === "unauthenticated" ? 401 : 403 });
  try {
    assertSameOrigin(request);
    if (!consumeRateLimit(`admin-account:${admin.user.id}:${getRequestClientKey(request)}`, 30, 15 * 60 * 1_000)) {
      return Response.json({ error: { code: "rate_limited", message: "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau." } }, { status: 429 });
    }
    const { id } = await context.params;
    const result = await setAdminAccountDisabled(id, admin.user.id, await parseJsonRequest(request, 2_000));
    return Response.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật tài khoản.";
    const forbidden = /chính mình|quản trị/.test(message);
    const missing = /Không tìm thấy/.test(message);
    const invalid = /không hợp lệ/.test(message);
    return Response.json({ error: { code: forbidden ? "forbidden" : missing ? "not_found" : invalid ? "invalid_account" : "service_unavailable", message } }, { status: forbidden ? 403 : missing ? 404 : invalid ? 422 : 503 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return Response.json({ error: { code: admin.reason, message: "Không có quyền quản trị." } }, { status: admin.reason === "unauthenticated" ? 401 : 403 });
  try {
    assertSameOrigin(request);
    if (!consumeRateLimit(`admin-account-delete:${admin.user.id}:${getRequestClientKey(request)}`, 10, 15 * 60 * 1_000)) {
      return Response.json({ error: { code: "rate_limited", message: "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau." } }, { status: 429 });
    }
    const { id } = await context.params;
    const result = await deleteAdminAccount(id, admin.user.id, await parseJsonRequest(request, 2_000));
    return Response.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể xóa tài khoản.";
    const forbidden = /chính mình|quản trị/.test(message);
    const missing = /Không tìm thấy/.test(message);
    const invalid = /không hợp lệ|không khớp/.test(message);
    return Response.json({ error: { code: forbidden ? "forbidden" : missing ? "not_found" : invalid ? "invalid_confirmation" : "service_unavailable", message } }, { status: forbidden ? 403 : missing ? 404 : invalid ? 422 : 503 });
  }
}
