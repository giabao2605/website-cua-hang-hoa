import { products as fallbackProducts, type Product } from "./catalog.ts";
import type { ShippingRule } from "./commerce.ts";
import { getD1Binding } from "./platform.ts";
import { shippingRules as fallbackShippingRules } from "./site.ts";

type ProductRow = Record<string, string | number | null>;

function parseStringList(value: unknown, fallback: readonly string[]): string[] {
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? [...parsed] : [...fallback];
  } catch {
    return [...fallback];
  }
}

function rowToProduct(row: ProductRow): Product {
  const fallback = fallbackProducts.find((item) => item.id === row.id);
  return {
    id: String(row.id),
    slug: String(row.slug),
    sku: String(row.sku),
    name: String(row.name),
    subtitle: String(row.subtitle),
    description: String(row.description),
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? undefined : Number(row.compare_at_price),
    image: String(row.image_url),
    gallery: parseStringList(row.gallery_json, fallback?.gallery ?? [String(row.image_url)]),
    category: String(row.category) as Product["category"],
    occasions: parseStringList(row.occasions_json, fallback?.occasions ?? []),
    flowers: parseStringList(row.flowers_json, fallback?.flowers ?? []),
    palette: String(row.palette),
    seasonal: String(row.seasonal),
    stock: Number(row.stock),
    featured: Boolean(row.featured),
    badge: row.badge ? String(row.badge) : undefined,
  };
}

export async function getCatalogProducts(options: { includeInactive?: boolean } = {}): Promise<Product[]> {
  const db = getD1Binding();
  if (!db) return [...fallbackProducts];
  try {
    const condition = options.includeInactive ? "" : "WHERE p.active = 1 AND v.active = 1";
    const result = await db.prepare(`
      SELECT p.id, p.sku, p.slug, p.name, p.subtitle, p.description, p.category,
        p.seasonal, p.image_url, p.gallery_json, p.occasions_json, p.flowers_json,
        p.palette, p.badge, p.active, p.featured, p.sort_order,
        v.price, v.compare_at_price, v.stock
      FROM products p
      JOIN product_variants v ON v.product_id = p.id
      ${condition}
      ORDER BY p.sort_order ASC, p.created_at ASC
    `).all<ProductRow>();
    return result.results.length ? result.results.map(rowToProduct) : [...fallbackProducts];
  } catch {
    return [...fallbackProducts];
  }
}

export async function getCatalogProduct(slug: string): Promise<Product | undefined> {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug);
}

export async function getFeaturedCatalogProducts(): Promise<Product[]> {
  const products = await getCatalogProducts();
  return products.filter((product) => product.featured);
}

export async function getShippingRules(): Promise<ShippingRule[]> {
  const db = getD1Binding();
  if (!db) return [...fallbackShippingRules];
  try {
    const result = await db.prepare("SELECT id, kind, value, fee, priority, active FROM shipping_rules ORDER BY priority DESC").all<Record<string, string | number>>();
    if (!result.results.length) return [...fallbackShippingRules];
    return result.results.map((row) => ({
      id: String(row.id),
      kind: String(row.kind) as ShippingRule["kind"],
      value: String(row.value),
      fee: Number(row.fee),
      priority: Number(row.priority),
      active: Boolean(row.active),
    }));
  } catch {
    return [...fallbackShippingRules];
  }
}
