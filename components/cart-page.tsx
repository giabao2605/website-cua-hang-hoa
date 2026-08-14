"use client";

import Image from "next/image";
import Link from "@/components/safe-link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { getFeaturedProducts } from "../lib/catalog";
import { formatVnd } from "../lib/commerce";
import type { SiteSettings } from "../lib/site";
import { useCart } from "./cart-provider";
import { ProductCard } from "./product-card";

export function CartPage({ settings }: { settings: SiteSettings }) {
  const { items, subtotal, ready, updateQuantity, removeItem } = useCart();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  if (!ready) return <div className="cart-loading" role="status">Đang tải giỏ hoa...</div>;
  if (!items.length) {
    const recommendations = getFeaturedProducts().slice(0, 3);
    return (
      <div className="empty-cart">
        <div className="empty-cart-hero">
          <div className="empty-cart-copy">
            <span className="eyebrow">Giỏ hàng của bạn</span>
            <h1>Giỏ hoa đang chờ bạn chọn</h1>
            <p>Khám phá những thiết kế theo mùa và chọn một bó hoa dành riêng cho người bạn yêu quý.</p>
            <Link className="button button-primary" href="/hoa">Chọn hoa ngay <ArrowRight /></Link>
          </div>
        </div>
        <section className="empty-cart-recommendations" aria-labelledby="empty-cart-recommendations-title">
          <div className="empty-cart-heading">
            <span className="eyebrow">Gợi ý từ Trâm</span>
            <h2 id="empty-cart-recommendations-title">Có thể bạn sẽ thích</h2>
          </div>
          <div className="product-grid">{recommendations.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      </div>
    );
  }
  return (
    <div className="cart-layout">
      <div className="cart-items"><div className="cart-title"><div><span className="eyebrow">Giỏ hàng của bạn</span><h1>{items.length} mẫu hoa · {totalQuantity} sản phẩm</h1></div><Link href="/hoa"><ArrowLeft /> Tiếp tục chọn hoa</Link></div>{items.map((item) => <article className="cart-item" key={item.productId}><Link className="cart-item-image" href={`/hoa/${item.slug}`}><Image src={item.image} alt={item.name} fill sizes="150px" /></Link><div className="cart-item-copy"><Link href={`/hoa/${item.slug}`}><h2>{item.name}</h2></Link><p>{item.sku} · Kích thước tiêu chuẩn</p><span className="cart-unit-price">{formatVnd(item.price)} × {item.quantity}</span><div className="cart-item-controls"><div className="quantity-control"><button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label={`Giảm số lượng ${item.name}`} disabled={item.quantity <= 1}><Minus /></button><span aria-live="polite">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label={`Tăng số lượng ${item.name}`}><Plus /></button></div><button type="button" className="remove-item" onClick={() => removeItem(item.productId)} aria-label={`Xóa ${item.name} khỏi giỏ`}><Trash2 /> Xóa</button></div></div><div className="cart-line-total"><span>Thành tiền</span><strong>{formatVnd(item.price * item.quantity)}</strong></div></article>)}</div>
      <aside className="order-summary"><span className="eyebrow">Tóm tắt đơn</span><h2>Thành tiền</h2><div className="summary-row"><span>Tạm tính</span><strong>{formatVnd(subtotal)}</strong></div><div className="summary-row"><span>Phí giao hoa</span><em>Tính ở bước tiếp theo</em></div><div className="summary-total"><span>Tổng tạm tính</span><strong>{formatVnd(subtotal)}</strong></div><Link className="button button-primary button-full" href="/thanh-toan">Tiến hành đặt hoa</Link><div className="summary-assurances"><span><ShieldCheck />Thanh toán an toàn với {paymentLabel(settings)}</span><span><Truck />Phí giao được báo rõ trước khi xác nhận</span></div></aside>
    </div>
  );
}

function paymentLabel(settings: SiteSettings) {
  if (settings.codEnabled && settings.momoEnabled) return "COD hoặc MoMo";
  return settings.codEnabled ? "COD" : "MoMo";
}
