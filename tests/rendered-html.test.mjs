import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

test("homepage renders the streamlined commerce story in the intended order", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();

  const hero = html.match(/<section[^>]*class="[^"]*\bhero\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.ok(hero, "expected a homepage hero");
  assert.doesNotMatch(hero, /hero-proof|hero-season-card/);
  assert.doesNotMatch(hero, /hero-edition/);
  assert.doesNotMatch(hero, /Hoa tươi tuyển chọn mỗi ngày|Mùa này Trâm có/);

  const occasionIndex = html.search(/class="[^"]*\boccasion-section\b/);
  const featuredIndex = html.search(/class="[^"]*\bcollection-section\b/);
  assert.ok(occasionIndex >= 0 && featuredIndex >= 0 && occasionIndex < featuredIndex, "expected occasion discovery before featured designs");
  const occasion = html.match(/<section[^>]*class="[^"]*\boccasion-section\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(occasion, /class="[^"]*\boccasion-intro\b/);
  assert.match(occasion, /class="[^"]*\boccasion-rail\b/);

  const trust = html.match(/<section[^>]*class="[^"]*\btrust-strip\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(trust, /class="[^"]*\btrust-band\b/);
  assert.match(trust, /class="[^"]*\btrust-grid\b/);
  assert.match(trust, /class="[^"]*\bseasonal-marquee\b/);
  assert.doesNotMatch(html, /class="[^"]*\bseasonal-editorial\b/);
  const marqueeGroups = [...trust.matchAll(/<div(?=[^>]*class="[^"]*\bseasonal-marquee-group\b[^"]*")[^>]*>/g)];
  assert.equal(marqueeGroups.length, 2, "expected two equal marquee groups");
  assert.match(marqueeGroups[1][0], /aria-hidden="true"/);

  const featured = html.match(/<section[^>]*class="[^"]*\bcollection-section\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.equal(featured.match(/<article[^>]*class="[^"]*\bproduct-card\b/g)?.length, 8);
  assert.equal(featured.match(/class="[^"]*\bfeatured-lead\b/g)?.length, 1);
  assert.match(featured, /href="\/hoa"[^>]*>[^<]*Xem đủ 12 thiết kế/);

  const story = html.match(/<section[^>]*class="[^"]*\bstory-feature\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(story, /<blockquote[^>]*class="[^"]*\bstory-quote\b/);
  assert.doesNotMatch(html, /class="[^"]*\bquote-section\b/);

  const delivery = html.match(/<section[^>]*class="[^"]*\bdelivery-ritual\b[^"]*"[^>]*>[\s\S]*?<\/section>/);
  assert.ok(delivery, "expected a delivery ritual region");
  assert.equal(delivery[0].match(/<article\b/g)?.length, 3);
  assert.match(delivery[0], /kiểm tra hoa đang có[\s\S]*báo phí giao/i);
  assert.match(delivery[0], /giao theo giờ đã hẹn/i);
  assert.match(delivery[0], /href="\/chinh-sach-giao-hang"[^>]*>[^<]*Xem tuyến và phí giao/);
  assert.doesNotMatch(delivery[0], /Phí giao tạm tính/);

  assert.doesNotMatch(trust, /Ba điều luôn được xác nhận rõ/);

  const journal = html.match(/<section[^>]*class="[^"]*\bjournal-section\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.equal(journal.match(/<article\b/g)?.length, 3, "expected all three journal articles on the homepage");

  assert.ok((html.match(/class="[^"]*\bsection-index\b/g)?.length ?? 0) >= 4, "expected editorial section index markers");

  assert.doesNotMatch(html, /\b(?:customer-reviews?|testimonials?|review-stars)\b|đánh giá từ khách|khách hàng nói/i);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.featured-lead\s*\{[^}]*grid-column:\s*span\s+2\b/);
});

test("motion styles preserve the reduced-motion fallback", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.seasonal-marquee-group\s*\{[^}]*min-width:\s*100vw\s*;/);
  assert.match(css, /@keyframes\s+seasonalMarquee\s*\{[\s\S]*?translateX\(-50%\)[\s\S]*?\}/);

  const sealRule = [...css.matchAll(/\.round-seal\s*\{([^}]*)\}/g)]
    .map((match) => match[1])
    .find((body) => /animation:[^;]*infinite/.test(body));
  assert.ok(sealRule, "expected the round seal to rotate continuously");
  const sealAnimation = sealRule.match(/animation:\s*([\w-]+)\s+([\d.]+)s\s+linear\s+infinite/);
  assert.ok(sealAnimation, "expected a linear infinite round seal animation");
  assert.ok(Number(sealAnimation[2]) >= 12, "expected a slow round seal rotation");
  assert.match(css, new RegExp(`@keyframes\\s+${sealAnimation[1]}\\s*\\{[\\s\\S]*?rotate\\(360deg\\)[\\s\\S]*?\\}`));

  const reducedMotion = [...css.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/g)]
    .find((block) => block[1].includes(".seasonal-marquee-track"))?.[1];
  assert.ok(reducedMotion, "expected a storefront reduced-motion block");
  assert.match(reducedMotion, /\.seasonal-marquee-track[\s\S]*?\{[^}]*animation:\s*none\s*!important/);
  assert.match(reducedMotion, /\.round-seal[\s\S]*?\{[^}]*animation:\s*none\s*!important/);
  assert.match(reducedMotion, /opacity:\s*1\s*!important/);
  for (const selector of [".story-chapters", ".delivery-route-board", ".contact-concierge"]) {
    assert.match(reducedMotion, new RegExp(selector.replace(".", "\\.")), `expected ${selector} in the reduced-motion fallback`);
  }
});

