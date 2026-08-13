import assert from "node:assert/strict";
import test from "node:test";
import {
  assertSameOrigin,
  consumeRateLimit,
  getRequestClientKey,
  parseJsonRequest,
  resetRateLimitsForTests,
  safeInternalPath,
} from "../../lib/api-security.ts";

test("same-origin protection rejects missing and foreign origins", () => {
  assert.throws(() => assertSameOrigin(new Request("http://localhost/api", { method: "POST" })), /nguồn yêu cầu/i);
  assert.throws(() => assertSameOrigin(new Request("http://localhost/api", { method: "POST", headers: { origin: "https://attacker.example" } })), /nguồn yêu cầu/i);
  assert.doesNotThrow(() => assertSameOrigin(new Request("http://localhost/api", { method: "POST", headers: { origin: "http://localhost" } })));
});

test("redirect validation permits local paths and rejects protocol-relative URLs", () => {
  assert.equal(safeInternalPath("/tai-khoan?mode=reset", "/"), "/tai-khoan?mode=reset");
  assert.equal(safeInternalPath("//attacker.example", "/tai-khoan"), "/tai-khoan");
  assert.equal(safeInternalPath("https://attacker.example", "/tai-khoan"), "/tai-khoan");
  assert.equal(safeInternalPath("/\\attacker.example", "/tai-khoan"), "/tai-khoan");
  assert.equal(safeInternalPath("/tai-khoan\nnext", "/tai-khoan"), "/tai-khoan");
});

test("bounded JSON parsing rejects oversized payloads", async () => {
  const small = new Request("http://localhost/api", { method: "POST", body: JSON.stringify({ ok: true }), headers: { "content-type": "application/json" } });
  assert.deepEqual(await parseJsonRequest(small, 100), { ok: true });

  const large = new Request("http://localhost/api", { method: "POST", body: JSON.stringify({ value: "x".repeat(200) }), headers: { "content-type": "application/json" } });
  await assert.rejects(() => parseJsonRequest(large, 100), /quá lớn/i);
});

test("JSON parsing rejects wrong media types and malformed bodies", async () => {
  const text = new Request("http://localhost/api", { method: "POST", body: "hello", headers: { "content-type": "text/plain" } });
  await assert.rejects(() => parseJsonRequest(text), /định dạng JSON/i);
  const malformed = new Request("http://localhost/api", { method: "POST", body: "{", headers: { "content-type": "application/json" } });
  await assert.rejects(() => parseJsonRequest(malformed), /JSON không hợp lệ/i);
});

test("client key prefers Cloudflare address and has a local fallback", () => {
  const request = new Request("http://localhost/api", { headers: { "cf-connecting-ip": "203.0.113.8", "x-forwarded-for": "198.51.100.2" } });
  assert.equal(getRequestClientKey(request), "203.0.113.8");
  assert.equal(getRequestClientKey(new Request("http://localhost/api")), "local");
});

test("rate limiter closes after the configured number of attempts", () => {
  resetRateLimitsForTests();
  assert.equal(consumeRateLimit("track:127.0.0.1", 2, 60_000, 1_000), true);
  assert.equal(consumeRateLimit("track:127.0.0.1", 2, 60_000, 1_001), true);
  assert.equal(consumeRateLimit("track:127.0.0.1", 2, 60_000, 1_002), false);
  assert.equal(consumeRateLimit("track:127.0.0.1", 2, 60_000, 61_001), true);
});
