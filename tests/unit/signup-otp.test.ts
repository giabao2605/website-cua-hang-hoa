import assert from "node:assert/strict";
import test from "node:test";
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SECONDS,
  generateOtpCode,
  getResendDelaySeconds,
  hashOtp,
  parseOtpRequest,
  parseOtpVerification,
  renderOtpEmail,
  verifyOtpHash,
} from "../../lib/signup-otp.ts";

const validTestPassword = ["hoa", "mua", "xuan", "2026"].join("-");

test("signup OTP policy expires after five minutes and caps resend wait at expiry", () => {
  assert.equal(OTP_TTL_SECONDS, 300);
  assert.equal(OTP_MAX_ATTEMPTS, 5);
  assert.equal(getResendDelaySeconds(1), 120);
  assert.equal(getResendDelaySeconds(2), 180);
  assert.equal(getResendDelaySeconds(3), 240);
  assert.equal(getResendDelaySeconds(4), 300);
  assert.equal(getResendDelaySeconds(20), 300);
});

test("signup OTP input is normalized and rejects malformed values", () => {
  assert.deepEqual(parseOtpRequest({ email: "  TRAM@example.com " }), { email: "tram@example.com" });
  assert.deepEqual(parseOtpVerification({
    email: " TRAM@example.com ",
    fullName: "  Nguyễn Hà Trâm  ",
    password: validTestPassword,
    otp: "1234",
  }), {
    email: "tram@example.com",
    fullName: "Nguyễn Hà Trâm",
    password: validTestPassword,
    otp: "1234",
  });
  assert.throws(() => parseOtpRequest({ email: "not-an-email" }), /email/i);
  assert.throws(() => parseOtpVerification({ email: "a@example.com", fullName: "A", password: "short", otp: "12a4" }), /đăng ký/i);
});

test("OTP generation always returns four numeric digits", () => {
  for (let index = 0; index < 100; index += 1) {
    assert.match(generateOtpCode(), /^\d{4}$/);
  }
});

test("OTP hashes are bound to both email and server secret", async () => {
  const hash = await hashOtp("tram@example.com", "1234", "a".repeat(32));
  assert.equal(await verifyOtpHash("tram@example.com", "1234", "a".repeat(32), hash), true);
  assert.equal(await verifyOtpHash("tram@example.com", "6543", "a".repeat(32), hash), false);
  assert.equal(await verifyOtpHash("other@example.com", "1234", "a".repeat(32), hash), false);
  assert.equal(await verifyOtpHash("tram@example.com", "1234", "b".repeat(32), hash), false);
});

test("OTP email escapes configured shop text and never interpolates raw HTML", () => {
  const email = renderOtpEmail({ shopName: "Trâm <script>alert(1)</script>", otp: "1234" });
  assert.match(email.htmlContent, /1234/);
  assert.doesNotMatch(email.htmlContent, /<script>/);
  assert.match(email.htmlContent, /&lt;script&gt;/);
  assert.match(email.textContent, /Mã xác nhận: 1234/);
});
