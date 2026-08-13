import type { Metadata } from "next";
import { Clock3, MapPin, PackageCheck, Truck } from "lucide-react";
import { getShippingRules } from "../../lib/catalog-store";
import { formatVnd } from "../../lib/commerce";
import { getSiteSettings } from "../../lib/site-settings-store";

export const metadata: Metadata = { title: "Chính sách giao hoa" };

export default async function Page() {
  const [allShippingRules, settings] = await Promise.all([getShippingRules(), getSiteSettings()]);
  const shippingRules = allShippingRules.filter((rule) => rule.active);
  return <><section className="page-hero delivery-hero"><div className="container"><span className="eyebrow eyebrow-light">Giao hoa toàn quốc</span><h1>Để hoa đến nơi vẫn vẹn nguyên.</h1><p>Mỗi tuyến giao được đánh giá theo khoảng cách, mùa hoa và khả năng bảo quản. Phí bên dưới là mức tạm tính để bạn dễ cân nhắc.</p></div></section><section className="section delivery-page"><div className="container"><div className="delivery-grid">{shippingRules.map((rule, index) => <article key={rule.id}><span>{String(index + 1).padStart(2, "0")}</span><h2>{rule.value}</h2><strong>{formatVnd(rule.fee)}</strong><p>{rule.kind === "locality" ? "Dự kiến trong ngày, tùy khung giờ đặt." : rule.kind === "province" ? "Dự kiến 1 ngày hoặc theo lịch hẹn." : rule.kind === "region" ? "Dự kiến 1-2 ngày, cần xác nhận loại hoa." : "Phối hợp đối tác địa phương hoặc tuyến lạnh phù hợp."}</p></article>)}</div><div className="delivery-notes"><div><Truck /><span><h3>Phí tạm tính, luôn xác nhận lại</h3><p>Trâm sẽ gọi xác nhận chi phí cuối cùng trước khi thực hiện, đặc biệt với tuyến xa, địa bàn khó giao hoặc đơn có kích thước lớn.</p></span></div><div><PackageCheck /><span><h3>Đóng gói theo quãng đường</h3><p>Hoa được dưỡng nước, cố định và chọn vật liệu gói phù hợp với thời gian di chuyển.</p></span></div><div><Clock3 /><span><h3>Khung giờ giao {settings.openingHours}</h3><p>Đơn cần giao đúng giờ sự kiện nên đặt trước ít nhất 1-2 ngày.</p></span></div><div><MapPin /><span><h3>Đảo và địa bàn đặc biệt</h3><p>Vẫn tiếp nhận yêu cầu trên toàn quốc; shop sẽ báo giá riêng sau khi kiểm tra tuyến.</p></span></div></div></div></section></>;
}
