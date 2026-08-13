import type { Metadata } from "next";
import { Clock3, MapPin, Phone } from "lucide-react";
import { ContactForm } from "../../components/contact-form";
import { getSiteSettings } from "../../lib/site-settings-store";

export const metadata: Metadata = { title: "Liên hệ" };

export default async function Page() {
  const settings = await getSiteSettings();
  return <section className="section contact-page"><div className="container contact-grid"><div><span className="eyebrow">Trâm luôn sẵn lòng</span><h1>Bạn cần một bó hoa<br />thật riêng?</h1><p>Gọi hoặc để lại lời nhắn. Trâm sẽ tư vấn bảng màu, hoa đúng mùa và phương án giao phù hợp.</p><div className="contact-list"><a href={`tel:${settings.phone}`}><Phone /><span><small>Điện thoại</small><strong>{settings.phoneDisplay}</strong></span></a><div><MapPin /><span><small>Ghé tiệm</small><strong>{settings.address}</strong></span></div><div><Clock3 /><span><small>Giờ mở cửa</small><strong>{settings.openingHours}</strong></span></div><a href={settings.zaloUrl} target="_blank" rel="noreferrer"><span className="contact-list-mark">Zalo</span><span><small>Tư vấn trực tuyến</small><strong>{settings.phoneDisplay}</strong></span></a></div></div><ContactForm /></div></section>;
}
