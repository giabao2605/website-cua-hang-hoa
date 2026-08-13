import Image from "next/image";
import Link from "@/components/safe-link";
import { Clock3, MapPin, Phone } from "lucide-react";
import { defaultSiteSettings, type SiteSettings } from "../lib/site";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter({ settings = defaultSiteSettings }: { settings?: SiteSettings }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <span className="brand-logo-frame"><Image src="/brand/tram-florist-logo.png" alt="" width={64} height={64} /></span>
            <span><strong>Trâm</strong><small>Florist</small></span>
          </Link>
          <p>{settings.tagline}. Mỗi thiết kế được chọn hoa và kết thủ công theo mùa tại Tuy An Bắc.</p>
          <div className="footer-contact"><Phone size={17} /><a href={`tel:${settings.phone}`}>{settings.phoneDisplay}</a></div>
          <div className="footer-contact"><MapPin size={17} /><span>{settings.address}</span></div>
          <div className="footer-contact"><Clock3 size={17} /><span>{settings.openingHours}</span></div>
        </div>
        <div><h3>Khám phá</h3><Link href="/hoa">Tất cả hoa</Link><Link href="/hoa?category=Bó+hoa">Bó hoa theo mùa</Link><Link href="/hoa?category=Giỏ+hoa">Giỏ hoa</Link><Link href="/nhat-ky">Nhật ký mùa hoa</Link><Link href="/gioi-thieu">Câu chuyện Trâm</Link></div>
        <div><h3>Hỗ trợ</h3><Link href="/tra-cuu-don">Tra cứu đơn hàng</Link><Link href="/chinh-sach-giao-hang">Giao hoa toàn quốc</Link><Link href="/lien-he">Liên hệ tư vấn</Link><Link href="/tai-khoan">Tài khoản của tôi</Link></div>
        <div className="footer-newsletter"><h3>Thư hoa theo mùa</h3><p>Nhận thông tin bộ sưu tập mới và mẹo giữ hoa tươi lâu.</p><NewsletterForm /></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} {settings.shopName}. Bảo lưu mọi quyền.</span><span>Thanh toán {[settings.codEnabled && "COD", settings.momoEnabled && "MoMo"].filter(Boolean).join(" và ")}</span></div>
    </footer>
  );
}
