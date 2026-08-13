import { z } from "zod";
import { normalizeVietnamPhone } from "./commerce.ts";

export const orderStatuses = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

const allowedTransitions: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["delivering", "cancelled"],
  delivering: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (from === to) return;
  if (!allowedTransitions[from].includes(to)) {
    throw new Error(`Không thể chuyển trạng thái đơn từ ${from} sang ${to}.`);
  }
}

const checkoutSchema = z.object({
  buyerName: z.string().trim().min(2).max(80),
  buyerEmail: z.string().trim().toLowerCase().email("Email không hợp lệ.").max(254),
  buyerPhone: z.string().transform(normalizeVietnamPhone),
  recipientName: z.string().trim().min(2).max(80),
  recipientPhone: z.string().transform(normalizeVietnamPhone),
  province: z.string().trim().min(2).max(80),
  locality: z.string().trim().min(2).max(100),
  addressLine: z.string().trim().min(3).max(180),
  deliveryDate: z.iso.date(),
  deliverySlot: z.enum(["08:00-11:00", "11:00-14:00", "14:00-17:00"]),
  paymentMethod: z.enum(["COD", "MOMO"]),
  note: z.string().trim().max(500).default(""),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

const momoPaymentReportSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^TF[A-Z0-9]{10,20}$/),
  idempotencyKey: z.string().trim().regex(/^[0-9a-f-]{20,64}$/i),
});

export function validateCheckout(input: CheckoutInput, now = new Date()): CheckoutData {
  const value = checkoutSchema.parse(input);
  const todayInVietnam = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  if (value.deliveryDate < todayInVietnam) {
    throw new Error("Vui lòng chọn ngày giao từ hôm nay trở đi.");
  }
  return value;
}

export function validateMomoPaymentReport(input: unknown) {
  const parsed = momoPaymentReportSchema.safeParse(input);
  if (!parsed.success) throw new Error("Yêu cầu xác nhận thanh toán không hợp lệ.");
  return parsed.data;
}
