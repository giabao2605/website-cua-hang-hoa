import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/safe-link";
import { ContactForm } from "../../components/contact-form";
import { getSiteSettings } from "../../lib/site-settings-store";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn",
  description: "Liên hệ Trâm Florist để được tư vấn hoa theo dịp, thiết kế riêng và tuyến giao phù hợp.",
};

export default async function Page() {
  const settings = await getSiteSettings();
  return (
    <>
      <section className="contact-page-hero"><div className="container contact-page-hero-layout"><div className="contact-page-hero-copy"><span className="eyebrow eyebrow-light">Trâm luôn sẵn lòng</span><h1>Kể Trâm nghe<br />điều bạn muốn trao.</h1><p>Bạn chưa cần biết chính xác tên hoa. Chỉ cần chia sẻ người nhận, điều muốn nói và ngày dự kiến, Trâm sẽ cùng bạn thu hẹp lựa chọn.</p><div><a className="button button-gold" href={`tel:${settings.phone}`}>Gọi {settings.phoneDisplay}</a><a className="text-link-light" href={settings.zaloUrl} target="_blank" rel="noreferrer">Nhắn Zalo cho Trâm</a></div></div><figure><Image src="/editorial/loi-nhan-mau-hong.webp" alt="Bó hoa hồng được chọn cho một lời nhắn riêng" fill priority sizes="(max-width: 760px) 100vw, 46vw" /><figcaption><span>Tư vấn từ</span><strong>{settings.openingHours}</strong></figcaption></figure></div></section>

      <section className="section contact-concierge" aria-labelledby="contact-concierge-title"><div className="container"><header><span className="eyebrow">Bạn đang cần Trâm giúp gì</span><h2 id="contact-concierge-title">Bắt đầu từ đúng câu hỏi.</h2><p>Mỗi lối vào sẽ đưa bạn đến thông tin cần thiết trước khi gửi yêu cầu tư vấn.</p></header><div className="contact-concierge-grid"><Link href="/dip-tang"><span>01</span><h3>Chọn hoa theo dịp</h3><p>Đi từ sinh nhật, kỷ niệm, lời cảm ơn hoặc ngày trọng đại.</p><strong>Xem gợi ý theo khoảnh khắc</strong></Link><Link href="/chinh-sach-giao-hang"><span>02</span><h3>Hỏi tuyến giao</h3><p>Xem trước địa bàn, phí tạm tính và cách Trâm chuẩn bị hoa.</p><strong>Xem chính sách giao hoa</strong></Link><a href="#tu-van"><span>03</span><h3>Thiết kế một bó thật riêng</h3><p>Chia sẻ bảng màu, người nhận và điều bạn muốn gửi gắm.</p><strong>Gửi yêu cầu cho Trâm</strong></a></div></div></section>

      <section className="contact-consultation"><div className="container contact-consultation-layout"><div className="contact-brief"><span className="eyebrow eyebrow-light">Chuẩn bị cho cuộc tư vấn</span><h2>Ba điều đủ để bắt đầu.</h2><ol><li><span>01</span><div><strong>Người nhận</strong><p>Mối quan hệ và phong cách của người bạn muốn tặng.</p></div></li><li><span>02</span><div><strong>Điều muốn nói</strong><p>Lời chúc, sắc màu hoặc cảm giác bạn muốn bó hoa mang theo.</p></div></li><li><span>03</span><div><strong>Ngày và nơi giao</strong><p>Thông tin giúp Trâm kiểm tra hoa và phương án vận chuyển.</p></div></li></ol><div className="contact-direct"><a href={`tel:${settings.phone}`}><small>Điện thoại</small><strong>{settings.phoneDisplay}</strong></a><a href={settings.zaloUrl} target="_blank" rel="noreferrer"><small>Tư vấn trực tuyến</small><strong>Zalo {settings.phoneDisplay}</strong></a><div><small>Ghé tiệm</small><strong>{settings.address}</strong></div></div></div><ContactForm /></div></section>

      <section className="section contact-follow-up" aria-labelledby="contact-follow-up-title"><div className="container contact-follow-up-layout"><header><span className="eyebrow">Sau khi bạn gửi yêu cầu</span><h2 id="contact-follow-up-title">Trâm sẽ cùng bạn đi tiếp như thế nào.</h2></header><div><article><span>01</span><h3>Đọc lời nhắn</h3><p>Trâm xem dịp tặng, nhu cầu và thông tin liên hệ bạn đã để lại.</p></article><article><span>02</span><h3>Trao đổi chi tiết</h3><p>Shop liên hệ để làm rõ bảng màu, hoa đang có và địa chỉ giao.</p></article><article><span>03</span><h3>Chốt phương án</h3><p>Mẫu hoa, ngày giao và phí được xác nhận trước khi thực hiện.</p></article></div></div></section>
    </>
  );
}
