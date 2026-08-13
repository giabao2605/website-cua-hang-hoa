import assert from "node:assert/strict";
import test from "node:test";
import { parseContactRequest, parseNewsletterSubscription } from "../../lib/customer-messages.ts";

test("contact request normalizes Vietnamese phone and trims content", () => {
  const value = parseContactRequest({
    name: " Nguyễn Hà Trâm ",
    phone: "+84 838 469 089",
    email: " Tram@Example.com ",
    occasion: "Sinh nhật",
    message: "  Mình cần tư vấn một bó hoa xanh giao buổi sáng.  ",
    website: "",
  });
  assert.equal(value.name, "Nguyễn Hà Trâm");
  assert.equal(value.phone, "0838469089");
  assert.equal(value.email, "tram@example.com");
  assert.equal(value.message, "Mình cần tư vấn một bó hoa xanh giao buổi sáng.");
});

test("contact request rejects spam honeypot and short content", () => {
  assert.throws(() => parseContactRequest({ name: "Trâm", phone: "0838469089", occasion: "Khác", message: "Ngắn", website: "bot.example" }), /yêu cầu tư vấn/i);
});

test("newsletter requires explicit consent and normalizes email", () => {
  assert.deepEqual(parseNewsletterSubscription({ email: " MEMBER@Example.com ", consent: true, website: "" }), {
    email: "member@example.com",
    consent: true,
    website: "",
  });
  assert.throws(() => parseNewsletterSubscription({ email: "member@example.com", consent: false, website: "" }), /đăng ký nhận tin/i);
});
