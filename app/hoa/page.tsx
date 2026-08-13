import type { Metadata } from "next";
import { CatalogBrowser } from "../../components/catalog-browser";
import { getCatalogProducts } from "../../lib/catalog-store";

export const metadata: Metadata = { title: "Cửa hàng hoa", description: "Khám phá hoa tươi theo mùa, bó hoa, giỏ hoa và thiết kế cho mọi dịp tại Trâm Florist." };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const products = await getCatalogProducts();
  return (
    <>
      <section className="page-hero page-hero-catalog"><div className="container"><span className="eyebrow eyebrow-light">Hoa tươi theo mùa</span><h1>Tìm bó hoa dành riêng cho khoảnh khắc này</h1><p>Thiết kế thủ công, bảng màu tinh tế và được linh hoạt theo những cành hoa đẹp nhất trong mùa.</p></div></section>
      <section className="section catalog-section"><div className="container"><CatalogBrowser products={products} initialQuery={params.q ?? ""} /></div></section>
    </>
  );
}
