import { products } from "../../lib/catalog";
import { journalArticles } from "../../lib/journal";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paths = ["", "/hoa", "/gioi-thieu", "/chinh-sach-giao-hang", "/lien-he", "/nhat-ky", "/tra-cuu-don"];
  const urls = [...paths, ...products.map((product) => `/hoa/${product.slug}`), ...journalArticles.map((article) => `/nhat-ky/${article.slug}`)];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((path) => `<url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq></url>`),
    "</urlset>",
  ].join("");
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
