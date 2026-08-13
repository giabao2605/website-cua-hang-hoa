import { assertSameOrigin, consumeRateLimit, getRequestClientKey, parseJsonRequest } from "../../../../lib/api-security";
import { reportMomoPayment } from "../../../../lib/order-store";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const clientKey = `payment-report:${getRequestClientKey(request)}`;
    if (!consumeRateLimit(clientKey, 10, 60 * 60 * 1_000)) {
      return Response.json({ error: { code: "rate_limited", message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." } }, { status: 429 });
    }
    const payload = await parseJsonRequest(request, 4_000);
    const data = await reportMomoPayment(payload);
    return Response.json({ data });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "";
    const forbidden = rawMessage.includes("Nguồn yêu cầu");
    const unavailable = /D1 chưa sẵn sàng/i.test(rawMessage);
    const conflict = /vừa thay đổi|chưa thể/i.test(rawMessage);
    const internalFailure = /SQL|D1|constraint|database/i.test(rawMessage);
    const publicMessage = unavailable || internalFailure
      ? "Chưa thể ghi nhận thanh toán lúc này. Vui lòng thử lại."
      : rawMessage || "Không thể ghi nhận thanh toán lúc này.";
    const serviceUnavailable = unavailable || internalFailure;
    return Response.json({ error: { code: forbidden ? "forbidden_origin" : serviceUnavailable ? "service_unavailable" : conflict ? "payment_conflict" : "payment_report_failed", message: publicMessage } }, { status: forbidden ? 403 : serviceUnavailable ? 503 : conflict ? 409 : 422 });
  }
}
