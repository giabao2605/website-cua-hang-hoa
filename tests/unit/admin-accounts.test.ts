import assert from "node:assert/strict";
import test from "node:test";
import { assertAccountManageable, isAccountDisabled, parseAdminAccountDeletion, parseAdminAccountUpdate } from "../../lib/admin-accounts.ts";

test("account management accepts only a disabled boolean", () => {
  assert.deepEqual(parseAdminAccountUpdate({ disabled: true }), { disabled: true });
  assert.throws(() => parseAdminAccountUpdate({ disabled: true, role: "admin" }), /không hợp lệ/i);
  assert.throws(() => parseAdminAccountUpdate({ disabled: "yes" }), /không hợp lệ/i);
});

test("account deletion requires an exact confirmation email", () => {
  assert.deepEqual(parseAdminAccountDeletion({ confirmEmail: " Member@Example.com " }), { confirmEmail: "member@example.com" });
  assert.throws(() => parseAdminAccountDeletion({ confirmEmail: "not-an-email" }), /không hợp lệ/i);
  assert.throws(() => parseAdminAccountDeletion({ confirmEmail: "member@example.com", hardDelete: true }), /không hợp lệ/i);
});

test("account management protects the current and allowlisted administrators", () => {
  const previous = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = "owner@example.com";
  try {
    assert.throws(() => assertAccountManageable("user-1", "user-1", "member@example.com"), /chính mình/i);
    assert.throws(() => assertAccountManageable("user-2", "admin-1", "owner@example.com"), /quản trị/i);
    assert.doesNotThrow(() => assertAccountManageable("user-2", "admin-1", "member@example.com"));
  } finally {
    if (previous === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = previous;
  }
});

test("account status uses a future Supabase ban timestamp", () => {
  const now = Date.parse("2026-08-13T00:00:00Z");
  assert.equal(isAccountDisabled("2026-08-14T00:00:00Z", now), true);
  assert.equal(isAccountDisabled("2026-08-12T00:00:00Z", now), false);
  assert.equal(isAccountDisabled(undefined, now), false);
});
