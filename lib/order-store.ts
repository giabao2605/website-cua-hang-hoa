import { getCatalogProducts, getShippingRules } from "./catalog-store.ts";
import { calculateCart, normalizeVietnamPhone, selectShippingRule } from "./commerce.ts";
import { validateCheckout, validateMomoPaymentReport, type CheckoutInput } from "./orders.ts";
import { requireD1Binding } from "./platform.ts";
import { provinceOptions } from "./site.ts";
import { requireSiteSettings } from "./site-settings-store.ts";

export type PublicOrder = Readonly<{
  code: string;
  status: string;
  paymentMethod: "COD" | "MOMO";
  paymentStatus: string;
  total: number;
  recipientName: string;
  recipientPhoneMasked: string;
  province: string;
  locality: string;
  deliveryDate: string;
  deliverySlot: string;
  createdAt: string;
  items: readonly { name: string; quantity: number; image: string }[];
}>;

type CreateOrderPayload = CheckoutInput & {
  items: readonly { productId: string; quantity: number }[];
  idempotencyKey: string;
};

export type AuthIdentity = Readonly<{
  authUserId: string;
  email: string;
  fullName?: string;
}>;

export async function createOrder(payload: CreateOrderPayload, identity?: AuthIdentity | null) {
  const checkout = validateCheckout({
    ...payload,
    buyerEmail: identity?.email ?? payload.buyerEmail,
  });
  if (!Array.isArray(payload.items) || !payload.items.length) throw new Error("Giỏ hàng đang trống.");
  if (!/^[0-9a-f-]{20,64}$/i.test(payload.idempotencyKey)) throw new Error("Yêu cầu đặt hàng không hợp lệ.");
  const db = requireD1Binding();
  const settings = await requireSiteSettings();
  if ((checkout.paymentMethod === "COD" && !settings.codEnabled) || (checkout.paymentMethod === "MOMO" && !settings.momoEnabled)) {
    throw new Error("Phương thức thanh toán này hiện không khả dụng.");
  }

  const existing = await findOrderByIdempotency(db, payload.idempotencyKey);
  if (existing) return { code: existing.code, paymentMethod: existing.paymentMethod, total: existing.total };

  const products = await getCatalogProducts();
  const lines = payload.items.map((line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product) throw new Error("Một sản phẩm trong giỏ không còn khả dụng.");
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > product.stock) {
      throw new Error(`Số lượng ${product.name} không hợp lệ.`);
    }
    return { product, quantity: line.quantity };
  });
  const region = provinceOptions.find((item) => item.province === checkout.province)?.region ?? "Khác";
  const shippingRule = selectShippingRule(await getShippingRules(), {
    locality: checkout.locality,
    province: checkout.province,
    region,
  });
  const totals = calculateCart(
    lines.map(({ product, quantity }) => ({ id: product.id, unitPrice: product.price, quantity })),
    null,
    shippingRule.fee,
  );
  const code = `TF${new Date().toISOString().slice(2, 10).replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const order = {
    code,
    status: "pending_confirmation",
    paymentMethod: checkout.paymentMethod,
    paymentStatus: checkout.paymentMethod === "COD" ? "cod_pending" : "pending",
    total: totals.total,
    recipientName: checkout.recipientName,
    recipientPhoneMasked: maskPhone(checkout.recipientPhone),
    buyerEmail: checkout.buyerEmail,
    buyerPhone: checkout.buyerPhone,
    recipientPhone: checkout.recipientPhone,
    idempotencyKey: payload.idempotencyKey,
    province: checkout.province,
    locality: checkout.locality,
    deliveryDate: checkout.deliveryDate,
    deliverySlot: checkout.deliverySlot,
    createdAt,
    items: lines.map(({ product, quantity }) => ({ name: product.name, quantity, image: product.image })),
  };

  const orderId = crypto.randomUUID();
  const profile = identity ? await findOrPrepareProfile(db, identity, checkout.buyerName, createdAt) : null;
  const statements = [
    ...(profile?.statement ? [profile.statement] : []),
    db.prepare(`INSERT INTO orders (id, public_code, customer_id, idempotency_key, buyer_name, buyer_email, buyer_phone, recipient_name, recipient_phone, province, locality, address_line, delivery_date, delivery_slot, note, payment_method, payment_status, status, subtotal, discount, shipping_fee, total, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`)
      .bind(orderId, code, profile?.id ?? null, payload.idempotencyKey, checkout.buyerName, checkout.buyerEmail, checkout.buyerPhone, checkout.recipientName, checkout.recipientPhone, checkout.province, checkout.locality, checkout.addressLine, checkout.deliveryDate, checkout.deliverySlot, checkout.note, checkout.paymentMethod, order.paymentStatus, order.status, totals.subtotal, totals.discount, totals.shipping, totals.total, createdAt, createdAt),
    ...lines.map(({ product, quantity }) => db.prepare(`INSERT INTO order_items (id, order_id, product_id, sku, product_name, variant_name, image_url, unit_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), orderId, product.id, product.sku, product.name, "Tiêu chuẩn", product.image, product.price, quantity, product.price * quantity)),
    db.prepare(`INSERT INTO order_events (id, order_id, actor_id, event_type, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), orderId, identity?.authUserId ?? null, "order_created", order.status, "Đơn hàng được tạo từ website", createdAt),
  ];

  try {
    await db.batch(statements);
  } catch (cause) {
    const concurrent = await findOrderByIdempotency(db, payload.idempotencyKey);
    if (concurrent) return { code: concurrent.code, paymentMethod: concurrent.paymentMethod, total: concurrent.total };
    throw cause;
  }
  return { code, paymentMethod: checkout.paymentMethod, total: totals.total };
}

export async function findPublicOrder(codeValue: string, phoneValue: string): Promise<PublicOrder | null> {
  const code = codeValue.trim().toUpperCase();
  const phone = normalizeVietnamPhone(phoneValue);
  if (!/^TF[A-Z0-9]{10,20}$/.test(code)) return null;

  const db = requireD1Binding();
  const order = await db.prepare(`SELECT id, public_code, status, payment_method, payment_status, total, recipient_name, recipient_phone, province, locality, delivery_date, delivery_slot, created_at FROM orders WHERE public_code = ? AND (buyer_phone = ? OR recipient_phone = ?) LIMIT 1`).bind(code, phone, phone).first<Record<string, string | number>>();
  return order ? publicOrderFromRow(db, order) : null;
}

export async function listOrdersForCustomer(identity: AuthIdentity): Promise<PublicOrder[]> {
  const db = requireD1Binding();
  const result = await db.prepare(`
    SELECT id, public_code, status, payment_method, payment_status, total, recipient_name,
      recipient_phone, province, locality, delivery_date, delivery_slot, created_at
    FROM orders
    WHERE buyer_email = ? OR customer_id IN (SELECT id FROM profiles WHERE auth_user_id = ?)
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(identity.email.toLowerCase(), identity.authUserId).all<Record<string, string | number>>();
  return Promise.all(result.results.map((row) => publicOrderFromRow(db, row)));
}

