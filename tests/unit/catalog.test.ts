import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { products } from "../../lib/catalog.ts";

test("fallback catalog exposes 20 uniquely addressable products", () => {
  assert.equal(products.length, 20);
  for (const key of ["id", "slug", "sku", "image"] as const) {
    assert.equal(new Set(products.map((product) => product[key])).size, 20, `${key} must be unique`);
  }
});

test("original catalog products use their approved Vietnamese names", () => {
  const namesBySlug = {
    "amour-bleu": "Tình Xanh",
    "pastel-poetry": "Vần Thơ Màu Phấn",
    "morning-mist": "Sương Mai",
    "garden-whisper": "Lời Thì Thầm Của Vườn",
    "spring-lullaby": "Khúc Ru Mùa Xuân",
    "blue-sonata": "Khúc Xanh",
    "romance-deep": "Tình Nồng",
    "sunlit-joy": "Nắng Vui",
  } as const;
  const seed = readFileSync(new URL("../../db/seed.sql", import.meta.url), "utf8");
  const migration = readFileSync(new URL("../../drizzle/0009_localize_legacy_product_names.sql", import.meta.url), "utf8");

  for (const [slug, name] of Object.entries(namesBySlug)) {
    assert.equal(products.find((product) => product.slug === slug)?.name, name, slug);
    assert.match(seed, new RegExp(`\\('${slug}',[^\\n]*'${name}'`), `${slug} seed name`);
    assert.ok(migration.includes(`SET name = '${name}'\nWHERE id = '${slug}'`), `${slug} migration name`);
  }
});

test("catalog additions 009 through 020 are complete commerce products", () => {
  const expectedSuffixes = Array.from({ length: 12 }, (_, index) => String(index + 9).padStart(3, "0"));
  const additions = products.filter((product) => expectedSuffixes.includes(product.sku.slice(-3)));
  assert.deepEqual(additions.map((product) => product.sku.slice(-3)).sort(), expectedSuffixes);

  const categories = new Set(["Bó hoa", "Giỏ hoa", "Hoa cưới", "Hoa sự kiện"]);
  for (const product of additions) {
    assert.ok(product.gallery.includes(product.image), `${product.sku} gallery must contain its main image`);
    assert.ok(categories.has(product.category), `${product.sku} has an unsupported category`);
    assert.ok(product.occasions.length > 0, `${product.sku} needs an occasion`);
    assert.ok(product.flowers.length > 0, `${product.sku} needs a flower`);
    assert.ok(product.price > 0, `${product.sku} needs a positive price`);
    assert.ok(product.stock > 0, `${product.sku} needs positive stock`);
  }
});

test("catalog additions have local assets and durable D1 rows", () => {
  const additions = products.slice(8);
  const seed = readFileSync(new URL("../../db/seed.sql", import.meta.url), "utf8");
  const migration = readFileSync(new URL("../../drizzle/0008_add_catalog_products.sql", import.meta.url), "utf8");

  assert.doesNotMatch(migration, /INSERT OR IGNORE INTO (?:products|product_variants)/);
  for (const product of additions) {
    assert.ok(existsSync(new URL(`../../public${product.image}`, import.meta.url)), `${product.sku} image is missing`);
    const productRow = `'${product.id}', '${product.sku}', '${product.slug}'`;
    const variantId = `'${product.id}-standard', '${product.id}'`;
    assert.ok(seed.includes(productRow), `${product.sku} is missing from seed products`);
    assert.ok(seed.includes(variantId), `${product.sku} is missing from seed variants`);
    assert.ok(migration.includes(productRow), `${product.sku} is missing from migration products`);
    assert.ok(migration.includes(variantId), `${product.sku} is missing from migration variants`);
  }
});
