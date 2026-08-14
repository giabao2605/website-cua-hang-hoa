import assert from "node:assert/strict";
import test from "node:test";
import { createShippingRule, saveAdminOrderArchived } from "../../lib/admin-store.ts";
import { getSiteSettings, saveSiteSettings } from "../../lib/site-settings-store.ts";

test("admin shipping creation binds validated route data into D1", async () => {
  const statements: Array<readonly unknown[]> = [];
  installDatabase({
    prepare() {
      return statement((values) => {
        statements.push(values);
        return { meta: { changes: 1 } };
      });
    },
  });

  const created = await createShippingRule({
    id: "phu-yen",
    name: "Khu vực Phú Yên",
    kind: "province",
    value: "Phú Yên",
    fee: 65_000,
    estimate: "1 - 2 ngày",
    priority: 180,
    active: true,
  });

  assert.equal(created.id, "phu-yen");
  assert.deepEqual(statements[0]?.slice(0, 8), ["phu-yen", "Khu vực Phú Yên", "province", "Phú Yên", 65_000, "1 - 2 ngày", 180, 1]);
  clearDatabase();
});

test("operational settings persist as D1 key-value rows and read back", async () => {
  const stored = new Map<string, string>();
  installDatabase({
    prepare(sql: string) {
      if (/SELECT key, value FROM site_settings/.test(sql)) {
        return statement(undefined, () => ({ results: [...stored].map(([key, value]) => ({ key, value })) }));
      }
      return statement((values) => {
        stored.set(String(values[0]), String(values[1]));
        return { meta: { changes: 1 } };
      });
    },
    async batch(statements: Array<{ run: () => Promise<unknown> }>) {
      return Promise.all(statements.map((item) => item.run()));
    },
  });

  const saved = await saveSiteSettings({
    shopName: "Trâm Florist",
    tagline: "Trao một mùa hoa, giữ một đời thương",
    phone: "0838 469 089",
    address: "Xã Tuy An Bắc, Tỉnh Đắk Lắk",
    openingHours: "08:00 - 17:00, Thứ Hai - Chủ Nhật",
    zaloUrl: "https://zalo.me/0838469089",
    momoNumber: "0838 469 089",
    momoOwner: "Nguyễn Lâm Gia Bảo",
    momoQrImage: "/media/products/2026/08/momo-qr.png",
    otpSenderEmail: "shop@example.com",
    codEnabled: true,
    momoEnabled: false,
  });
  const loaded = await getSiteSettings();

  assert.equal(saved.phone, "0838469089");
  assert.equal(stored.get("cod_enabled"), "true");
  assert.equal(stored.get("momo_enabled"), "false");
  assert.equal(stored.get("momo_qr_image"), "/media/products/2026/08/momo-qr.png");
  assert.equal(stored.get("otp_sender_email"), "shop@example.com");
  assert.deepEqual(loaded, saved);
  clearDatabase();
});

test("admin archives any order with optimistic locking and an audit event", async () => {
  const orderId = "00000000-0000-4000-8000-000000000001";
  const statements: Array<{ sql: string; values: readonly unknown[] }> = [];
  installDatabase({
    prepare(sql: string) {
      let values: readonly unknown[] = [];
      return {
        bind(...next: readonly unknown[]) { values = next; return this; },
        async first() {
          statements.push({ sql, values });
          return { id: "order-1", public_code: "TF1", buyer_name: "Lan", buyer_email: "lan@example.com", buyer_phone: "0912345678", recipient_name: "Lan", payment_method: "COD", payment_status: "cod_pending", status: "pending_confirmation", total: 500_000, version: /WHERE id = \?$/.test(sql.trim()) ? 2 : 1, archived: /WHERE id = \?$/.test(sql.trim()) ? 1 : 0, created_at: "2026-08-13T02:00:00.000Z" };
        },
        async run() {
          statements.push({ sql, values });
          return { meta: { changes: 1 } };
        },
      };
    },
  });

  const archived = await saveAdminOrderArchived(orderId, { archived: true, version: 1 }, "admin-1");

  assert.equal(archived.archived, true);
  assert.match(statements[1]?.sql ?? "", /SET archived = \?, version = version \+ 1/);
  assert.equal(statements[1]?.values[0], 1);
  assert.deepEqual(statements[1]?.values.slice(2), [orderId, 1]);
  assert.equal(statements[2]?.values.includes("admin_archive"), true);
  assert.equal(statements[2]?.values.includes("admin-1"), true);
  clearDatabase();
});

function statement(
  runHandler?: (values: readonly unknown[]) => unknown,
  allHandler?: () => unknown,
) {
  let values: readonly unknown[] = [];
  return {
    bind(...next: readonly unknown[]) {
      values = next;
      return this;
    },
    async run() {
      return runHandler?.(values) ?? { meta: { changes: 0 } };
    },
    async all() {
      return allHandler?.() ?? { results: [] };
    },
    async first() {
      return null;
    },
  };
}

function installDatabase(database: object) {
  (globalThis as typeof globalThis & { __TRAM_FLORIST_DB__?: D1Database }).__TRAM_FLORIST_DB__ = database as D1Database;
}

function clearDatabase() {
  delete (globalThis as typeof globalThis & { __TRAM_FLORIST_DB__?: D1Database }).__TRAM_FLORIST_DB__;
}