export async function reportMomoPayment(input: unknown) {
  const { code, idempotencyKey } = validateMomoPaymentReport(input);
  const db = requireD1Binding();
  const order = await findMomoPaymentReportOrder(db, code, idempotencyKey);
  if (!order || order.paymentMethod !== "MOMO") {
    throw new Error("Không thể xác nhận yêu cầu thanh toán cho đơn hàng này.");
  }
  if (order.paymentStatus === "payment_review" || order.paymentStatus === "paid") {
    return { code: order.code, paymentStatus: order.paymentStatus };
  }
  if (order.paymentStatus !== "pending" && order.paymentStatus !== "rejected") {
    throw new Error("Đơn hàng chưa thể gửi xác nhận thanh toán.");
  }

  const now = new Date().toISOString();
  const updateStatement = db.prepare(`
    UPDATE orders SET payment_status = 'payment_review', version = version + 1, updated_at = ?
    WHERE id = ? AND version = ? AND payment_status = ?
  `).bind(now, order.id, order.version, order.paymentStatus);
  const eventStatement = db.prepare(`
    INSERT INTO order_events (id, order_id, actor_id, event_type, from_status, to_status, note, created_at)
    SELECT ?, id, NULL, 'customer_payment_reported', ?, 'payment_review', ?, ?
    FROM orders WHERE id = ? AND version = ? AND payment_status = 'payment_review' AND updated_at = ?
  `).bind(crypto.randomUUID(), order.paymentStatus, "Khách hàng báo đã chuyển khoản MoMo; chờ shop đối soát.", now, order.id, order.version + 1, now);
  const [update] = await db.batch([updateStatement, eventStatement]);
  if (!update.meta.changes) {
    const concurrent = await findMomoPaymentReportOrder(db, code, idempotencyKey);
    if (concurrent?.paymentStatus === "payment_review" || concurrent?.paymentStatus === "paid") {
      return { code: concurrent.code, paymentStatus: concurrent.paymentStatus };
    }
    throw new Error("Trạng thái thanh toán vừa thay đổi. Vui lòng tải lại trang.");
  }

  return { code: order.code, paymentStatus: "payment_review" as const };
}