test("editorial page CSS keeps CTA and keyboard focus scoped", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /\.story-page-closing\s+div\s*>\s*div\s*\{/);
  assert.match(css, /\.story-page-closing-layout\s*>\s*div\s*>\s*div\s*\{/);

  const focusRule = css.match(/\.contact-concierge-grid\s*>\s*\*:hover,\s*\.contact-concierge-grid\s*>\s*\*:focus-visible\s*\{[^}]*\}/)?.[0] ?? "";
  assert.ok(focusRule, "expected a shared hover/focus-visible concierge rule");
  assert.doesNotMatch(focusRule, /outline:\s*none/);
  assert.match(focusRule, /(outline|box-shadow):/);
});

test("server-renders distinct story, delivery, and contact journeys", async () => {
  const [story, delivery, contact] = await Promise.all([
    render("/gioi-thieu"),
    render("/chinh-sach-giao-hang"),
    render("/lien-he"),
  ]);
  assert.deepEqual([story.status, delivery.status, contact.status], [200, 200, 200]);

  const [storyHtml, deliveryHtml, contactHtml] = await Promise.all([
    story.text(),
    delivery.text(),
    contact.text(),
  ]);

  assert.match(storyHtml, /class="[^"]*\bstory-page-hero\b/);
  assert.match(storyHtml, /class="[^"]*\bstory-chapters\b/);

  assert.match(deliveryHtml, /class="[^"]*\bdelivery-page-hero\b/);
  assert.match(deliveryHtml, /class="[^"]*\bdelivery-route-board\b/);
  assert.match(deliveryHtml, /Xã Tuy An Bắc/);
  assert.match(deliveryHtml, /25\.000\s*(?:₫|đ)/);
  assert.match(deliveryHtml, /href="\/lien-he#tu-van"/);

  assert.match(contactHtml, /class="[^"]*\bcontact-page-hero\b/);
  assert.match(contactHtml, /class="[^"]*\bcontact-concierge\b/);
  assert.match(contactHtml, /<form[^>]*\bid="tu-van"/);

  assert.equal(new Set([storyHtml, deliveryHtml, contactHtml]).size, 3);
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
  assert.match(occasionHtml, /Bạn đang chọn hoa[\s\S]*?<br\s*\/?>[\s\S]*?cho dịp nào\??/);
  assert.notEqual(occasionHtml, seasonalHtml);

  const birthday = await render("/dip-tang?occasion=Sinh%20nh%E1%BA%ADt");
  assert.equal(birthday.status, 200);
  const birthdayHtml = await birthday.text();
  assert.match(birthdayHtml, /Vườn Trong Nắng/);
  assert.doesNotMatch(birthdayHtml, /Hẹn Nhau Mùa Hồng/);
});

test("editorial surfaces use all eight dedicated images instead of catalog photography", async () => {
  const editorialAssets = [
    "khong-gian-tiem-hoa.webp",
    "bo-hoa-tren-ban-ket.webp",
    "bang-mau-chuc-mung.webp",
    "bo-hoa-xanh-ngoai-troi.webp",
    "mua-hong-ruc-ro.webp",
    "chon-hoa-theo-mua.webp",
    "hoa-tren-hanh-trinh.webp",
    "loi-nhan-mau-hong.webp",
  ];
  const editorialSources = [
    "../app/page.tsx",
    "../app/hoa/page.tsx",
    "../app/dip-tang/page.tsx",
    "../app/gioi-thieu/page.tsx",
    "../app/chinh-sach-giao-hang/page.tsx",
    "../app/lien-he/page.tsx",
    "../lib/journal.ts",
    "../app/globals.css",
  ];
  const source = (await Promise.all(editorialSources.map((path) => readFile(new URL(path, import.meta.url), "utf8")))).join("\n");

  for (const asset of editorialAssets) {
    assert.match(source, new RegExp(`/editorial/${asset.replaceAll(".", "\\.")}`), `expected ${asset} to be used`);
    await access(new URL(`../public/editorial/${asset}`, import.meta.url));
  }
  assert.doesNotMatch(source, /["'(]\/products\//, "editorial surfaces should not hard-code catalog images");
});

test("requested storefront copy and account action semantics are explicit", async () => {
  const story = await render("/gioi-thieu");
  assert.equal(story.status, 200);
  const storyHtml = await story.text();
  assert.match(storyHtml, /Từ Tuy An Bắc,[\s\S]*?<br\s*\/?>[\s\S]*?mỗi mùa hoa thành một lời kể/);
  assert.match(storyHtml, />Dưỡng và ghép<\/h3>/);
  assert.doesNotMatch(storyHtml, />Dưỡng và ghép sắc<\/h3>/);

  const accountSource = await readFile(new URL("../app/tai-khoan/page.tsx", import.meta.url), "utf8");
  assert.match(accountSource, /<button[^>]*className="[^"]*\bbutton-danger\b[^"]*"[^>]*>Đăng xuất<\/button>/);
  assert.doesNotMatch(accountSource, /\bProductCard\b|\brecommendations\b|Gợi ý theo mùa|Thiết kế dành cho bạn/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.button-danger\s*\{[^}]*(?:background|background-color):\s*(?:#[a-f\d]{3,8}|rgb\([^)]*\)|var\(--[^)]*danger[^)]*\))/i);
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
