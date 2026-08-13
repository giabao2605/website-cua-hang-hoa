import { createOrder } from "../../../lib/order-store";
import { assertSameOrigin, consumeRateLimit, getRequestClientKey, parseJsonRequest } from "../../../lib/api-security";
import { getCurrentAuthUser } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const clientKey = `checkout:${getRequestClientKey(request)}`;
    if (!consumeRateLimit(clientKey, 12, 60 * 60 * 1_000)) {
      return Response.json({ error: { code: "rate_limited", message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." } }, { status: 429 });
    }
    const payload = await parseJsonRequest<Parameters<typeof createOrder>[0]>(request, 32_000);
    const user = await getCurrentAuthUser();
    const data = await createOrder(payload, user?.email ? {
      authUserId: user.id,
      email: user.email,
      fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
    } : null);
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "";
    const forbidden = rawMessage.includes("Nguồn yêu cầu");
    const publicMessage = /SQL|D1|constraint|database/i.test(rawMessage)
      ? "Không thể tạo đơn lúc này. Vui lòng thử lại."
      : rawMessage || "Vui lòng kiểm tra lại thông tin đặt hoa.";
    const unavailable = /tạm thời không sẵn sàng|D1 chưa sẵn sàng/i.test(rawMessage);
    return Response.json({ error: { code: forbidden ? "forbidden_origin" : unavailable ? "service_unavailable" : "checkout_failed", message: publicMessage } }, { status: forbidden ? 403 : unavailable ? 503 : 422 });
  }
}