async function findOrderByIdempotency(db: D1Database, key: string) {
  const row = await db.prepare("SELECT public_code, payment_method, total FROM orders WHERE idempotency_key = ? LIMIT 1")
    .bind(key)
    .first<Record<string, string | number>>();
  return row ? { code: String(row.public_code), paymentMethod: row.payment_method as "COD" | "MOMO", total: Number(row.total) } : null;
}

async function findMomoPaymentReportOrder(db: D1Database, code: string, idempotencyKey: string) {
  const row = await db.prepare(`
    SELECT id, public_code, payment_method, payment_status, version
    FROM orders WHERE public_code = ? AND idempotency_key = ? LIMIT 1
  `).bind(code, idempotencyKey).first<Record<string, string | number>>();
  return row ? {
    id: String(row.id),
    code: String(row.public_code),
    paymentMethod: String(row.payment_method),
    paymentStatus: String(row.payment_status),
    version: Number(row.version),
  } : null;
}

async function findOrPrepareProfile(db: D1Database, identity: AuthIdentity, fullName: string, now: string) {
  const existing = await db.prepare("SELECT id FROM profiles WHERE auth_user_id = ? OR email = ? LIMIT 1")
    .bind(identity.authUserId, identity.email.toLowerCase())
    .first<{ id: string }>();
  if (existing) return { id: existing.id, statement: null };
  const id = crypto.randomUUID();
  return {
    id,
    statement: db.prepare("INSERT INTO profiles (id, auth_user_id, email, full_name, role, disabled, created_at, updated_at) VALUES (?, ?, ?, ?, 'customer', 0, ?, ?)")
      .bind(id, identity.authUserId, identity.email.toLowerCase(), identity.fullName ?? fullName, now, now),
  };
}

async function publicOrderFromRow(db: D1Database, order: Record<string, string | number>): Promise<PublicOrder> {
  const items = await db.prepare("SELECT product_name, quantity, image_url FROM order_items WHERE order_id = ? ORDER BY rowid ASC")
    .bind(String(order.id))
    .all<Record<string, string | number>>();
  return {
    code: String(order.public_code),
    status: String(order.status),
    paymentMethod: order.payment_method as "COD" | "MOMO",
    paymentStatus: String(order.payment_status),
    total: Number(order.total),
    recipientName: String(order.recipient_name),
    recipientPhoneMasked: maskPhone(String(order.recipient_phone)),
    province: String(order.province),
    locality: String(order.locality),
    deliveryDate: String(order.delivery_date),
    deliverySlot: String(order.delivery_slot),
    createdAt: String(order.created_at),
    items: items.results.map((item) => ({ name: String(item.product_name), quantity: Number(item.quantity), image: String(item.image_url) })),
  };
}

function maskPhone(phone: string) {
  return `${phone.slice(0, 4)} *** ${phone.slice(-3)}`;
}
