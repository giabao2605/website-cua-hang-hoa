import assert from "node:assert/strict";
import test from "node:test";
import { ADMIN_NOTICE_DURATION_MS, createAdminNotice, isAdminNoticeVisible, shouldStoreAdminNotice } from "../../lib/admin-notice.ts";

test("admin notices belong only to the section that created them", () => {
  const notice = createAdminNotice("orders", { type: "success", text: "Đã cập nhật đơn." });

  assert.equal(isAdminNoticeVisible(notice, "orders"), true);
  assert.equal(isAdminNoticeVisible(notice, "accounts"), false);
});

test("admin notices auto-dismiss after five seconds", () => {
  assert.equal(ADMIN_NOTICE_DURATION_MS, 5_000);
});

test("a late response from an inactive section cannot replace the current notice", () => {
  assert.equal(shouldStoreAdminNotice("contacts", "orders"), false);
  assert.equal(shouldStoreAdminNotice("orders", "orders"), true);
});
