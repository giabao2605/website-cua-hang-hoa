import assert from "node:assert/strict";
import test from "node:test";
import { buildAdminOverview } from "../../lib/admin-overview.ts";

const baseSettings = {
  shopName: "Trâm Florist",
  tagline: "Trao một mùa hoa, giữ một đời thương",
  phone: "0838469089",
  phoneDisplay: "0838 469 089",
  address: "Đắk Lắk",
  openingHours: "08:00 - 17:00",
  zaloUrl: "https://zalo.me/0838469089",
  momoNumber: "0838469089",
  momoOwner: "NGUYỄN LÂM GIA BẢO",
  momoQrImage: "/payment/momo.png",
  otpSenderEmail: "shop@gmail.com",
  codEnabled: true,
  momoEnabled: true,
} as const;

test("admin overview derives useful tasks, recent activity and seven-day revenue", () => {
  const orders = [
    { id: "2", code: "TF2", buyerName: "Lan", buyerEmail: "lan@example.com", buyerPhone: "0912345678", recipientName: "Lan", paymentMethod: "COD" as const, paymentStatus: "cod_pending" as const, status: "pending_confirmation" as const, total: 500_000, version: 1, createdAt: "2026-08-13T02:00:00.000Z" },
    { id: "1", code: "TF1", buyerName: "Mai", buyerEmail: "mai@example.com", buyerPhone: "0987654321", recipientName: "Mai", paymentMethod: "MOMO" as const, paymentStatus: "paid" as const, status: "delivered" as const, total: 900_000, version: 1, createdAt: "2026-08-12T02:00:00.000Z" },
  ];
  const products = [
    { id: "low", name: "Hoa sắp hết", sku: "TF-LOW", stock: 3, active: true, price: 500_000, image: "/products/low.png" },
    { id: "hidden", name: "Hoa đang ẩn", sku: "TF-HIDDEN", stock: 10, active: false, price: 600_000, image: "/products/hidden.png" },
  ];
  const contacts = [{ id: "c1", name: "An", phone: "0900000000", email: "", occasion: "Sinh nhật", message: "Cần tư vấn", status: "new" as const, createdAt: "2026-08-13T03:00:00.000Z", updatedAt: "2026-08-13T03:00:00.000Z" }];

  const overview = buildAdminOverview({ orders, products, contacts, shippingRules: [{ active: true }], settings: baseSettings, now: new Date("2026-08-13T12:00:00.000Z") });

  assert.equal(overview.deliveredOrders, 1);
  assert.equal(overview.recentOrders[0]?.code, "TF2");
  assert.equal(overview.lowStockProducts[0]?.id, "low");
  assert.equal(overview.hiddenProducts, 1);
  assert.deepEqual(overview.tasks.map((task) => task.id), ["orders", "contacts", "stock"]);
  assert.equal(overview.revenueDays.length, 7);
  assert.equal(overview.revenueDays.reduce((total, day) => total + day.total, 0), 1_400_000);
  assert.equal(overview.checklist.find((item) => item.id === "test-order")?.complete, true);
  assert.equal(orders[0]?.code, "TF2");
});

test("admin overview provides a useful empty-store checklist", () => {
  const overview = buildAdminOverview({ orders: [], products: [], contacts: [], shippingRules: [], settings: baseSettings, now: new Date("2026-08-13T12:00:00.000Z") });

  assert.equal(overview.tasks.length, 0);
  assert.equal(overview.recentOrders.length, 0);
  assert.equal(overview.revenueMax, 0);
  assert.deepEqual(overview.checklist.map((item) => item.complete), [false, false, true, false]);

  const incompleteMomo = buildAdminOverview({ orders: [], products: [], contacts: [], shippingRules: [], settings: { ...baseSettings, momoOwner: "Chờ xác nhận" }, now: new Date("2026-08-13T12:00:00.000Z") });
  assert.equal(incompleteMomo.checklist.find((item) => item.id === "payment")?.complete, false);
});

test("archived orders leave operational lists but remain in revenue history", () => {
  const orders = [{ id: "archived", code: "TF-ARCHIVED", buyerName: "Lan", paymentMethod: "COD" as const, paymentStatus: "cod_pending", status: "pending_confirmation", total: 500_000, version: 1, archived: true, createdAt: "2026-08-13T02:00:00.000Z" }];
  const overview = buildAdminOverview({ orders, products: [], contacts: [], shippingRules: [], settings: baseSettings, now: new Date("2026-08-13T12:00:00.000Z") });

  assert.equal(overview.recentOrders.length, 0);
  assert.equal(overview.tasks.some((task) => task.id === "orders"), false);
  assert.equal(overview.revenueDays.reduce((total, day) => total + day.total, 0), 500_000);
});
