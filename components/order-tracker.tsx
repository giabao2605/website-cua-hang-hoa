"use client";

import Image from "next/image";
import { Check, Search } from "lucide-react";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { formatVnd } from "../lib/commerce";
import type { PublicOrder } from "../lib/order-store";

const steps = [
  ["pending_confirmation", "Đã nhận đơn"], ["confirmed", "Đã xác nhận"], ["preparing", "Đang kết hoa"], ["delivering", "Đang giao"], ["delivered", "Đã giao"],
] as const;

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function OrderTracker({ initialCode = "" }: { initialCode?: string }) {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ready = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    try { const response = await fetch("/api/orders/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: form.get("code"), phone: form.get("phone") }) }); const data = await response.json() as { data?: PublicOrder; error?: { message?: string } }; if (!response.ok || !data.data) throw new Error(data.error?.message ?? "Không tìm thấy đơn hàng."); setOrder(data.data); }
    catch (cause) { setOrder(null); setError(cause instanceof Error ? cause.message : "Không tìm thấy đơn hàng."); }
    finally { setLoading(false); }
  }
  const cancelled = order?.status === "cancelled";
  const activeIndex = order && !cancelled ? steps.findIndex(([status]) => status === order.status) : -1;
  const statusLabel = cancelled
    ? "Đơn đã hủy"
    : order?.paymentMethod === "MOMO" && order.paymentStatus !== "paid"
      ? "Chờ xác nhận MoMo"
      : "Đang xử lý";
  return <div className="tracker-wrap"><form className="tracker-form" onSubmit={lookup}><div className="section-heading centered"><span className="eyebrow">Theo dõi hành trình của hoa</span><h1>Tra cứu đơn hàng</h1><p>Nhập mã đơn và số điện thoại đã dùng khi đặt hoa.</p></div><label>Mã đơn<input name="code" defaultValue={initialCode} required placeholder="Ví dụ: TF260814ABC123" autoCapitalize="characters" /></label><label>Số điện thoại<input name="phone" required inputMode="tel" placeholder="0838 469 089" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary button-full" disabled={!ready || loading} type="submit"><Search size={18} />{loading ? "Đang tìm..." : "Tra cứu đơn"}</button><small>Thông tin tra cứu được bảo vệ; số điện thoại phải trùng với đơn hàng.</small></form>{order && <div className="tracking-result"><div className="tracking-head"><div><span className="eyebrow">Đơn hàng</span><h2>{order.code}</h2><p>Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p></div><strong>{statusLabel}</strong></div>{cancelled ? <p className="form-error">Đơn hàng này đã được hủy. Vui lòng liên hệ Trâm Florist nếu bạn cần hỗ trợ.</p> : <div className="tracking-steps">{steps.map(([status, label], index) => <div className={index <= activeIndex ? "tracking-step active" : "tracking-step"} key={status}><i>{index <= activeIndex ? <Check /> : index + 1}</i><span>{label}</span></div>)}</div>}<div className="tracking-info"><div><span>Người nhận</span><strong>{order.recipientName}</strong><small>{order.recipientPhoneMasked}</small></div><div><span>Giao đến</span><strong>{order.locality}, {order.province}</strong><small>{order.deliveryDate} · {order.deliverySlot}</small></div><div><span>Tổng thanh toán</span><strong>{formatVnd(order.total)}</strong><small>{order.paymentMethod}</small></div></div><div className="tracking-items">{order.items.map((item) => <div key={item.name}><Image src={item.image} alt="" width={70} height={82} /><span><strong>{item.name}</strong><small>Số lượng: {item.quantity}</small></span></div>)}</div></div>}</div>;
}
