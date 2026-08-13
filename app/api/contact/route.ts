import { assertSameOrigin, consumeRateLimit, getRequestClientKey, parseJsonRequest } from "../../../lib/api-security";
import { createContactRequest } from "../../../lib/engagement-store";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!consumeRateLimit(`contact:${getRequestClientKey(request)}`, 5, 60 * 60 * 1_000)) {
      return Response.json({ error: { message: "Bạn đã gửi nhiều yêu cầu. Vui lòng gọi trực tiếp cho shop hoặc thử lại sau." } }, { status: 429 });
    }
    const payload = await parseJsonRequest(request, 8_000);
    const data = await createContactRequest(payload);
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    const forbidden = error instanceof Error && error.message.includes("Nguồn yêu cầu");
    const message = error instanceof Error && !/SQL|D1|database/i.test(error.message) ? error.message : "Không thể gửi yêu cầu lúc này.";
    return Response.json({ error: { message: forbidden ? "Yêu cầu không hợp lệ." : message } }, { status: forbidden ? 403 : 422 });
  }
}
