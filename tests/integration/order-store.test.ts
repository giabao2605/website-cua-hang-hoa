import assert from "node:assert/strict";
import test from "node:test";
import { createOrder, findPublicOrder, reportMomoPayment } from "../../lib/order-store.ts";

test("order creation fails closed when the durable database is unavailable", async () => {
  const tomorrow = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() + 86_400_000));
  const identity = { authUserId: "user-integration-1", email: "member@example.com", fullName: "Nguyễn Hà Trâm" };
  const payload = {
    buyerName: "Nguyễn Hà Trâm",
    buyerEmail: "member@example.com",
    buyerPhone: "0838469089",
    recipientName: "Trần Minh Anh",
    recipientPhone: "0912345678",
    province: "Đắk Lắk",
    locality: "Xã Tuy An Bắc",
    addressLine: "Thôn 1",
    deliveryDate: tomorrow,
    deliverySlot: "08:00-11:00" as const,
    paymentMethod: "COD" as const,
    note: "Chúc mừng",
    items: [{ productId: "vuon-trong-nang", quantity: 1 }],
    idempotencyKey: "5a519722-2177-4c92-a7be-3dddb34688fb",
  };

  await assert.rejects(createOrder(payload, identity), /D1 chưa sẵn sàng/i);
});

test("order tracking fails closed when the durable database is unavailable", async () => {
  await assert.rejects(findPublicOrder("TF260814ABC123", "0838469089"), /D1 chưa sẵn sàng/i);
});

test("customer payment report moves only its matching MoMo order to review", async () => {
  const statements: Array<{ sql: string; values: readonly unknown[] }> = [];
  installDatabase({
    prepare(sql: string) {
      let values: readonly unknown[] = [];
      return {
        bind(...next: readonly unknown[]) {
          values = next;
          return this;
        },
        async first() {
          statements.push({ sql, values });
          return { id: "order-1", public_code: "TF260814ABC123", payment_method: "MOMO", payment_status: "pending", version: 1 };
        },
        async run() {
          statements.push({ sql, values });
          return { meta: { changes: 1 } };
        },
      };
    },
    async batch(prepared: Array<{ run: () => Promise<unknown> }>) {
      return Promise.all(prepared.map((statement) => statement.run()));
    },
  });

  const result = await reportMomoPayment({
    code: "TF260814ABC123",
    idempotencyKey: "5a519722-2177-4c92-a7be-3dddb34688fb",
  });

  assert.deepEqual(result, { code: "TF260814ABC123", paymentStatus: "payment_review" });
  assert.match(statements[0]?.sql ?? "", /public_code = \? AND idempotency_key = \?/);
  assert.deepEqual(statements[0]?.values, ["TF260814ABC123", "5a519722-2177-4c92-a7be-3dddb34688fb"]);
  assert.match(statements[1]?.sql ?? "", /payment_status = 'payment_review'/);
  assert.equal(statements[1]?.values[1], "order-1");
  assert.equal(statements[1]?.values[2], 1);
  assert.equal(statements[1]?.values[3], "pending");
  assert.match(String(statements[1]?.values[0]), /^\d{4}-\d{2}-\d{2}T/);
  assert.match(statements[2]?.sql ?? "", /customer_payment_reported/);
  clearDatabase();
});

function installDatabase(database: object) {
  (globalThis as typeof globalThis & { __TRAM_FLORIST_DB__?: D1Database }).__TRAM_FLORIST_DB__ = database as D1Database;
}

function clearDatabase() {
  delete (globalThis as typeof globalThis & { __TRAM_FLORIST_DB__?: D1Database }).__TRAM_FLORIST_DB__;
}
