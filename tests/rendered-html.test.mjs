import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders Trâm Florist storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Trâm Florist/);
  assert.match(html, /Để hoa nói hộ/);
  assert.match(html, /Hoa tươi theo mùa/);
  assert.match(html, /Amour Bleu/);
  assert.match(html, /0838 469 089/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders catalog and protected admin boundary", async () => {
  const catalog = await render("/hoa");
  assert.equal(catalog.status, 200);
  assert.match(await catalog.text(), /Tìm bó hoa dành riêng/);

  const admin = await render("/admin");
  assert.equal(admin.status, 200);
  assert.match(await admin.text(), /Bạn cần đăng nhập|Tài khoản chưa có quyền quản trị/);
});

test("serves crawler directives and the product sitemap", async () => {
  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \/admin/);

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.match(xml, /<urlset/);
  assert.match(xml, /\/hoa\/amour-bleu/);
  assert.match(xml, /\/nhat-ky\/giu-cam-tu-cau-tuoi-lau-ngay-he/);
});

test("server-renders the journal index and a complete article", async () => {
  const index = await render("/nhat-ky");
  assert.equal(index.status, 200);
  assert.match(await index.text(), /Chăm hoa và chọn hoa|Hiểu hoa hơn/);

  const article = await render("/nhat-ky/giu-cam-tu-cau-tuoi-lau-ngay-he");
  assert.equal(article.status, 200);
  const html = await article.text();
  assert.match(html, /5 cách giữ cẩm tú cầu/);
  assert.match(html, /Cắt lại gốc ngay khi nhận hoa/);
  assert.match(html, /Có thể bạn cũng quan tâm/);
  assert.match(html, /Chọn bảng màu hoa phù hợp/);
  assert.match(html, /Một buổi sáng kết hoa theo mùa/);
  assert.doesNotMatch(html, /Những thiết kế dành cho bạn/);
});
