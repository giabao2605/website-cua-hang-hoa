import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull().default(""),
    phone: text("phone").notNull().default(""),
    role: text("role", { enum: ["customer", "admin"] }).notNull().default("customer"),
    disabled: integer("disabled", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_profiles_auth_user_id").on(table.authUserId),
    uniqueIndex("idx_profiles_email").on(table.email),
  ],
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    sku: text("sku").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    description: text("description").notNull(),
    category: text("category").notNull(),
    seasonal: text("seasonal").notNull().default("Quanh năm"),
    imageUrl: text("image_url").notNull(),
    galleryJson: text("gallery_json").notNull().default("[]"),
    occasionsJson: text("occasions_json").notNull().default("[]"),
    flowersJson: text("flowers_json").notNull().default("[]"),
    palette: text("palette").notNull().default("Theo mùa"),
    badge: text("badge"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_products_sku").on(table.sku),
    uniqueIndex("idx_products_slug").on(table.slug),
    index("idx_products_active_featured").on(table.active, table.featured, table.sortOrder),
  ],
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").notNull().references(() => products.id),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    stock: integer("stock").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
  },
  (table) => [
    index("idx_product_variants_product_id").on(table.productId),
    check("product_variant_price_nonnegative", sql`${table.price} >= 0`),
    check("product_variant_compare_at_nonnegative", sql`${table.compareAtPrice} IS NULL OR ${table.compareAtPrice} >= 0`),
    check("product_variant_stock_nonnegative", sql`${table.stock} >= 0`),
  ],
);

export const shippingRules = sqliteTable(
  "shipping_rules",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    kind: text("kind", { enum: ["locality", "province", "region", "nationwide"] }).notNull(),
    value: text("value").notNull(),
    fee: integer("fee").notNull(),
    estimate: text("estimate").notNull(),
    priority: integer("priority").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_shipping_rules_active_priority").on(table.active, table.priority),
    check("shipping_rule_fee_nonnegative", sql`${table.fee} >= 0`),
  ],
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    publicCode: text("public_code").notNull(),
    customerId: text("customer_id").references(() => profiles.id),
    idempotencyKey: text("idempotency_key").notNull(),
    buyerName: text("buyer_name").notNull(),
    buyerEmail: text("buyer_email").notNull().default(""),
    buyerPhone: text("buyer_phone").notNull(),
    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    province: text("province").notNull(),
    locality: text("locality").notNull(),
    addressLine: text("address_line").notNull(),
    deliveryDate: text("delivery_date").notNull(),
    deliverySlot: text("delivery_slot").notNull(),
    note: text("note").notNull().default(""),
    paymentMethod: text("payment_method", { enum: ["COD", "MOMO"] }).notNull(),
    paymentStatus: text("payment_status", { enum: ["cod_pending", "pending", "payment_review", "paid", "collected", "rejected"] }).notNull(),
    status: text("status", { enum: ["pending_confirmation", "confirmed", "preparing", "delivering", "delivered", "cancelled"] }).notNull(),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    shippingFee: integer("shipping_fee").notNull(),
    total: integer("total").notNull(),
    version: integer("version").notNull().default(1),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_orders_public_code").on(table.publicCode),
    uniqueIndex("idx_orders_idempotency_key").on(table.idempotencyKey),
    index("idx_orders_customer_id").on(table.customerId),
    index("idx_orders_buyer_email").on(table.buyerEmail),
    index("idx_orders_status_created_at").on(table.status, table.createdAt),
    check("order_money_nonnegative", sql`${table.subtotal} >= 0 AND ${table.discount} >= 0 AND ${table.shippingFee} >= 0 AND ${table.total} >= 0`),
    check("order_version_positive", sql`${table.version} >= 1`),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().references(() => orders.id),
    productId: text("product_id").notNull(),
    sku: text("sku").notNull(),
    productName: text("product_name").notNull(),
    variantName: text("variant_name").notNull(),
    imageUrl: text("image_url").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (table) => [
    index("idx_order_items_order_id").on(table.orderId),
    check("order_item_money_nonnegative", sql`${table.unitPrice} >= 0 AND ${table.lineTotal} >= 0`),
    check("order_item_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const orderEvents = sqliteTable(
  "order_events",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().references(() => orders.id),
    actorId: text("actor_id"),
    eventType: text("event_type").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status"),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_order_events_order_id_created_at").on(table.orderId, table.createdAt)],
);

export const paymentEvidence = sqliteTable(
  "payment_evidence",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().references(() => orders.id),
    transactionReference: text("transaction_reference").notNull().default(""),
    objectKey: text("object_key"),
    amount: integer("amount"),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: text("reviewed_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_payment_evidence_order_id").on(table.orderId),
    check("payment_evidence_amount_nonnegative", sql`${table.amount} IS NULL OR ${table.amount} >= 0`),
  ],
);

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contactRequests = sqliteTable(
  "contact_requests",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().default(""),
    occasion: text("occasion").notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["new", "contacted", "closed"] }).notNull().default("new"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_contact_requests_status_created_at").on(table.status, table.createdAt)],
);

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    email: text("email").primaryKey(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    source: text("source").notNull().default("footer"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_newsletter_subscribers_active").on(table.active)],
);
