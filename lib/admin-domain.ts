import { z } from "zod";
import { normalizeVietnamPhone } from "./commerce.ts";

const productCategory = z.enum(["Bó hoa", "Giỏ hoa", "Hoa cưới", "Hoa sự kiện"]);
const localImagePath = z.string().trim().regex(/^\/(?:products|media)\/[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp)$/i);

const productInputSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,32}$/),
  slug: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  name: z.string().trim().min(2).max(100),
  subtitle: z.string().trim().min(2).max(160),
  description: z.string().trim().min(20).max(2_000),
  category: productCategory,
  seasonal: z.string().trim().min(2).max(120),
  image: localImagePath,
  gallery: z.array(localImagePath).min(1).max(8),
  occasions: z.array(z.string().trim().min(1).max(60)).min(1).max(12),
  flowers: z.array(z.string().trim().min(1).max(60)).min(1).max(20),
  palette: z.string().trim().min(2).max(80),
  price: z.number().int().min(0).max(100_000_000),
  compareAtPrice: z.number().int().min(0).max(100_000_000).optional().nullable(),
  stock: z.number().int().min(0).max(100_000),
  active: z.boolean(),
  featured: z.boolean(),
  badge: z.string().trim().max(40).optional().nullable(),
});

const shippingUpdateSchema = z.object({
  fee: z.number().int().min(0).max(2_000_000),
  estimate: z.string().trim().min(3).max(100),
  active: z.boolean(),
});

const shippingRuleSchema = shippingUpdateSchema.extend({
  id: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  name: z.string().trim().min(3).max(100),
  kind: z.enum(["locality", "province", "region", "nationwide"]),
  value: z.string().trim().min(2).max(100),
  priority: z.number().int().min(0).max(10_000),
});

const siteSettingsSchema = z.object({
  shopName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().min(3).max(180),
  phone: z.string().transform(normalizeVietnamPhone),
  address: z.string().trim().min(5).max(240),
  openingHours: z.string().trim().min(5).max(160),
  zaloUrl: z.string().trim().url().refine((value) => new URL(value).protocol === "https:"),
  momoNumber: z.string().transform(normalizeVietnamPhone),
  momoOwner: z.string().trim().min(2).max(100),
  codEnabled: z.boolean(),
  momoEnabled: z.boolean(),
}).superRefine((value, context) => {
  if (!value.codEnabled && !value.momoEnabled) {
    context.addIssue({ code: "custom", message: "Cần bật ít nhất một phương thức thanh toán.", path: ["codEnabled"] });
  }
  if (value.momoEnabled && /chờ|xác nhận|placeholder/i.test(value.momoOwner)) {
    context.addIssue({ code: "custom", message: "Cần nhập đúng tên chủ tài khoản MoMo trước khi bật MoMo.", path: ["momoOwner"] });
  }
});

function uniqueClean(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function parseAdminProductInput(value: unknown) {
  const parsed = productInputSchema.safeParse(value);
  if (!parsed.success) throw new Error("Dữ liệu sản phẩm không hợp lệ.");
  return {
    ...parsed.data,
    gallery: uniqueClean(parsed.data.gallery),
    occasions: uniqueClean(parsed.data.occasions),
    flowers: uniqueClean(parsed.data.flowers),
    compareAtPrice: parsed.data.compareAtPrice ?? undefined,
    badge: parsed.data.badge || undefined,
  };
}

export function parseShippingRuleUpdate(value: unknown) {
  const parsed = shippingUpdateSchema.safeParse(value);
  if (!parsed.success) throw new Error("Phí giao hoặc thời gian dự kiến không hợp lệ.");
  return parsed.data;
}

export function parseShippingRuleInput(value: unknown) {
  const parsed = shippingRuleSchema.safeParse(value);
  if (!parsed.success) throw new Error("Dữ liệu tuyến giao không hợp lệ.");
  return parsed.data;
}

export function createShippingRuleId(kind: "locality" | "province" | "region" | "nationwide", value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${kind}-${normalized || "viet-nam"}`;
}

export function parseSiteSettingsInput(value: unknown) {
  const parsed = siteSettingsSchema.safeParse(value);
  if (!parsed.success) {
    const momoError = parsed.error.issues.find((issue) => issue.message.includes("MoMo"));
    if (momoError) throw new Error(momoError.message);
    const paymentError = parsed.error.issues.some((issue) => issue.message.includes("thanh toán"));
    throw new Error(paymentError ? "Cần bật ít nhất một phương thức thanh toán." : "Cấu hình vận hành không hợp lệ.");
  }
  return parsed.data;
}

type PaymentMethod = "COD" | "MOMO";
type PaymentStatus = "cod_pending" | "pending" | "payment_review" | "paid" | "collected" | "rejected";

const paymentTransitions: Readonly<Record<PaymentMethod, Readonly<Partial<Record<PaymentStatus, readonly PaymentStatus[]>>>>> = {
  COD: {
    cod_pending: ["collected", "rejected"],
    collected: [],
    rejected: ["cod_pending"],
  },
  MOMO: {
    pending: ["payment_review", "rejected"],
    payment_review: ["paid", "rejected"],
    paid: [],
    rejected: ["payment_review"],
  },
};

export function assertPaymentTransition(method: PaymentMethod, from: PaymentStatus, to: PaymentStatus) {
  if (from === to) return;
  if (!paymentTransitions[method][from]?.includes(to)) {
    throw new Error(`Không thể chuyển trạng thái thanh toán từ ${from} sang ${to}.`);
  }
}

export function detectImageExtension(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte)) return "png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  return null;
}
