import { z } from "zod";
import { assertPaymentTransition, parseAdminProductInput, parseShippingRuleInput, parseShippingRuleUpdate } from "./admin-domain.ts";
import { products as fallbackProducts, type Product } from "./catalog.ts";
import { formatVnd } from "./commerce.ts";
import { countActiveNewsletterSubscribers, listContactRequests, type ContactRequestRecord } from "./engagement-store.ts";
import { assertOrderTransition, orderStatuses, type OrderStatus } from "./orders.ts";
import { getD1Binding, requireD1Binding } from "./platform.ts";
import { shippingRules as fallbackShippingRules } from "./site.ts";
import type { SiteSettings } from "./site.ts";
import { getSiteSettings } from "./site-settings-store.ts";

export type AdminProduct = Product & Readonly<{ active: boolean }>;
export type AdminShippingRule = Readonly<{
  id: string;
  name: string;
  kind: "locality" | "province" | "region" | "nationwide";
  value: string;
  fee: number;
  estimate: string;
  priority: number;
  active: boolean;
}>;
export type AdminOrder = Readonly<{
  id: string;
  code: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  recipientName: string;
  paymentMethod: "COD" | "MOMO";
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  total: number;
  version: number;
  createdAt: string;
}>;
export type AdminDashboard = Readonly<{
  databaseReady: boolean;
  products: readonly AdminProduct[];
  shippingRules: readonly AdminShippingRule[];
  orders: readonly AdminOrder[];
  contacts: readonly ContactRequestRecord[];
  settings: SiteSettings;
  metrics: Readonly<{
    ordersNeedingAction: number;
    revenueToday: number;
    activeProducts: number;
    customers: number;
    contactsNeedingAction: number;
    newsletterSubscribers: number;
  }>;
}>;

type PaymentStatus = "cod_pending" | "pending" | "payment_review" | "paid" | "collected" | "rejected";
type Row = Record<string, string | number | null>;

const orderUpdateSchema = z.object({
  status: z.enum(orderStatuses),
  paymentStatus: z.enum(["cod_pending", "pending", "payment_review", "paid", "collected", "rejected"]),
  version: z.number().int().min(1),
  note: z.string().trim().max(300).default(""),
});

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const db = getD1Binding();
  if (!db) return fallbackDashboard();
  try {
    const [productResult, shippingResult, orderResult, orderMetrics, customerMetrics, contacts, newsletterSubscribers, settings] = await Promise.all([
      db.prepare(`
        SELECT p.id, p.sku, p.slug, p.name, p.subtitle, p.description, p.category, p.seasonal,
          p.image_url, p.gallery_json, p.occasions_json, p.flowers_json, p.palette, p.badge,
          p.active, p.featured, v.price, v.compare_at_price, v.stock
        FROM products p
        JOIN product_variants v ON v.product_id = p.id
        ORDER BY p.sort_order ASC, p.created_at ASC
      `).all<Row>(),
      db.prepare("SELECT id, name, kind, value, fee, estimate, priority, active FROM shipping_rules ORDER BY priority DESC").all<Row>(),
      db.prepare(`
        SELECT id, public_code, buyer_name, buyer_email, buyer_phone, recipient_name,
          payment_method, payment_status, status, total, version, created_at
        FROM orders ORDER BY created_at DESC LIMIT 100
      `).all<Row>(),
      db.prepare(`
        SELECT
          SUM(CASE WHEN status NOT IN ('delivered', 'cancelled') THEN 1 ELSE 0 END) AS needs_action,
          COALESCE(SUM(CASE WHEN date(created_at, '+7 hours') = date('now', '+7 hours') AND status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue_today
        FROM orders
      `).first<Row>(),
      db.prepare("SELECT COUNT(*) AS customer_count FROM profiles WHERE disabled = 0").first<Row>(),
      listContactRequests(),
      countActiveNewsletterSubscribers(),
      getSiteSettings(),
    ]);
    const products = productResult.results.map(adminProductFromRow);
    return {
      databaseReady: true,
      products,
      shippingRules: shippingResult.results.map(adminShippingFromRow),
      orders: orderResult.results.map(adminOrderFromRow),
      contacts,
      settings,
      metrics: {
        ordersNeedingAction: Number(orderMetrics?.needs_action ?? 0),
        revenueToday: Number(orderMetrics?.revenue_today ?? 0),
        activeProducts: products.filter((product) => product.active).length,
        customers: Number(customerMetrics?.customer_count ?? 0),
        contactsNeedingAction: contacts.filter((contact) => contact.status === "new").length,
        newsletterSubscribers,
      },
    };
  } catch {
    return fallbackDashboard();
  }
}

