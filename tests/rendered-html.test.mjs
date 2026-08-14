import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(html, /Vườn Trong Nắng/);
  assert.match(html, /0838 469 089/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("homepage renders the seasonal editorial and three-step delivery ritual", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  const editorial = html.match(/<section[^>]*class="[^"]*\bseasonal-editorial\b[^"]*"[^>]*>[\s\S]*?<\/section>/);
  assert.ok(editorial, "expected a seasonal editorial region");
  assert.match(editorial[0], /class="[^"]*\bseasonal-marquee\b/);
  const marqueeGroups = [...editorial[0].matchAll(/<div(?=[^>]*class="[^"]*\bseasonal-marquee-group\b[^"]*")[^>]*>/g)];
  assert.equal(marqueeGroups.length, 2, "expected two equal marquee groups");
  assert.match(marqueeGroups[1][0], /aria-hidden="true"/);

  const delivery = html.match(/<section[^>]*class="[^"]*\bdelivery-ritual\b[^"]*"[^>]*>[\s\S]*?<\/section>/);
  assert.ok(delivery, "expected a delivery ritual region");
  assert.equal(delivery[0].match(/<article\b/g)?.length, 3);
  assert.match(delivery[0], /href="\/chinh-sach-giao-hang"/);
});

test("motion styles preserve the reduced-motion fallback", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.seasonal-marquee-group\s*\{[^}]*min-width:\s*100vw\s*;/);
  assert.match(css, /@keyframes\s+seasonalMarquee\s*\{[\s\S]*?translateX\(-50%\)[\s\S]*?\}/);

  const reducedMotion = [...css.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/g)]
    .find((block) => block[1].includes(".seasonal-marquee-track"))?.[1];
  assert.ok(reducedMotion, "expected a storefront reduced-motion block");
  assert.match(reducedMotion, /\.seasonal-marquee-track[\s\S]*?\{[^}]*animation:\s*none\s*!important/);
  assert.match(reducedMotion, /opacity:\s*1\s*!important/);
});

test("server-renders distinct seasonal and occasion shopping journeys", async () => {
  const seasonal = await render("/hoa");
  assert.equal(seasonal.status, 200);
  const seasonalHtml = await seasonal.text();
  assert.match(seasonalHtml, /class="[^"]*\bseasonal-page-hero\b/);
  assert.match(seasonalHtml, /Hoa theo mùa/);
  assert.doesNotMatch(seasonalHtml, /Bạn đang chọn hoa cho dịp nào/);

  const occasion = await render("/dip-tang");
  assert.equal(occasion.status, 200);
  const occasionHtml = await occasion.text();
  assert.match(occasionHtml, /class="[^"]*\boccasion-page-hero\b/);
  assert.match(occasionHtml, /Chọn một khoảnh khắc/);
  assert.match(occasionHtml, /Bạn đang chọn hoa cho dịp nào/);
  assert.notEqual(occasionHtml, seasonalHtml);

  const birthday = await render("/dip-tang?occasion=Sinh%20nh%E1%BA%ADt");
  assert.equal(birthday.status, 200);
  const birthdayHtml = await birthday.text();
  assert.match(birthdayHtml, /Vườn Trong Nắng/);
  assert.doesNotMatch(birthdayHtml, /Hẹn Nhau Mùa Hồng/);
});

test("server-renders the protected admin boundary", async () => {

  const admin = await render("/admin");
  assert.equal(admin.status, 200);
  const adminHtml = await admin.text();
  assert.match(adminHtml, /Bạn cần đăng nhập|Tài khoản chưa có quyền quản trị/);
  assert.match(adminHtml, /class="section admin-access-page"/);
});

test("serves crawler directives and the product sitemap", async () => {
  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \/admin/);

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.match(xml, /<urlset/);
  assert.match(xml, /<loc>[^<]*\/dip-tang<\/loc>/);
  const productSlugs = [
    "vuon-trong-nang",
    "nang-goi-niem-vui",
    "hen-nhau-mua-hong",
    "dao-choi-trong-vuon",
    "chuong-trang-binh-yen",
    "trang-xanh",
    "vuon-co-tich",
    "cham-may",
    "tu-cau-be-xinh",
    "sac-mau-le-hoi",
    "sanh-doi-hong-lam",
    "may-lam",
  ];
  for (const slug of productSlugs) assert.match(xml, new RegExp(`/hoa/${slug}`));
  assert.doesNotMatch(xml, /\/hoa\/(?:amour-bleu|pastel-poetry|morning-mist|garden-whisper|spring-lullaby|blue-sonata|romance-deep|sunlit-joy|me-oi|ghe-tham|bui-phan|loi-hen-do|nha-co-em|hien-nha-moi|loc-xuan|ngay-chung-doi|sanh-buoc|mo-loi|mot-loi-tien|ban-tiec-chom-thu)(?:<|\/)/);
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
