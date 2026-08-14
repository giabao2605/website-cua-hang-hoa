import assert from "node:assert/strict";
import test from "node:test";
import { parseCustomerProfileInput } from "../../lib/customer-profile.ts";

test("customer profile normalizes optional phone and trims address", () => {
  const source = {
    fullName: "  Nguyễn Lâm Gia Bảo  ",
    phone: "+84 838 469 089",
    address: "  Thôn 1, Xã Tuy An Bắc, Đắk Lắk  ",
  };

  assert.deepEqual(parseCustomerProfileInput(source), {
    fullName: "Nguyễn Lâm Gia Bảo",
    phone: "0838469089",
    address: "Thôn 1, Xã Tuy An Bắc, Đắk Lắk",
  });
  assert.equal(source.fullName, "  Nguyễn Lâm Gia Bảo  ");
});

test("customer profile rejects malformed and oversized values", () => {
  assert.throws(() => parseCustomerProfileInput({ fullName: "A", phone: "123", address: "Đắk Lắk" }), /hồ sơ/i);
  assert.throws(() => parseCustomerProfileInput({ fullName: "Nguyễn Hà Trâm", phone: "", address: "x".repeat(241) }), /hồ sơ/i);
  assert.throws(() => parseCustomerProfileInput({ fullName: "Nguyễn Hà Trâm", phone: "", address: "", role: "admin" }), /hồ sơ/i);
});