export async function saveAdminProduct(id: string, value: unknown): Promise<AdminProduct> {
  const input = parseAdminProductInput(value);
  if (id !== input.id) throw new Error("Mã sản phẩm không khớp.");
  const db = requireD1Binding();
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`
      INSERT INTO products (id, sku, slug, name, subtitle, description, category, seasonal, image_url, gallery_json, occasions_json, flowers_json, palette, badge, active, featured, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        sku = excluded.sku, slug = excluded.slug, name = excluded.name, subtitle = excluded.subtitle,
        description = excluded.description, category = excluded.category, seasonal = excluded.seasonal,
        image_url = excluded.image_url, gallery_json = excluded.gallery_json,
        occasions_json = excluded.occasions_json, flowers_json = excluded.flowers_json,
        palette = excluded.palette, badge = excluded.badge, active = excluded.active,
        featured = excluded.featured, updated_at = excluded.updated_at
    `).bind(input.id, input.sku, input.slug, input.name, input.subtitle, input.description, input.category, input.seasonal, input.image, JSON.stringify(input.gallery), JSON.stringify(input.occasions), JSON.stringify(input.flowers), input.palette, input.badge ?? null, input.active ? 1 : 0, input.featured ? 1 : 0, now),
    db.prepare(`
      INSERT INTO product_variants (id, product_id, name, price, compare_at_price, stock, active)
      VALUES (?, ?, 'Tiêu chuẩn', ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET price = excluded.price, compare_at_price = excluded.compare_at_price,
        stock = excluded.stock, active = excluded.active
    `).bind(`${input.id}-standard`, input.id, input.price, input.compareAtPrice ?? null, input.stock, input.active ? 1 : 0),
  ]);
  return { ...input, active: input.active };
}

export async function saveShippingRule(id: string, value: unknown): Promise<AdminShippingRule> {
  if (!/^[a-z0-9-]{1,64}$/.test(id)) throw new Error("Mã tuyến giao không hợp lệ.");
  const input = parseShippingRuleUpdate(value);
  const db = requireD1Binding();
  const result = await db.prepare("UPDATE shipping_rules SET fee = ?, estimate = ?, active = ?, updated_at = ? WHERE id = ?")
    .bind(input.fee, input.estimate, input.active ? 1 : 0, new Date().toISOString(), id)
    .run();
  if (Number(result.meta.changes ?? 0) !== 1) throw new Error("Không tìm thấy tuyến giao cần cập nhật.");
  const row = await db.prepare("SELECT id, name, kind, value, fee, estimate, priority, active FROM shipping_rules WHERE id = ?")
    .bind(id)
    .first<Row>();
  if (!row) throw new Error("Không thể đọc lại tuyến giao.");
  return adminShippingFromRow(row);
}

