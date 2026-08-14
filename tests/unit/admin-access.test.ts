import assert from "node:assert/strict";
import test from "node:test";
import { hasAdminAccess } from "../../lib/admin-access.ts";

test("admin access requires a confirmed allowlisted email", () => {
  const previous = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = "owner@example.com, admin@example.com";
  try {
    assert.equal(hasAdminAccess({ email: "OWNER@example.com", email_confirmed_at: "2026-08-13T00:00:00Z" }), true);
    assert.equal(hasAdminAccess({ email: "guest@example.com", email_confirmed_at: "2026-08-13T00:00:00Z" }), false);
    assert.equal(hasAdminAccess({ email: "owner@example.com", email_confirmed_at: undefined }), false);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = previous;
  }
});
