import { assertSameOrigin, consumeRateLimit, getRequestClientKey, parseJsonRequest } from "../../../lib/api-security";
import { subscribeNewsletter } from "../../../lib/engagement-store";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!consumeRateLimit(`newsletter:${getRequestClientKey(request)}`, 10, 24 * 60 * 60 * 1_000)) {
      return Response.json({ error: { message: "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau." } }, { status: 429 });
    }
    const payload = await parseJsonRequest(request, 2_000);
    const data = await subscribeNewsletter(payload);
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    const forbidden = error instanceof Error && error.message.includes("Nguồn yêu cầu");
    const message = error instanceof Error && !/SQL|D1|database/i.test(error.message) ? error.message : "Không thể đăng ký nhận tin lúc này.";
    return Response.json({ error: { message: forbidden ? "Yêu cầu không hợp lệ." : message } }, { status: forbidden ? 403 : 422 });
  }
}
