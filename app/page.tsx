import Image from "next/image";
import Link from "@/components/safe-link";
import { ArrowRight, BadgeCheck, CalendarHeart, Flower2, HeartHandshake, PackageCheck, Quote, Truck } from "lucide-react";
import { ProductCard } from "../components/product-card";
import { JournalCard } from "../components/journal-card";
import { getCatalogProducts } from "../lib/catalog-store";
import { journalArticles } from "../lib/journal";

export default async function Home() {
  const products = await getCatalogProducts();
  const featured = products.filter((product) => product.featured);
  return (
    <>
      <section className="hero">
        <Image className="hero-image" src="/brand/hero-bouquet.jpg" alt="Bó hoa cẩm tú cầu xanh và hồng garden của Trâm Florist" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="eyebrow eyebrow-light">Bộ sưu tập hoa theo mùa</span>
          <h1>Để hoa nói hộ<br /><em>những điều dịu dàng.</em></h1>
          <p>Những bó hoa tươi được tuyển chọn theo mùa, kết thủ công và giao trọn vẹn cảm xúc đến người bạn thương.</p>
          <div className="hero-actions"><Link className="button button-gold" href="/hoa">Chọn hoa ngay <ArrowRight size={17} /></Link><Link className="text-link-light" href="/gioi-thieu">Câu chuyện của Trâm</Link></div>
          <div className="hero-proof"><span><BadgeCheck />Hoa tươi tuyển chọn mỗi ngày</span><span><Truck />Giao hoa toàn quốc</span></div>
        </div>
        <aside className="hero-season-card" aria-label="Gợi ý hoa đang vào mùa">
          <span>Mùa này Trâm có</span>
          <strong>Cẩm tú cầu và hồng garden</strong>
          <small>Được kết bằng tay tại Trâm</small>
        </aside>
        <div className="hero-scroll">Cuộn để khám phá <span /></div>
      </section>

      <section className="trust-strip"><div className="container trust-grid"><div><Flower2 /><span><strong>Hoa tươi theo mùa</strong><small>Linh hoạt thay hoa tương đương</small></span></div><div><HeartHandshake /><span><strong>Kết hoa thủ công</strong><small>Chăm chút từng chi tiết</small></span></div><div><PackageCheck /><span><strong>Đóng gói an toàn</strong><small>Bảo vệ hoa trên hành trình</small></span></div><div><CalendarHeart /><span><strong>Hỗ trợ 7 ngày</strong><small>08:00 - 17:00 mỗi ngày</small></span></div></div></section>

      <section className="seasonal-editorial" aria-label="Tinh thần hoa theo mùa của Trâm">
        <div className="seasonal-marquee">
          <div className="seasonal-marquee-track">
            <div className="seasonal-marquee-group"><span>Hoa theo mùa</span><i>Kết bằng tay</i><span>Báo phí giao trước</span><i>Giao theo lịch hẹn</i></div>
            <div className="seasonal-marquee-group" aria-hidden="true"><span>Hoa theo mùa</span><i>Kết bằng tay</i><span>Báo phí giao trước</span><i>Giao theo lịch hẹn</i></div>
          </div>
        </div>
      </section>

      <section className="section collection-section">
        <div className="container">
          <div className="section-heading split-heading"><div><span className="eyebrow">Được yêu thích</span><h2>Những thiết kế đang vào mùa</h2><p>Hoa theo mùa có thể thay đổi đôi chút; Trâm sẽ giữ tông màu của mẫu.</p></div><Link className="text-link" href="/hoa">Xem tất cả <ArrowRight size={16} /></Link></div>
          <div className="product-grid featured-product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="occasion-section section">
        <div className="container">
          <div className="section-heading centered"><span className="eyebrow">Hoa cho mọi khoảnh khắc</span><h2>Bạn muốn gửi một lời gì?</h2><p>Chọn theo dịp, Trâm sẽ giúp bạn gửi đúng cảm xúc.</p></div>
          <div className="occasion-grid">
            {[
              ["Sinh nhật", "Thêm hoa cho một tuổi mới", "/products/nang-goi-niem-vui.webp"],
              ["Kỷ niệm", "Nhắc nhau về một ngày đáng nhớ", "/products/sanh-doi-hong-lam.webp"],
              ["Chúc mừng", "Mừng một cột mốc mới", "/products/sac-mau-le-hoi.webp"],
              ["Tặng người thương", "Một bó hoa thay lời muốn nói", "/products/hen-nhau-mua-hong.webp"],
            ].map(([title, subtitle, image], index) => <Link key={title} className="occasion-card" href={`/dip-tang?occasion=${encodeURIComponent(title)}#goi-y`}><Image src={image} alt="" fill sizes="(max-width: 760px) 92vw, 50vw" /><b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b><span><small>{subtitle}</small><strong>{title}</strong><i><ArrowRight size={17} /></i></span></Link>)}
          </div>
        </div>
      </section>

      <section className="story-feature section"><div className="container story-grid"><div className="story-photos"><Image className="story-main" src="/products/dao-choi-trong-vuon.webp" alt="Bó hoa đồng nội Dạo Chơi Trong Vườn được kết thủ công" width={900} height={1100} /><Image className="story-small" src="/products/cham-may.webp" alt="Bó hoa xanh hồng Chạm Mây theo mùa" width={500} height={620} /><span className="round-seal">Trâm Florist · Tuy An Bắc ·</span><small className="story-caption">Những bó hoa được kết bằng tay</small></div><div className="story-copy"><span className="eyebrow">Câu chuyện của Trâm</span><h2>Mỗi mùa hoa,<br />một cách yêu.</h2><p>Trâm Florist bắt đầu từ niềm tin rằng một bó hoa đẹp không cần rập khuôn. Chúng tôi chọn những cành đang vào mùa đẹp nhất, kết bằng tay và giữ lại vẻ tự nhiên vốn có.</p><p>Mỗi thiết kế có thể thay đổi nhẹ theo mùa, nhưng bảng màu, cảm xúc và giá trị bạn chọn sẽ luôn được giữ trọn.</p><Link className="button button-outline" href="/gioi-thieu">Khám phá câu chuyện <ArrowRight size={16} /></Link><div className="signature">Trâm</div></div></div></section>

      <section className="quote-section"><div className="container"><span className="quote-kicker">Một lời nhắn từ Trâm</span><Quote /><blockquote>“Hoa không chỉ là món quà. Đó là cách ta dừng lại một chút, nhớ về nhau và giữ một khoảnh khắc thật lâu.”</blockquote><span>Trâm Florist</span></div></section>

      <section className="section delivery-ritual">
        <div className="container delivery-ritual-layout">
          <header>
            <span className="eyebrow eyebrow-light">Từ lúc đặt đến khi nhận</span>
            <h2>Đặt hoa trong ba bước.</h2>
            <p>Trâm sẽ gọi lại để chốt mẫu, ngày giao và phí giao trước khi kết hoa.</p>
            <Link className="text-link-light" href="/chinh-sach-giao-hang">Xem chính sách giao hoa <ArrowRight size={16} /></Link>
          </header>
          <div className="delivery-ritual-steps">
            <article><span>01</span><h3>Bạn chọn bó hoa</h3><p>Chọn mẫu, ngày giao và viết lời nhắn.</p></article>
            <article><span>02</span><h3>Trâm gọi chốt đơn</h3><p>Trâm kiểm tra hoa đang có và báo phí giao.</p></article>
            <article><span>03</span><h3>Trâm kết hoa và giao</h3><p>Hoa được kết, đóng gói rồi giao theo giờ đã hẹn.</p></article>
          </div>
        </div>
      </section>

      <section className="section journal-section"><div className="container"><div className="section-heading split-heading"><div><span className="eyebrow">Nhật ký mùa hoa</span><h2>Chăm hoa và chọn hoa cùng Trâm</h2></div><Link className="text-link" href="/nhat-ky">Xem thêm <ArrowRight size={16} /></Link></div><div className="journal-grid">{journalArticles.map((article) => <JournalCard key={article.slug} article={article} />)}</div></div></section>
    </>
  );
}
