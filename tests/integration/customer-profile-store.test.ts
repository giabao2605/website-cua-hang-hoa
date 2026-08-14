import assert from "node:assert/strict";
import test from "node:test";
import { saveCustomerProfile } from "../../lib/customer-profile.ts";

test("profile update is scoped to the authenticated identity and never changes role", async () => {
  const statements: Array<{ sql: string; values: readonly unknown[] }> = [];
  installDatabase({
    prepare(sql: string) {
      let values: readonly unknown[] = [];
      return {
        bind(...next: readonly unknown[]) { values = next; return this; },
        async first() {
          statements.push({ sql, values });
          return { id: "profile-1", disabled: 0 };
        },
        async run() {
          statements.push({ sql, values });
          return { meta: { changes: 1 } };
        },
      };
    },
  });

  const profile = await saveCustomerProfile(
    { authUserId: "auth-user-1", email: "Member@Example.com" },
    { fullName: "Nguyễn Hà Trâm", phone: "0838 469 089", address: "Thôn 1, Đắk Lắk" },
  );

  assert.equal(profile.email, "member@example.com");
  assert.match(statements[0]?.sql ?? "", /auth_user_id = \? OR email = \?/);
  assert.deepEqual(statements[0]?.values, ["auth-user-1", "member@example.com"]);
  assert.match(statements[1]?.sql ?? "", /WHERE id = \? AND disabled = 0/);
  assert.doesNotMatch(statements[1]?.sql ?? "", /role\s*=/i);
  assert.deepEqual(statements[1]?.values.slice(0, 5), ["auth-user-1", "member@example.com", "Nguyễn Hà Trâm", "0838469089", "Thôn 1, Đắk Lắk"]);
  clearDatabase();
});

function installDatabase(database: object) {
  (globalThis as typeof globalThis & { __TRAM_FLORIST_DB__?: D1Database }).__TRAM_FLORIST_DB__ = database as D1Database;
}

function clearDatabase() {
  delete (globalThis as typeof globalThis & { __TRAM_FLORIST_DB__?: D1Database }).__TRAM_FLORIST_DB__;
}
