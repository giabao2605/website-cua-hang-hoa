import assert from "node:assert/strict";
import test from "node:test";
import {
  assertPaymentTransition,
  createShippingRuleId,
  detectImageExtension,
  parseAdminProductInput,
  parseShippingRuleInput,
  parseShippingRuleUpdate,
  parseSiteSettingsInput,
} from "../../lib/admin-domain.ts";

test("admin product validation preserves valid integer VND and stock", () => {
  const source = {
    id: "amour-bleu",
    sku: "TF-BQ-001",
    slug: "amour-bleu",
    name: "Tình Xanh",
    subtitle: "Cẩm tú cầu xanh",
    description: "Một thiết kế hoa xanh thanh lịch và được kết thủ công.",
    category: "Bó hoa",
    seasonal: "Quanh năm",
    image: "/products/amour-bleu.jpg",
    gallery: ["/products/amour-bleu.jpg"],
    occasions: ["Sinh nhật", "Sinh nhật", " Kỷ niệm "],
    flowers: ["Cẩm tú cầu"],
    palette: "Xanh - hồng",
    price: 890_000,
    compareAtPrice: 990_000,
    stock: 12,
    active: true,
    featured: true,
    badge: "Bán chạy",
  };

  const parsed = parseAdminProductInput(source);

  assert.equal(parsed.price, 890_000);
  assert.equal(parsed.stock, 12);
  assert.deepEqual(parsed.occasions, ["Sinh nhật", "Kỷ niệm"]);
  assert.deepEqual(source.occasions, ["Sinh nhật", "Sinh nhật", " Kỷ niệm "]);
});

test("payment review never jumps from pending MoMo straight to paid", () => {
  assert.doesNotThrow(() => assertPaymentTransition("MOMO", "pending", "payment_review"));
  assert.doesNotThrow(() => assertPaymentTransition("MOMO", "payment_review", "paid"));
  assert.throws(() => assertPaymentTransition("MOMO", "pending", "paid"), /thanh toán/i);
  assert.throws(() => assertPaymentTransition("COD", "cod_pending", "paid"), /thanh toán/i);
  assert.doesNotThrow(() => assertPaymentTransition("COD", "cod_pending", "collected"));
});

test("admin product validation rejects unsafe slugs and negative commerce values", () => {
  const base = {
    id: "x",
    sku: "TF-X-001",
    slug: "hoa dep<script>",
    name: "Hoa đẹp",
    subtitle: "Thiết kế theo mùa",
    description: "Mô tả sản phẩm đủ dài để hiển thị rõ cho khách hàng.",
    category: "Bó hoa",
    seasonal: "Quanh năm",
    image: "/products/x.jpg",
    gallery: ["/products/x.jpg"],
    occasions: ["Sinh nhật"],
    flowers: ["Hồng"],
    palette: "Hồng",
    price: -1,
    stock: -1,
    active: true,
    featured: false,
  };

  assert.throws(() => parseAdminProductInput(base), /dữ liệu sản phẩm/i);
});

test("shipping update accepts integer VND and rejects unreasonable fees", () => {
  assert.deepEqual(parseShippingRuleUpdate({ fee: 85_000, estimate: "1 - 2 ngày", active: true }), {
    fee: 85_000,
    estimate: "1 - 2 ngày",
    active: true,
  });
  assert.throws(() => parseShippingRuleUpdate({ fee: 10_000_000, estimate: "ngay", active: true }), /phí giao/i);
});

test("admin can create a complete shipping route", () => {
  assert.equal(createShippingRuleId("province", "Phú Yên"), "province-phu-yen");
  assert.equal(createShippingRuleId("locality", "Xã Tuy An Bắc"), "locality-xa-tuy-an-bac");
  assert.deepEqual(parseShippingRuleInput({
    id: "phu-yen",
    name: "Khu vực Phú Yên",
    kind: "province",
    value: "Phú Yên",
    fee: 65_000,
    estimate: "Trong ngày hoặc ngày kế tiếp",
    priority: 180,
    active: true,
  }), {
    id: "phu-yen",
    name: "Khu vực Phú Yên",
    kind: "province",
    value: "Phú Yên",
    fee: 65_000,
    estimate: "Trong ngày hoặc ngày kế tiếp",
    priority: 180,
    active: true,
  });
  assert.throws(() => parseShippingRuleInput({
    id: "../x",
    name: "X",
    kind: "unknown",
    value: "",
    fee: -1,
    estimate: "ngay",
    priority: 0,
    active: true,
  }), /tuyến giao/i);
});

test("operational settings normalize phones and require a real payment method", () => {
  const source = {
    shopName: "Trâm Florist",
    tagline: "Trao một mùa hoa, giữ một đời thương",
    phone: "0838 469 089",
    address: "Xã Tuy An Bắc, Tỉnh Đắk Lắk",
    openingHours: "08:00 - 17:00, Thứ Hai - Chủ Nhật",
    zaloUrl: "https://zalo.me/0838469089",
    momoNumber: "+84 838 469 089",
    momoOwner: "Nguyễn Lâm Gia Bảo",
    momoQrImage: "/media/products/2026/08/momo-qr.png",
    otpSenderEmail: " SHOP@EXAMPLE.COM ",
    codEnabled: true,
    momoEnabled: true,
  };

  const parsed = parseSiteSettingsInput(source);
  assert.equal(parsed.phone, "0838469089");
  assert.equal(parsed.momoNumber, "0838469089");
  assert.equal(parsed.momoQrImage, "/media/products/2026/08/momo-qr.png");
  assert.equal(parsed.otpSenderEmail, "shop@example.com");
  assert.equal(source.phone, "0838 469 089");
  assert.equal(parseSiteSettingsInput({ ...source, momoQrImage: "/payment/momo-qr.png" }).momoQrImage, "/payment/momo-qr.png");
  assert.throws(() => parseSiteSettingsInput({ ...source, codEnabled: false, momoEnabled: false }), /thanh toán/i);
  assert.throws(() => parseSiteSettingsInput({ ...source, momoOwner: "Chờ chủ shop xác nhận", momoEnabled: true }), /MoMo/i);
  assert.throws(() => parseSiteSettingsInput({ ...source, zaloUrl: "javascript:alert(1)" }), /vận hành/i);
  assert.throws(() => parseSiteSettingsInput({ ...source, momoQrImage: "https://example.com/momo-qr.png" }), /vận hành/i);
  assert.throws(() => parseSiteSettingsInput({ ...source, otpSenderEmail: "not-an-email" }), /vận hành/i);
});

test("image sniffing accepts real JPEG, PNG and WebP signatures only", () => {
  assert.equal(detectImageExtension(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "jpg");
  assert.equal(detectImageExtension(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "png");
  assert.equal(detectImageExtension(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), "webp");
  assert.equal(detectImageExtension(new TextEncoder().encode("<script>alert(1)</script>")), null);
});
