import { z } from "zod";
import { normalizeVietnamPhone } from "./commerce.ts";

const optionalEmail = z.union([
  z.literal(""),
  z.string().trim().toLowerCase().email("Email không hợp lệ.").max(254),
]).optional();

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().transform(normalizeVietnamPhone),
  email: optionalEmail,
  occasion: z.enum(["Sinh nhật", "Kỷ niệm", "Chúc mừng", "Hoa cưới / sự kiện", "Khác"]),
  message: z.string().trim().min(10).max(1_000),
  website: z.string().max(0),
});

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email không hợp lệ.").max(254),
  consent: z.literal(true),
  website: z.string().max(0),
});

export function parseContactRequest(value: unknown) {
  const parsed = contactSchema.safeParse(value);
  if (!parsed.success) throw new Error("Yêu cầu tư vấn không hợp lệ. Vui lòng kiểm tra lại thông tin.");
  return parsed.data;
}

export function parseNewsletterSubscription(value: unknown) {
  const parsed = newsletterSchema.safeParse(value);
  if (!parsed.success) throw new Error("Đăng ký nhận tin không hợp lệ.");
  return parsed.data;
}
