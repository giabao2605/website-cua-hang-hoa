import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/safe-link";
import { ChevronRight, Flower2, ShieldCheck, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductCard } from "../../../components/product-card";
import { ProductDetailActions } from "../../../components/product-detail-actions";
import { formatVnd } from "../../../lib/commerce";
import { products as fallbackProducts } from "../../../lib/catalog";
import { getCatalogProduct, getCatalogProducts } from "../../../lib/catalog-store";

export function generateStaticParams() { return fallbackProducts.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const product = await getCatalogProduct(slug); return product ? { title: product.name, description: product.description } : {}; }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) notFound();
  const products = await getCatalogProducts();
  const related = products.filter((item) => item.id !== product.id && (item.category === product.category || item.palette === product.palette)).slice(0, 3);
  return (
    <>
      <div className="container breadcrumbs"><Link href="/">Trang chủ</Link><ChevronRight /><Link href="/hoa">Cửa hàng</Link><ChevronRight /><span>{product.name}</span></div>
      <section className="container product-detail">
        <div className="product-gallery"><div className="gallery-main"><Image src={product.image} alt={`${product.name} - ${product.subtitle}`} fill priority sizes="(max-width: 900px) 100vw, 55vw" />{product.badge && <span className="product-badge">{product.badge}</span>}</div><div className="gallery-thumbs">{product.gallery.slice(1).map((image, index) => <div key={image}><Image src={image} alt={`${product.name} góc chụp ${index + 2}`} fill sizes="25vw" /></div>)}</div></div>
        <div className="product-summary"><span className="eyebrow">{product.category} · {product.seasonal}</span><h1>{product.name}</h1><p className="product-subtitle">{product.subtitle}</p><div className="detail-price">{formatVnd(product.price)}{product.compareAtPrice && <del>{formatVnd(product.compareAtPrice)}</del>}</div><p className="detail-description">{product.description}</p><div className="product-meta"><div><span>Hoa chính</span><strong>{product.flowers.join(", ")}</strong></div><div><span>Bảng màu</span><strong>{product.palette}</strong></div><div><span>Tình trạng</span><strong>{product.stock > 0 ? `Còn ${product.stock} thiết kế` : "Tạm hết"}</strong></div></div><ProductDetailActions product={product} /><p className="season-note"><Flower2 /> Vì sử dụng hoa tươi theo mùa, một vài loại hoa có thể được thay bằng loại tương đương nhưng vẫn giữ đúng bảng màu và giá trị thiết kế.</p><div className="detail-benefits"><span><Truck />Giao toàn quốc, phí tạm tính theo khu vực</span><span><ShieldCheck />Xác nhận ảnh trước khi giao theo yêu cầu</span></div></div>
      </section>
      <section className="section related-section"><div className="container"><div className="section-heading split-heading"><div><span className="eyebrow">Có thể bạn cũng thích</span><h2>Những thiết kế cùng cảm xúc</h2></div></div><div className="product-grid related-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section>
    </>
  );
}
