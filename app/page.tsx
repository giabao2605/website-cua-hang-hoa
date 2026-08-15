import Image from "next/image";
import Link from "@/components/safe-link";
import { ArrowRight, CalendarHeart, Flower2, PackageCheck, Quote } from "lucide-react";
import { ProductCard } from "../components/product-card";
import { JournalCard } from "../components/journal-card";
import { getCatalogProducts, getShippingRules } from "../lib/catalog-store";
import { formatVnd } from "../lib/commerce";
import { journalArticles } from "../lib/journal";
import { getSiteSettings } from "../lib/site-settings-store";

export default async function Home() {
  const [products, shippingRules, settings] = await Promise.all([
    getCatalogProducts(),
    getShippingRules(),
    getSiteSettings(),
  ]);
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const activeShippingFees = shippingRules.filter((rule) => rule.active).map((rule) => rule.fee);
  const shippingFeeCopy = activeShippingFees.length
    ? `Phí giao tạm tính từ ${formatVnd(Math.min(...activeShippingFees))}`
    : "Phí được xác nhận theo tuyến";
  const catalogCta = `Xem đủ ${products.length} thiết kế`;
  return (
    <>
      <section className="hero">
        <Image className="hero-image" src="/brand/hero-bouquet.jpg" alt="Bó hoa theo mùa được Trâm Florist kết thủ công" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="eyebrow eyebrow-light">Bộ sưu tập hoa theo mùa</span>
          <h1>Để hoa nói hộ<br /><em>những điều dịu dàng.</em></h1>
          <p>Những bó hoa tươi được tuyển chọn theo mùa, kết thủ công và giao trọn vẹn cảm xúc đến người bạn thương.</p>
          <div className="hero-actions"><Link className="button button-gold" href="/hoa">Chọn hoa ngay <ArrowRight size={17} /></Link><Link className="text-link-light" href="/dip-tang">Chọn theo dịp</Link></div>
        </div>
      </section>

      <section className="occasion-section section">
        <div className="container occasion-layout">
          <header className="occasion-intro">
            <span className="section-index">01 / Dịp tặng</span>
            <span className="eyebrow">Chọn một khoảnh khắc</span>
            <h2>Bạn muốn gửi một lời gì?</h2>
            <p>Bắt đầu từ người bạn đang nghĩ đến. Trâm sẽ giúp bạn chọn bảng màu và phom hoa phù hợp.</p>
            <Link className="text-link" href="/dip-tang">Xem mọi dịp tặng <ArrowRight size={16} /></Link>
          </header>
          <div className="occasion-rail">
            <div className="occasion-grid">
              {[
                ["Sinh nhật", "Thêm hoa cho một tuổi mới", "/editorial/bo-hoa-tren-ban-ket.webp"],
                ["Kỷ niệm", "Nhắc nhau về một ngày đáng nhớ", "/editorial/loi-nhan-mau-hong.webp"],
                ["Chúc mừng", "Mừng một cột mốc mới", "/editorial/bang-mau-chuc-mung.webp"],
                ["Tặng người thương", "Một bó hoa thay lời muốn nói", "/editorial/mua-hong-ruc-ro.webp"],
              ].map(([title, subtitle, image], index) => <Link key={title} className="occasion-card" href={`/dip-tang?occasion=${encodeURIComponent(title)}#goi-y`}><Image src={image} alt="" fill sizes="(max-width: 760px) 92vw, 50vw" /><b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b><span><small>{subtitle}</small><strong>{title}</strong><i><ArrowRight size={17} /></i></span></Link>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section collection-section">
        <div className="container">
          <div className="section-heading collection-heading"><div><span className="section-index">02 / Mùa hoa</span><span className="eyebrow">Được yêu thích</span><h2>Những thiết kế đang vào mùa</h2><p>Hoa theo mùa có thể thay đổi đôi chút; Trâm sẽ giữ tông màu của mẫu.</p></div><aside><strong>{String(featured.length).padStart(2, "0")}</strong><span>thiết kế Trâm chọn cho mùa này</span></aside></div>
          <div className="product-grid featured-product-grid">{featured.map((product, index) => index === 0 ? <div className="featured-lead" key={product.id}><ProductCard product={product} /></div> : <ProductCard key={product.id} product={product} />)}</div>
          <div className="collection-more"><Link className="button button-outline" href="/hoa">{catalogCta} <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="trust-strip trust-band" aria-label="Cam kết vận hành của Trâm Florist">
        <div className="container trust-editorial">
          <header><span className="section-index">03 / Cam kết</span><span className="eyebrow">Trước khi Trâm kết hoa</span><h2>Ba điều luôn được xác nhận.</h2><p>{products.length} thiết kế hiện có, được điều chỉnh linh hoạt theo mùa hoa thực tế.</p></header>
          <div className="trust-grid">
            <div><b>01</b><Flower2 /><span><strong>Giữ đúng tông màu</strong><small>Chỉ thay bằng hoa tương đương khi cần.</small></span></div>
            <div><b>02</b><PackageCheck /><span><strong>Báo phí trước khi kết</strong><small>{shippingFeeCopy}</small></span></div>
            <div><b>03</b><CalendarHeart /><span><strong>Hỗ trợ mỗi ngày</strong><small>{settings.openingHours}</small></span></div>
          </div>
        </div>
        <div className="seasonal-marquee" aria-hidden="true">
          <div className="seasonal-marquee-track">
            <div className="seasonal-marquee-group"><span>Kết theo mùa</span><i>Giữ đúng tông màu</i><span>Xác nhận phí trước</span><i>Giao theo lịch hẹn</i></div>
            <div className="seasonal-marquee-group" aria-hidden="true"><span>Kết theo mùa</span><i>Giữ đúng tông màu</i><span>Xác nhận phí trước</span><i>Giao theo lịch hẹn</i></div>
          </div>
        </div>
      </section>

      <section className="story-feature section"><div className="container story-grid"><div className="story-photos"><Image className="story-main" src="/editorial/khong-gian-tiem-hoa.webp" alt="Không gian hoa theo mùa trong tiệm Trâm" width={736} height={1307} /><Image className="story-small" src="/editorial/bo-hoa-xanh-ngoai-troi.webp" alt="Bó hoa xanh trắng được nâng niu ngoài trời" width={512} height={640} /><span className="round-seal">Trâm Florist · Tuy An Bắc ·</span><small className="story-caption">Những bó hoa được kết bằng tay</small></div><div className="story-copy"><span className="section-index">04 / Câu chuyện</span><span className="eyebrow">Câu chuyện của Trâm</span><h2>Mỗi mùa hoa,<br />một cách yêu.</h2><p>Trâm Florist bắt đầu từ niềm tin rằng một bó hoa đẹp không cần rập khuôn. Chúng tôi chọn những cành đang vào mùa đẹp nhất, kết bằng tay và giữ lại vẻ tự nhiên vốn có.</p><p>Mỗi thiết kế có thể thay đổi nhẹ theo mùa, nhưng bảng màu, cảm xúc và giá trị bạn chọn sẽ luôn được giữ trọn.</p><blockquote className="story-quote"><Quote aria-hidden="true" /><p>Hoa không chỉ là món quà. Đó là cách ta dừng lại một chút, nhớ về nhau và giữ một khoảnh khắc thật lâu.</p><cite>Một lời nhắn từ Trâm</cite></blockquote><Link className="button button-outline" href="/gioi-thieu">Khám phá câu chuyện <ArrowRight size={16} /></Link></div></div></section>

      <section className="section delivery-ritual">
        <div className="container delivery-ritual-layout">
          <header>
            <span className="section-index section-index-light">05 / Hành trình</span>
            <span className="eyebrow eyebrow-light">Từ lúc đặt đến khi nhận</span>
            <h2>Đặt hoa trong ba bước.</h2>
            <p>Mẫu hoa, lịch giao và tổng phí đều được Trâm xác nhận trước khi bắt đầu kết.</p>
            <Link className="text-link-light" href="/chinh-sach-giao-hang">Xem tuyến và phí giao <ArrowRight size={16} /></Link>
          </header>
          <div className="delivery-ritual-steps">
            <article><span>01</span><h3>Chọn mẫu và lịch giao</h3><p>Bạn chọn bó hoa, nhập ngày, địa chỉ và lời nhắn.</p></article>
            <article><span>02</span><h3>Kiểm tra và xác nhận</h3><p>Trâm kiểm tra hoa đang có, tuyến giao rồi báo phí giao trước khi kết.</p></article>
            <article><span>03</span><h3>Kết hoa và bàn giao</h3><p>Hoa được kết, đóng gói và giao theo giờ đã hẹn.</p></article>
          </div>
        </div>
      </section>

      <section className="section journal-section"><div className="container"><div className="section-heading split-heading"><div><span className="section-index">06 / Nhật ký</span><span className="eyebrow">Nhật ký mùa hoa</span><h2>Chăm hoa và chọn hoa cùng Trâm</h2></div><Link className="text-link" href="/nhat-ky">Xem thêm <ArrowRight size={16} /></Link></div><div className="journal-grid">{journalArticles.map((article) => <JournalCard key={article.slug} article={article} />)}</div></div></section>
    </>
  );
}
