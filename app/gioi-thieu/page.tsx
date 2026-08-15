import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/safe-link";

export const metadata: Metadata = {
  title: "Câu chuyện của Trâm",
  description: "Câu chuyện về cách Trâm Florist chọn hoa theo mùa, kết thủ công và giữ trọn cảm xúc của từng thiết kế.",
};

export default function Page() {
  return (
    <>
      <section className="story-page-hero">
        <div className="container story-page-hero-layout">
          <div className="story-page-hero-copy"><span className="eyebrow eyebrow-light">Câu chuyện của Trâm</span><h1><span className="story-place-line">Từ Tuy An Bắc,</span><br />mỗi mùa hoa thành một lời kể.</h1><p>Trâm không cố làm mọi bó hoa giống hệt một khuôn mẫu. Chúng tôi bắt đầu từ những cành đang đẹp, rồi giữ lại bảng màu và cảm xúc bạn muốn trao.</p></div>
          <div className="story-page-hero-images"><figure className="story-page-hero-main"><Image src="/editorial/khong-gian-tiem-hoa.webp" alt="Không gian hoa theo mùa trong tiệm Trâm" fill priority sizes="(max-width: 760px) 78vw, 38vw" /></figure><figure className="story-page-hero-small"><Image src="/editorial/bo-hoa-xanh-ngoai-troi.webp" alt="Bó hoa xanh trắng được cầm ngoài trời" fill sizes="(max-width: 760px) 42vw, 18vw" /></figure><blockquote>“Không cần giống hệt nhau để cùng mang một cảm xúc.”<span>Trâm Florist</span></blockquote></div>
        </div>
      </section>

      <section className="section story-origin" aria-labelledby="story-origin-title"><div className="container story-origin-layout"><div className="story-origin-index"><span>Chương 01</span><strong>Từ một tiệm hoa nhỏ</strong></div><div className="story-origin-copy"><span className="eyebrow">Tại Tuy An Bắc</span><h2 id="story-origin-title">Một ngày bắt đầu bằng việc nhìn xem hoa đang muốn kể điều gì.</h2><div><p>Mỗi buổi sáng, Trâm chọn cành, dưỡng hoa và ghép từng sắc độ. Có ngày cẩm tú cầu đầy đặn hơn, có ngày một nhánh hoa đồng nội lại trở thành điểm nhấn đẹp nhất.</p><p>Vì vậy, mẫu hoa là lời hứa về phom dáng, bảng màu và tinh thần. Giống hoa có thể thay đổi có chủ đích để thiết kế đến tay người nhận vẫn tươi và tự nhiên.</p></div></div></div></section>

      <section className="story-chapters" aria-labelledby="story-chapters-title"><div className="container story-chapters-layout"><header><span className="eyebrow">Một thiết kế đi qua ba nhịp</span><h2 id="story-chapters-title">Từ cành hoa đang đẹp đến khoảnh khắc được trao.</h2></header><div className="story-chapter-list"><article><span>01</span><h3>Chọn cành</h3><p>Trâm ưu tiên độ tươi, sắc độ và dáng cành phù hợp với tinh thần của mẫu.</p></article><article><span>02</span><h3>Dưỡng và ghép</h3><p>Hoa được dưỡng nước, xử lý lá rồi ghép từng lớp để có khoảng thở tự nhiên.</p></article><article><span>03</span><h3>Giữ lời nhắn</h3><p>Bảng màu, phom dáng và cảm xúc được kiểm tra lần cuối trước khi đóng gói.</p></article></div></div></section>

      <section className="section story-principles" aria-labelledby="story-principles-title"><div className="container"><header><span className="eyebrow">Điều Trâm gìn giữ</span><h2 id="story-principles-title">Đẹp không chỉ ở lúc nhìn thấy.</h2></header><div className="story-principle-list"><article><span>01</span><h3>Tôn trọng mùa hoa</h3><p>Chọn hoa ở thời điểm đẹp và thay thế tương đương khi cần, thay vì ép một giống hoa phải có quanh năm.</p></article><article><span>02</span><h3>Kết bằng sự thấu hiểu</h3><p>Người nhận, dịp tặng và điều muốn nói luôn là ba dữ kiện quan trọng trước khi chọn sắc hoa.</p></article><article><span>03</span><h3>Chuẩn bị cho hành trình</h3><p>Cách dưỡng nước, cố định và gói hoa được điều chỉnh theo quãng đường giao thực tế.</p></article></div></div></section>

      <section className="story-page-closing"><div className="container story-page-closing-layout"><figure><Image src="/editorial/hoa-tren-hanh-trinh.webp" alt="Bình hoa nhỏ trên hành trình được trao tặng" fill sizes="(max-width: 760px) 100vw, 48vw" /><figcaption><span>Một khoảnh khắc theo mùa</span><strong>Hoa trên hành trình được trao</strong></figcaption></figure><div><span className="eyebrow eyebrow-light">Viết tiếp câu chuyện</span><h2>Chọn một mùa hoa cho điều bạn muốn trao.</h2><p>Bắt đầu từ cành hoa đang đẹp, hoặc từ chính khoảnh khắc mà bạn đang nghĩ đến.</p><div><Link className="button button-gold" href="/hoa">Xem hoa theo mùa</Link><Link className="text-link-light" href="/dip-tang">Chọn theo dịp tặng</Link></div></div></div></section>
    </>
  );
}
