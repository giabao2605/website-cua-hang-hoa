import { findPublicOrder } from "../../../../lib/order-store";
import { assertSameOrigin, consumeRateLimit, getRequestClientKey, parseJsonRequest } from "../../../../lib/api-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const clientKey = `track:${getRequestClientKey(request)}`;
    if (!consumeRateLimit(clientKey, 30, 15 * 60 * 1_000)) {
      return Response.json({ error: { message: "Bạn đã tra cứu quá nhiều lần. Vui lòng thử lại sau." } }, { status: 429 });
    }
    const body = await parseJsonRequest<{ code?: unknown; phone?: unknown }>(request, 4_000);
    if (typeof body.code !== "string" || typeof body.phone !== "string") throw new Error();
    const order = await findPublicOrder(body.code, body.phone);
    if (!order) return Response.json({ error: { message: "Không tìm thấy đơn hàng với thông tin đã nhập." } }, { status: 404 });
    return Response.json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const forbidden = message.includes("Nguồn yêu cầu");
    const unavailable = /SQL|D1|constraint|database/i.test(message);
    return Response.json({ error: { message: forbidden ? "Yêu cầu không hợp lệ." : unavailable ? "Chưa thể tra cứu đơn lúc này. Vui lòng thử lại." : "Không tìm thấy đơn hàng với thông tin đã nhập." } }, { status: forbidden ? 403 : unavailable ? 503 : 404 });
  }
}
