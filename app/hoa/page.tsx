import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/safe-link";
import { CatalogBrowser } from "../../components/catalog-browser";
import { getCatalogProducts } from "../../lib/catalog-store";

export const metadata: Metadata = { title: "Hoa theo mùa", description: "Khám phá hoa tươi theo mùa, được Trâm chọn cành và kết thủ công theo nhịp hoa đang đẹp." };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const products = await getCatalogProducts();
  const readyNow = products.filter((product) => !product.seasonal.toLocaleLowerCase("vi").includes("đặt trước")).length;
  const advanceOrder = products.length - readyNow;
  return (
    <>
      <section className="seasonal-page-hero">
        <div className="container seasonal-hero-layout">
          <div className="seasonal-hero-copy"><span className="eyebrow eyebrow-light">Hoa theo mùa</span><h1>Mỗi mùa hoa,<br />một vẻ đẹp riêng.</h1><p>Trâm chọn những cành đang ở độ đẹp nhất, giữ đúng bảng màu của mẫu và để mỗi bó hoa có nét tự nhiên không lặp lại.</p><Link className="button button-gold" href="#bo-suu-tap">Xem hoa mùa này</Link></div>
          <figure className="seasonal-hero-visual"><Image src="/products/dao-choi-trong-vuon.webp" alt="Bó hoa Dạo Chơi Trong Vườn với phom hoa tự nhiên" fill priority sizes="(max-width: 760px) 100vw, 48vw" /><figcaption><span>Ghi chú mùa hoa</span><strong>Chọn cành đẹp trước, kết hoa sau</strong></figcaption></figure>
        </div>
      </section>
      <section className="season-rhythm" aria-labelledby="season-rhythm-title"><div className="container season-rhythm-layout"><header><span className="eyebrow">Nhịp hoa hiện tại</span><h2 id="season-rhythm-title">Mùa này Trâm đang chọn</h2><p>Giống hoa có thể thay đổi nhẹ theo ngày, nhưng phom dáng, sắc độ và cảm xúc của thiết kế luôn được giữ lại.</p></header><div className="season-status-list"><article><span>01</span><strong>{readyNow} thiết kế có thể đặt hằng ngày</strong><p>Phối linh hoạt bằng hoa tương đương đang đẹp.</p></article><article><span>02</span><strong>{advanceOrder} thiết kế nên đặt trước</strong><p>Trâm cần thêm thời gian để chọn hoa đúng phom.</p></article><article><span>03</span><strong>Bảng màu được giữ nhất quán</strong><p>Mỗi bó vẫn mang đúng tinh thần mẫu bạn chọn.</p></article></div></div></section>
      <section className="section catalog-section seasonal-catalog" id="bo-suu-tap"><div className="container"><div className="seasonal-catalog-heading"><span className="eyebrow">Bộ sưu tập hiện tại</span><h2>Chọn theo cành hoa đang đẹp</h2></div><CatalogBrowser products={products} initialQuery={params.q ?? ""} initialCategory={params.category ?? "Tất cả"} /></div></section>
    </>
  );
}
