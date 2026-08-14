import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { products } from "../../lib/catalog.ts";

const expectedProducts = [
  ["vuon-trong-nang", "Vườn Trong Nắng", "TF-BQ-001"],
  ["nang-goi-niem-vui", "Nắng Gọi Niềm Vui", "TF-BQ-002"],
  ["hen-nhau-mua-hong", "Hẹn Nhau Mùa Hồng", "TF-BQ-003"],
  ["dao-choi-trong-vuon", "Dạo Chơi Trong Vườn", "TF-BQ-004"],
  ["chuong-trang-binh-yen", "Chuông Trắng Bình Yên", "TF-BQ-005"],
  ["trang-xanh", "Trăng Xanh", "TF-BQ-006"],
  ["vuon-co-tich", "Vườn Cổ Tích", "TF-GH-007"],
  ["cham-may", "Chạm Mây", "TF-HC-008"],
  ["tu-cau-be-xinh", "Tú Cầu Bé Xinh", "TF-BQ-009"],
  ["sac-mau-le-hoi", "Sắc Màu Lễ Hội", "TF-BQ-010"],
  ["sanh-doi-hong-lam", "Sánh Đôi Hồng Lam", "TF-HC-011"],
  ["may-lam", "Mây Lam", "TF-BQ-012"],
] as const;

const retiredProducts = [
  ["amour-bleu", "Tình Xanh"],
  ["pastel-poetry", "Vần Thơ Màu Phấn"],
  ["morning-mist", "Sương Mai"],
  ["garden-whisper", "Lời Thì Thầm Của Vườn"],
  ["spring-lullaby", "Khúc Ru Mùa Xuân"],
  ["blue-sonata", "Khúc Xanh"],
  ["romance-deep", "Tình Nồng"],
  ["sunlit-joy", "Nắng Vui"],
  ["me-oi", "Mẹ Ơi"],
  ["ghe-tham", "Ghé Thăm"],
  ["bui-phan", "Bụi Phấn"],
  ["loi-hen-do", "Lời Hẹn Đỏ"],
  ["nha-co-em", "Nhà Có Em"],
  ["hien-nha-moi", "Hiên Nhà Mới"],
  ["loc-xuan", "Lộc Xuân"],
  ["ngay-chung-doi", "Ngày Chung Đôi"],
  ["sanh-buoc", "Sánh Bước"],
  ["mo-loi", "Mở Lối"],
  ["mot-loi-tien", "Một Lời Tiễn"],
  ["ban-tiec-chom-thu", "Bàn Tiệc Chớm Thu"],
] as const;

test("fallback catalog exposes exactly the 12 approved products", () => {
  assert.deepEqual(products.map(({ slug, name, sku }) => [slug, name, sku]), expectedProducts);
  assert.equal(products[0]?.price, 690_000);
  assert.equal(products.filter((product) => product.featured).length, 8);
  assert.equal(products.find((product) => product.id === "dao-choi-trong-vuon")?.featured, true);
  for (const key of ["id", "slug", "sku", "image"] as const) {
    assert.equal(new Set(products.map((product) => product[key])).size, 12, `${key} must be unique`);
  }
});

test("catalog products have complete commerce metadata and normalized assets", () => {
  const categories = new Set(["Bó hoa", "Giỏ hoa", "Hoa cưới", "Hoa sự kiện"]);
  for (const product of products) {
    assert.equal(product.id, product.slug, `${product.slug} id must match its slug`);
    assert.match(product.sku, /^TF-(?:BQ|GH|HC|SK)-\d{3}$/);
    assert.match(product.image, new RegExp(`^/products/${product.slug}\\.(?:jpe?g|png|webp)$`));
    assert.ok(product.gallery.includes(product.image), `${product.sku} gallery must contain its main image`);
    assert.ok(existsSync(new URL(`../../public${product.image}`, import.meta.url)), `${product.sku} image is missing`);
    assert.ok(categories.has(product.category), `${product.sku} has an unsupported category`);
    assert.ok(product.description.length >= 60, `${product.sku} needs a useful description`);
    assert.ok(product.occasions.length > 0, `${product.sku} needs an occasion`);
    assert.ok(product.flowers.length > 0, `${product.sku} needs a flower`);
    assert.ok(product.price > 0, `${product.sku} needs a positive price`);
    assert.ok(product.stock > 0, `${product.sku} needs positive stock`);
  }
});

test("seed contains only the new catalog and standard variants", () => {
  const seed = readFileSync(new URL("../../db/seed.sql", import.meta.url), "utf8");

  for (const product of products) {
    assert.ok(seed.includes(`'${product.id}', '${product.sku}', '${product.slug}', '${product.name}'`), `${product.sku} is missing from seed products`);
    assert.ok(seed.includes(`'${product.id}-standard', '${product.id}'`), `${product.sku} is missing from seed variants`);
  }
  for (const [slug, name] of retiredProducts) {
    assert.equal(seed.includes(`'${slug}'`), false, `${slug} must be removed from the seed`);
    assert.equal(seed.includes(`'${name}'`), false, `${name} must be removed from the seed`);
  }
});

test("a new migration clears demo history and replaces the durable catalog", () => {
  const migrationUrl = new URL("../../drizzle/0010_replace_demo_catalog.sql", import.meta.url);
  assert.ok(existsSync(migrationUrl), "expected drizzle/0010_replace_demo_catalog.sql");
  const migration = readFileSync(migrationUrl, "utf8");
  const deleteOrder = ["payment_evidence", "order_events", "order_items", "orders", "product_variants", "products"]
    .map((table) => migration.search(new RegExp(`DELETE\\s+FROM\\s+${table}\\b`, "i")));

  assert.ok(deleteOrder.every((position) => position >= 0), "migration must clear demo history, variants, and products");
  assert.deepEqual(deleteOrder, [...deleteOrder].sort((a, b) => a - b), "migration deletes must respect relationship order");
  assert.match(migration, /retired_product_ids/i, "migration must identify only the retired catalog rows");
  assert.match(migration, /retired_demo_order_ids/i, "migration must identify only orders containing retired products");
  for (const table of ["payment_evidence", "order_events", "order_items", "orders"]) {
    assert.doesNotMatch(migration, new RegExp(`DELETE\\s+FROM\\s+${table}\\s*;`, "i"), `${table} must not be cleared globally`);
  }
  for (const product of products) {
    assert.ok(migration.includes(`'${product.id}', '${product.sku}', '${product.slug}', '${product.name}'`), `${product.sku} is missing from migration products`);
    assert.ok(migration.includes(`'${product.id}-standard', '${product.id}'`), `${product.sku} is missing from migration variants`);
  }
});
