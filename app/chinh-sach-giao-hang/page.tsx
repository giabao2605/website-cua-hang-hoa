import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/safe-link";
import { getShippingRules } from "../../lib/catalog-store";
import { formatVnd } from "../../lib/commerce";
import { getSiteSettings } from "../../lib/site-settings-store";

export const metadata: Metadata = {
  title: "Chính sách giao hoa",
  description: "Xem tuyến giao, phí tạm tính và cách Trâm Florist chuẩn bị hoa cho từng quãng đường.",
};

function routeNote(kind: string) {
  if (kind === "locality") return "Tuyến gần tiệm, thuận tiện để Trâm chủ động kiểm tra hoa trước khi trao.";
  if (kind === "province") return "Hoa được dưỡng và cố định phù hợp với quãng đường trong tỉnh.";
  if (kind === "region") return "Trâm kiểm tra loại hoa, lịch giao và phương án bảo quản trước khi nhận đơn.";
  return "Tuyến được kiểm tra riêng theo địa chỉ, loại hoa và khả năng vận chuyển thực tế.";
}

export default async function Page() {
  const [allShippingRules, settings] = await Promise.all([getShippingRules(), getSiteSettings()]);
  const shippingRules = allShippingRules.filter((rule) => rule.active);

  return (
    <>
      <section className="delivery-page-hero"><div className="container delivery-page-hero-layout"><div className="delivery-page-hero-copy"><span className="eyebrow eyebrow-light">Giao hoa toàn quốc</span><h1>Mỗi quãng đường cần một cách giữ hoa riêng.</h1><p>Trâm kiểm tra địa chỉ, loại hoa và ngày giao trước khi kết hoa. Phí bên dưới là mức tạm tính; chi phí cuối cùng luôn được xác nhận với bạn trước khi thực hiện.</p><a className="button button-gold" href="#tuyen-giao">Xem tuyến và phí giao</a></div><figure><Image src="/editorial/hoa-tren-hanh-trinh.webp" alt="Bình hoa được chuẩn bị cho một hành trình trao tặng" fill priority sizes="(max-width: 760px) 100vw, 47vw" /><figcaption><span>{shippingRules.length || "Chưa có"} tuyến đang nhận</span><strong>Phí được xác nhận trước khi kết hoa</strong></figcaption></figure></div></section>

      <section className="section delivery-route-board" id="tuyen-giao" aria-labelledby="delivery-routes-title"><div className="container"><header><div><span className="eyebrow">Bảng tuyến hiện tại</span><h2 id="delivery-routes-title">Biết trước khoảng phí,<br />chủ động chọn ngày trao.</h2></div><p>Các mức phí được đọc trực tiếp từ cấu hình vận hành của tiệm. Tuyến xa hoặc địa bàn đặc biệt sẽ được kiểm tra lại trước khi xác nhận.</p></header>{shippingRules.length ? <div className="delivery-route-list">{shippingRules.map((rule, index) => <article key={rule.id}><span>{String(index + 1).padStart(2, "0")}</span><div><small>Địa bàn</small><h3>{rule.value}</h3></div><div><small>Phí tạm tính</small><strong>{formatVnd(rule.fee)}</strong></div><p>{routeNote(rule.kind)}</p></article>)}</div> : <div className="delivery-route-empty"><h3>Trâm đang cập nhật tuyến giao.</h3><p>Hãy gửi địa chỉ để shop kiểm tra và báo phí cụ thể.</p></div>}</div></section>

      <section className="delivery-journey" aria-labelledby="delivery-journey-title"><div className="container delivery-journey-layout"><header><span className="eyebrow eyebrow-light">Từ tiệm đến tay người nhận</span><h2 id="delivery-journey-title">Ba lần kiểm tra trước khi hoa lên đường.</h2><Link className="text-link-light" href="/tra-cuu-don">Tra cứu đơn đã đặt</Link></header><ol><li><span>01</span><div><h3>Kiểm tra tuyến</h3><p>Địa chỉ chi tiết, số điện thoại người nhận và ngày giao giúp Trâm đánh giá quãng đường.</p></div></li><li><span>02</span><div><h3>Chốt lịch và chi phí</h3><p>Trâm liên hệ lại để xác nhận mẫu, khả năng giao và phí cuối cùng trước khi kết hoa.</p></div></li><li><span>03</span><div><h3>Dưỡng, cố định và giao</h3><p>Hoa được chuẩn bị theo quãng đường rồi bàn giao theo thông tin hai bên đã thống nhất.</p></div></li></ol></div></section>

      <section className="section delivery-prepare" aria-labelledby="delivery-prepare-title"><div className="container delivery-prepare-layout"><div><span className="eyebrow">Trước khi đặt hoa</span><h2 id="delivery-prepare-title">Một vài chi tiết giúp chuyến giao thuận lợi hơn.</h2><p>Tiệm tiếp nhận yêu cầu trong khung giờ {settings.openingHours}. Đơn cần giao đúng giờ hoặc có quãng đường xa nên được trao đổi sớm để Trâm kiểm tra khả năng thực hiện.</p><Link className="button button-primary" href="/lien-he#tu-van">Nhờ Trâm kiểm tra tuyến</Link></div><div className="delivery-prepare-list"><article><span>01</span><h3>Địa chỉ đầy đủ</h3><p>Ghi rõ thôn, xã, số nhà hoặc điểm dễ nhận biết.</p></article><article><span>02</span><h3>Người nhận có thể nghe máy</h3><p>Số điện thoại chính xác giúp đơn vị giao phối hợp khi cần.</p></article><article><span>03</span><h3>Ghi chú nơi nhận đặc biệt</h3><p>Văn phòng, khách sạn hoặc khu vực kiểm soát nên có thêm tên đơn vị và hướng dẫn nhận.</p></article></div></div></section>
    </>
  );
}