export async function createShippingRule(value: unknown): Promise<AdminShippingRule> {
  const input = parseShippingRuleInput(value);
  const db = requireD1Binding();
  try {
    await db.prepare(`
      INSERT INTO shipping_rules (id, name, kind, value, fee, estimate, priority, active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(input.id, input.name, input.kind, input.value, input.fee, input.estimate, input.priority, input.active ? 1 : 0, new Date().toISOString()).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/unique|constraint/i.test(message)) throw new Error("Mã tuyến giao đã tồn tại.");
    throw error;
  }
  return input;
}

export async function saveAdminOrder(id: string, value: unknown, actorId: string): Promise<AdminOrder> {
  if (!/^[0-9a-f-]{20,64}$/i.test(id)) throw new Error("Mã nội bộ đơn hàng không hợp lệ.");
  const parsed = orderUpdateSchema.safeParse(value);
  if (!parsed.success) throw new Error("Dữ liệu cập nhật đơn hàng không hợp lệ.");
  const db = requireD1Binding();
  const current = await db.prepare(`
    SELECT id, public_code, buyer_name, buyer_email, buyer_phone, recipient_name,
      payment_method, payment_status, status, total, version, created_at
    FROM orders WHERE id = ? LIMIT 1
  `).bind(id).first<Row>();
  if (!current) throw new Error("Không tìm thấy đơn hàng.");
  const input = parsed.data;
  assertOrderTransition(String(current.status) as OrderStatus, input.status);
  assertPaymentTransition(
    String(current.payment_method) as "COD" | "MOMO",
    String(current.payment_status) as PaymentStatus,
    input.paymentStatus,
  );
  if (input.paymentStatus === "paid" && input.note.length < 3) {
    throw new Error("Cần ghi chú căn cứ xác nhận thanh toán MoMo.");
  }
  const now = new Date().toISOString();
  const updated = await db.prepare(`
    UPDATE orders SET status = ?, payment_status = ?, version = version + 1, updated_at = ?
    WHERE id = ? AND version = ?
  `).bind(input.status, input.paymentStatus, now, id, input.version).run();
  if (Number(updated.meta.changes ?? 0) !== 1) throw new Error("Đơn hàng vừa được thay đổi ở nơi khác. Hãy tải lại trang.");
  await db.prepare(`
    INSERT INTO order_events (id, order_id, actor_id, event_type, from_status, to_status, note, created_at)
    VALUES (?, ?, ?, 'admin_update', ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), id, actorId, String(current.status), input.status, input.note, now).run();
  const row = await db.prepare(`
    SELECT id, public_code, buyer_name, buyer_email, buyer_phone, recipient_name,
      payment_method, payment_status, status, total, version, created_at
    FROM orders WHERE id = ?
  `).bind(id).first<Row>();
  if (!row) throw new Error("Không thể đọc lại đơn hàng.");
  return adminOrderFromRow(row);
}

async function fallbackDashboard(): Promise<AdminDashboard> {
  const shippingNames: Record<string, readonly [string, string]> = {
    local: ["Nội xã Tuy An Bắc", "Trong ngày"],
    daklak: ["Các khu vực khác tại Đắk Lắk", "Trong ngày hoặc ngày kế tiếp"],
    region: ["Tây Nguyên và Nam Trung Bộ", "1 - 2 ngày"],
    nationwide: ["Các tỉnh thành còn lại", "2 - 4 ngày"],
  };
  const [contacts, newsletterSubscribers, settings] = await Promise.all([listContactRequests(), countActiveNewsletterSubscribers(), getSiteSettings()]);
  return {
    databaseReady: false,
    products: fallbackProducts.map((product) => ({ ...product, active: true })),
    shippingRules: fallbackShippingRules.map((rule) => ({
      ...rule,
      name: shippingNames[rule.id]?.[0] ?? rule.value,
      estimate: shippingNames[rule.id]?.[1] ?? "Shop xác nhận",
    })),
    orders: [],
    contacts,
    settings,
    metrics: {
      ordersNeedingAction: 0,
      revenueToday: 0,
      activeProducts: fallbackProducts.length,
      customers: 0,
      contactsNeedingAction: contacts.filter((contact) => contact.status === "new").length,
      newsletterSubscribers,
    },
  };
}

function adminProductFromRow(row: Row): AdminProduct {
  return {
    id: String(row.id),
    sku: String(row.sku),
    slug: String(row.slug),
    name: String(row.name),
    subtitle: String(row.subtitle),
    description: String(row.description),
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? undefined : Number(row.compare_at_price),
    image: String(row.image_url),
    gallery: parseList(row.gallery_json, [String(row.image_url)]),
    category: String(row.category) as Product["category"],
    occasions: parseList(row.occasions_json, []),
    flowers: parseList(row.flowers_json, []),
    palette: String(row.palette),
    seasonal: String(row.seasonal),
    stock: Number(row.stock),
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    badge: row.badge ? String(row.badge) : undefined,
  };
}

function adminShippingFromRow(row: Row): AdminShippingRule {
  return {
    id: String(row.id),
    name: String(row.name),
    kind: String(row.kind) as AdminShippingRule["kind"],
    value: String(row.value),
    fee: Number(row.fee),
    estimate: String(row.estimate),
    priority: Number(row.priority),
    active: Boolean(row.active),
  };
}

function adminOrderFromRow(row: Row): AdminOrder {
  return {
    id: String(row.id),
    code: String(row.public_code),
    buyerName: String(row.buyer_name),
    buyerEmail: String(row.buyer_email),
    buyerPhone: String(row.buyer_phone),
    recipientName: String(row.recipient_name),
    paymentMethod: String(row.payment_method) as "COD" | "MOMO",
    paymentStatus: String(row.payment_status) as PaymentStatus,
    status: String(row.status) as OrderStatus,
    total: Number(row.total),
    version: Number(row.version),
    createdAt: String(row.created_at),
  };
}

function parseList(value: unknown, fallback: readonly string[]): string[] {
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? [...parsed] : [...fallback];
  } catch {
    return [...fallback];
  }
}

export function adminMetricLabel(value: number) {
  return value >= 1_000_000 ? `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}tr` : formatVnd(value);
}
