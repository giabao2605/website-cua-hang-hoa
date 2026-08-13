import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCart,
  formatVnd,
  normalizeVietnamPhone,
  selectShippingRule,
  type ShippingRule,
} from "../../lib/commerce.ts";

const shippingRules: ShippingRule[] = [
  { id: "local", kind: "locality", value: "Xã Tuy An Bắc", fee: 25_000, priority: 300, active: true },
  { id: "daklak", kind: "province", value: "Đắk Lắk", fee: 50_000, priority: 200, active: true },
  { id: "region", kind: "region", value: "Tây Nguyên & Nam Trung Bộ", fee: 85_000, priority: 100, active: true },
  { id: "nationwide", kind: "nationwide", value: "Việt Nam", fee: 120_000, priority: 0, active: true },
];

test("formatVnd emits Vietnamese currency without decimals", () => {
  assert.equal(formatVnd(490_000), "490.000 ₫");
});

test("normalizes valid Vietnamese mobile numbers", () => {
  assert.equal(normalizeVietnamPhone("0838 469 089"), "0838469089");
  assert.equal(normalizeVietnamPhone("+84 912 345 678"), "0912345678");
  assert.throws(() => normalizeVietnamPhone("1234"), /Số điện thoại/);
});

test("shipping chooses locality, province, region, then nationwide", () => {
  assert.equal(
    selectShippingRule(shippingRules, { locality: "Xã Tuy An Bắc", province: "Đắk Lắk", region: "Tây Nguyên & Nam Trung Bộ" }).fee,
    25_000,
  );
  assert.equal(
    selectShippingRule(shippingRules, { locality: "Buôn Ma Thuột", province: "Đắk Lắk", region: "Tây Nguyên & Nam Trung Bộ" }).fee,
    50_000,
  );
  assert.equal(
    selectShippingRule(shippingRules, { locality: "Quy Nhơn", province: "Gia Lai", region: "Tây Nguyên & Nam Trung Bộ" }).fee,
    85_000,
  );
  assert.equal(
    selectShippingRule(shippingRules, { locality: "Hoàn Kiếm", province: "Hà Nội", region: "Miền Bắc" }).fee,
    120_000,
  );
  assert.throws(() => selectShippingRule(shippingRules, { locality: "", province: "", region: "" }), /tỉnh/);
});

test("cart ignores client totals and calculates immutable VND totals", () => {
  const items = [
    { id: "a", unitPrice: 490_000, quantity: 2 },
    { id: "b", unitPrice: 690_000, quantity: 1 },
  ];
  const snapshot = structuredClone(items);
  const result = calculateCart(items, { percentBasisPoints: 1_000, maxDiscount: 150_000 }, 120_000);

  assert.deepEqual(result, {
    subtotal: 1_670_000,
    discount: 150_000,
    shipping: 120_000,
    total: 1_640_000,
  });
  assert.deepEqual(items, snapshot);
});
