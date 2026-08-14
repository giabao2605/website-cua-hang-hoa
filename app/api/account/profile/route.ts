import { assertSameOrigin, consumeRateLimit, getRequestClientKey, parseJsonRequest } from "../../../../lib/api-security";
import { saveCustomerProfile } from "../../../../lib/customer-profile";
import { getCurrentAuthUser } from "../../../../lib/supabase/server";

export async function PATCH(request: Request) {
  const user = await getCurrentAuthUser();
  if (!user) return Response.json({ error: { code: "unauthenticated", message: "Chưa đăng nhập." } }, { status: 401 });
  if (!user.email || !user.email_confirmed_at) return Response.json({ error: { code: "unverified", message: "Email chưa được xác nhận." } }, { status: 403 });
  try {
    assertSameOrigin(request);
    if (!consumeRateLimit(`account-profile:${user.id}:${getRequestClientKey(request)}`, 30, 15 * 60 * 1_000)) {
      return Response.json({ error: { code: "rate_limited", message: "Bạn đã cập nhật quá nhiều lần. Vui lòng thử lại sau." } }, { status: 429 });
    }
    const input = await parseJsonRequest(request, 4_000);
    const profile = await saveCustomerProfile({
      authUserId: user.id,
      email: user.email,
      fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
    }, input);
    return Response.json({ data: { profile } });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    const forbidden = raw.includes("Nguồn yêu cầu");
    const unavailable = /SQL|D1|database|cơ sở dữ liệu/i.test(raw);
    return Response.json({
      error: {
        code: forbidden ? "forbidden_origin" : unavailable ? "service_unavailable" : "invalid_profile",
        message: forbidden ? "Yêu cầu không hợp lệ." : unavailable ? "Không thể cập nhật hồ sơ lúc này." : raw || "Thông tin hồ sơ không hợp lệ.",
      },
    }, { status: forbidden ? 403 : unavailable ? 503 : 422 });
  }
}
