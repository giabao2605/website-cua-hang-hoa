import assert from "node:assert/strict";
import test from "node:test";
import {
  assertOrderTransition,
  validateCheckout,
  validateMomoPaymentReport,
  type OrderStatus,
} from "../../lib/orders.ts";

test("allows only supported order status transitions", () => {
  const valid: Array<[OrderStatus, OrderStatus]> = [
    ["pending_confirmation", "confirmed"],
    ["pending_confirmation", "cancelled"],
    ["confirmed", "preparing"],
    ["preparing", "delivering"],
    ["delivering", "delivered"],
  ];
  for (const transition of valid) assert.doesNotThrow(() => assertOrderTransition(...transition));
  assert.throws(() => assertOrderTransition("pending_confirmation", "delivered"), /trạng thái/);
  assert.throws(() => assertOrderTransition("delivered", "cancelled"), /trạng thái/);
});

test("checkout validates payment, phone and delivery schedule", () => {
  const value = validateCheckout({
    buyerName: "Nguyễn Hà Trâm",
    buyerEmail: " Tram@example.com ",
    buyerPhone: "0838 469 089",
    recipientName: "Trần Minh Anh",
    recipientPhone: "+84 912 345 678",
    province: "Đắk Lắk",
    locality: "Xã Tuy An Bắc",
    addressLine: "Thôn 1",
    deliveryDate: "2026-08-14",
    deliverySlot: "08:00-11:00",
    paymentMethod: "MOMO",
    note: "Chúc mừng sinh nhật",
  }, new Date("2026-08-13T05:00:00+07:00"));

  assert.equal(value.buyerPhone, "0838469089");
  assert.equal(value.buyerEmail, "tram@example.com");
  assert.equal(value.recipientPhone, "0912345678");
  assert.equal(value.paymentMethod, "MOMO");
  assert.throws(
    () => validateCheckout({ ...value, deliveryDate: "2026-08-12" }, new Date("2026-08-13T05:00:00+07:00")),
    /ngày giao/,
  );
  assert.throws(() => validateCheckout({ ...value, buyerEmail: "không-phải-email" }), /email/i);
});

test("MoMo payment report requires the order code and its private request key", () => {
  assert.deepEqual(validateMomoPaymentReport({
    code: "tf260814abc123",
    idempotencyKey: "5a519722-2177-4c92-a7be-3dddb34688fb",
  }), {
    code: "TF260814ABC123",
    idempotencyKey: "5a519722-2177-4c92-a7be-3dddb34688fb",
  });
  assert.throws(
    () => validateMomoPaymentReport({ code: "TF260814ABC123", idempotencyKey: "guessable" }),
    /xác nhận thanh toán không hợp lệ/i,
  );
});
