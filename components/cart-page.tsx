"use client";

import Image from "next/image";
import Link from "@/components/safe-link";
import { ArrowLeft, Minus, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { formatVnd } from "../lib/commerce";
import type { SiteSettings } from "../lib/site";
import { useCart } from "./cart-provider";

export function CartPage({ settings }: { settings: SiteSettings }) {
  const { items, subtotal, ready, updateQuantity, removeItem } = useCart();
  if (!ready) return <div className="cart-loading" role="status">Đang tải giỏ hoa...</div>;
  if (!items.length) return <div className="empty-cart"><div className="empty-cart-flower">TF</div><h1>Giỏ hoa đang chờ bạn chọn</h1><p>Khám phá những thiết kế theo mùa và tìm một bó hoa thật đúng cảm xúc.</p><Link className="button button-primary" href="/hoa">Khám phá cửa hàng</Link></div>;
  return (
    <div className="cart-layout">
      <div className="cart-items"><div className="cart-title"><div><span className="eyebrow">Giỏ hàng của bạn</span><h1>{items.length} thiết kế đã chọn</h1></div><Link href="/hoa"><ArrowLeft /> Tiếp tục chọn hoa</Link></div>{items.map((item) => <article className="cart-item" key={item.productId}><Link className="cart-item-image" href={`/hoa/${item.slug}`}><Image src={item.image} alt={item.name} fill sizes="150px" /></Link><div className="cart-item-copy"><Link href={`/hoa/${item.slug}`}><h2>{item.name}</h2></Link><p>{item.sku} · Kích thước tiêu chuẩn</p><span>{formatVnd(item.price)}</span><div className="cart-item-controls"><div className="quantity-control"><button onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Giảm"><Minus /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Tăng"><Plus /></button></div><button className="remove-item" onClick={() => removeItem(item.productId)}><Trash2 /> Xóa</button></div></div><strong className="cart-line-total">{formatVnd(item.price * item.quantity)}</strong></article>)}</div>
      <aside className="order-summary"><span className="eyebrow">Tóm tắt đơn</span><h2>Thành tiền</h2><div className="summary-row"><span>Tạm tính</span><strong>{formatVnd(subtotal)}</strong></div><div className="summary-row"><span>Phí giao hoa</span><em>Tính ở bước tiếp theo</em></div><div className="coupon-row"><input placeholder="Mã ưu đãi" aria-label="Mã ưu đãi" /><button>Áp dụng</button></div><div className="summary-total"><span>Tạm tính</span><strong>{formatVnd(subtotal)}</strong></div><Link className="button button-primary button-full" href="/thanh-toan">Tiến hành đặt hoa</Link><div className="summary-assurances"><span><ShieldCheck />Thanh toán an toàn với {paymentLabel(settings)}</span><span><Truck />Phí giao được báo rõ trước khi xác nhận</span></div></aside>
    </div>
  );
}

function paymentLabel(settings: SiteSettings) {
  if (settings.codEnabled && settings.momoEnabled) return "COD hoặc MoMo";
  return settings.codEnabled ? "COD" : "MoMo";
}
