import assert from "node:assert/strict";
import test from "node:test";
import { POST, PUT } from "../../app/api/auth/signup-otp/route.ts";
import { resetRateLimitsForTests } from "../../lib/api-security.ts";

test("signup OTP routes reject missing and foreign origins before processing", async () => {
  resetRateLimitsForTests();
  const foreign = await POST(jsonRequest("POST", { email: "tram@example.com" }, "https://attacker.example"));
  const missing = await PUT(new Request("https://tram.example/api/auth/signup-otp", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  }));

  assert.equal(foreign.status, 403);
  assert.equal(missing.status, 403);
  assert.equal(((await foreign.json()) as ErrorResponse).error.code, "forbidden_origin");
});

test("signup OTP route fails closed when server secrets are unavailable", async () => {
  resetRateLimitsForTests();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.BREVO_API_KEY;
  delete process.env.OTP_HMAC_SECRET;

  const response = await POST(jsonRequest("POST", { email: "tram@example.com" }));
  const body = await response.json() as ErrorResponse;
  assert.equal(response.status, 503);
  assert.equal(body.error.code, "otp_not_configured");
});

test("signup OTP route rejects malformed JSON without exposing internals", async () => {
  resetRateLimitsForTests();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "server-only-test-key";
  process.env.BREVO_API_KEY = "brevo-test-key";
  process.env.OTP_HMAC_SECRET = "s".repeat(32);
  const response = await POST(new Request("https://tram.example/api/auth/signup-otp", {
    method: "POST",
    headers: { origin: "https://tram.example", "content-type": "application/json" },
    body: "{invalid",
  }));
  const body = await response.json() as ErrorResponse;

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "invalid_request");
  assert.equal(JSON.stringify(body).includes("server-only-test-key"), false);
});

function jsonRequest(method: "POST" | "PUT", body: unknown, origin = "https://tram.example") {
  return new Request("https://tram.example/api/auth/signup-otp", {
    method,
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

type ErrorResponse = { error: { code: string } };
