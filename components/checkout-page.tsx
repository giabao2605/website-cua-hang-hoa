"use client";

import Image from "next/image";
import Link from "@/components/safe-link";
import { AlertCircle, CheckCircle2, ChevronRight, CreditCard, PackageCheck, Truck } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { calculateCart, formatVnd, selectShippingRule, type ShippingRule } from "../lib/commerce";
import { provinceOptions, type SiteSettings } from "../lib/site";
import { useCart } from "./cart-provider";

type CheckoutResult = { code: string; paymentMethod: "COD" | "MOMO"; total: number };

export function CheckoutPage({
  shippingRules,
  customerEmail = "",
  customerName = "",
  customerPhone = "",
  customerAddress = "",
  settings,
}: {
  shippingRules: readonly ShippingRule[];
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  settings: SiteSettings;
}) {
  const { items, subtotal, ready, clear } = useCart();
  const [payment, setPayment] = useState<"COD" | "MOMO">(() => settings.codEnabled ? "COD" : "MOMO");
  const [province, setProvince] = useState("Đắk Lắk");
  const [locality, setLocality] = useState("Xã Tuy An Bắc");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [reportingPayment, setReportingPayment] = useState(false);
  const [paymentReported, setPaymentReported] = useState(false);
  const [paymentReportError, setPaymentReportError] = useState("");
  const [tomorrow] = useState(() => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10));
  const idempotencyKey = useRef("");
  const region = provinceOptions.find((item) => item.province === province)?.region ?? "Khác";
  const shippingRule = useMemo(
    () => selectShippingRule(shippingRules, { locality, province, region }),
    [locality, province, region, shippingRules],
  );
  const totals = useMemo(
    () => items.length
      ? calculateCart(items.map((item) => ({ id: item.productId, unitPrice: item.price, quantity: item.quantity })), null, shippingRule.fee)
      : { subtotal: 0, discount: 0, shipping: shippingRule.fee, total: shippingRule.fee },
    [items, shippingRule],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    const form = new FormData(event.currentTarget);
    const payload = {
      buyerName: form.get("buyerName"),
      buyerEmail: form.get("buyerEmail"),
      buyerPhone: form.get("buyerPhone"),
      recipientName: form.get("recipientName"),
      recipientPhone: form.get("recipientPhone"),
      province,
      locality,
      addressLine: form.get("addressLine"),
      deliveryDate: form.get("deliveryDate"),
      deliverySlot: form.get("deliverySlot"),
      paymentMethod: payment,
      note: form.get("note"),
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      idempotencyKey: idempotencyKey.current,
    };
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { data?: CheckoutResult; error?: { message?: string } };
      if (!response.ok || !data.data) throw new Error(data.error?.message ?? "Không thể tạo đơn lúc này.");
      setResult(data.data);
      clear();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Đã có lỗi, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function reportPayment() {
    if (!result || !idempotencyKey.current) return;
    setPaymentReportError("");
    setReportingPayment(true);
    try {
      const response = await fetch("/api/orders/payment-reported", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: result.code, idempotencyKey: idempotencyKey.current }),
      });
      const data = await response.json() as { data?: { paymentStatus: string }; error?: { message?: string } };
      if (!response.ok || !data.data) throw new Error(data.error?.message ?? "Không thể gửi xác nhận lúc này.");
      setPaymentReported(true);
    } catch (cause) {
      setPaymentReportError(cause instanceof Error ? cause.message : "Không thể gửi xác nhận lúc này.");
    } finally {
      setReportingPayment(false);
    }
  }

  if (!ready && !result) {
    return <div className="cart-loading" role="status">Đang tải đơn hoa...</div>;
  }

  if (!items.length && !result) {
    return <div className="empty-checkout"><h1>Chưa có sản phẩm để thanh toán</h1><p>Hãy chọn ít nhất một bó hoa trước khi tiếp tục.</p><Link className="button button-primary" href="/hoa">Chọn hoa</Link></div>;
  }

  if (result) {
    return <div className="checkout-success"><CheckCircle2 /><span className="eyebrow">Đặt hoa thành công</span><h1>Cảm ơn bạn đã chọn {settings.shopName}</h1><p>Mã đơn của bạn là <strong>{result.code}</strong>. Chúng tôi sẽ gọi xác nhận hoa và lịch giao trong giờ mở cửa.</p>{result.paymentMethod === "MOMO" && <div className="momo-instructions"><div><a className="momo-qr" href={settings.momoQrImage} target="_blank" rel="noreferrer" aria-label="Mở mã QR MoMo kích thước đầy đủ"><Image src={settings.momoQrImage} alt={`Mã QR MoMo của ${settings.momoOwner}`} width={420} height={748} priority /></a><a className="momo-qr-link" href={settings.momoQrImage} target="_blank" rel="noreferrer">Mở ảnh QR kích thước đầy đủ</a></div><div><strong>Thanh toán MoMo đang chờ xác nhận</strong><ol><li>Mở MoMo hoặc ứng dụng ngân hàng hỗ trợ VietQR và quét mã.</li><li>Tự nhập đúng số tiền <b>{formatVnd(result.total)}</b>.</li><li>Nhập nội dung chuyển tiền <b>{result.code}</b>.</li></ol><p>Chủ tài khoản: <b>{settings.momoOwner}</b>.</p><small>QR cá nhân không tự điền số tiền. Đơn chỉ được ghi nhận đã thanh toán sau khi shop đối soát giao dịch.</small><div className="momo-report">{paymentReported ? <div className="payment-report-success" role="status"><strong>Gửi xác nhận thành công</strong><p>Cảm ơn bạn đã thanh toán. {settings.shopName} đã nhận thông báo và sẽ đối soát giao dịch sớm nhất.</p></div> : <><button className="button button-primary button-full" type="button" onClick={reportPayment} disabled={reportingPayment}>{reportingPayment ? "Đang gửi xác nhận..." : "Đã thanh toán"}</button><p className="momo-report-help">Chỉ bấm sau khi giao dịch đã hoàn tất.</p>{paymentReportError && <p className="form-error" role="alert">{paymentReportError}</p>}</>}</div></div></div>}<div className="success-actions"><Link className="button button-primary" href={`/tra-cuu-don?code=${result.code}`}>Theo dõi đơn hàng</Link><Link className="button button-outline" href="/hoa">Tiếp tục mua hoa</Link></div></div>;
  }

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <div className="checkout-form">
        <div className="checkout-heading"><span className="eyebrow">Thanh toán an toàn</span><h1>Thông tin đặt và nhận hoa</h1><p>Chúng tôi chỉ dùng thông tin này để xác nhận và giao đơn.</p></div>
        {error && <div className="form-error"><AlertCircle />{error}</div>}
        <section className="form-card">
          <div className="form-card-title"><span>1</span><div><h2>Người đặt hoa</h2><p>Thông tin để shop liên hệ xác nhận.</p></div></div>
          <div className="form-grid">
            <label>Họ và tên<input name="buyerName" required minLength={2} defaultValue={customerName} autoComplete="name" /></label>
            <label>Email<input name="buyerEmail" type="email" required defaultValue={customerEmail} readOnly={Boolean(customerEmail)} autoComplete="email" /></label>
            <label>Số điện thoại<input name="buyerPhone" required inputMode="tel" defaultValue={customerPhone} autoComplete="tel" /></label>
          </div>
        </section>
        <section className="form-card">
          <div className="form-card-title"><span>2</span><div><h2>Người nhận và địa chỉ</h2><p>Điền chính xác để hoa đến đúng người, đúng lúc.</p></div></div>
          <div className="form-grid">
            <label>Họ tên người nhận<input name="recipientName" required minLength={2} /></label>
            <label>Số điện thoại người nhận<input name="recipientPhone" required inputMode="tel" /></label>
            <label>Tỉnh / Thành phố<input list="province-options" value={province} onChange={(event) => setProvince(event.target.value)} autoComplete="address-level1" required /><datalist id="province-options">{provinceOptions.map((item) => <option key={item.province} value={item.province} />)}</datalist></label>
            <label>Xã / Phường<input value={locality} onChange={(event) => setLocality(event.target.value)} required /></label>
            <label className="field-wide">Địa chỉ chi tiết<input name="addressLine" required minLength={3} defaultValue={customerAddress} placeholder="Số nhà, tên đường, thôn..." /></label>
            <label>Ngày giao<input name="deliveryDate" type="date" min={tomorrow} defaultValue={tomorrow} required /></label>
            <label>Khung giờ<select name="deliverySlot" defaultValue="08:00-11:00"><option value="08:00-11:00">08:00 - 11:00</option><option value="11:00-14:00">11:00 - 14:00</option><option value="14:00-17:00">14:00 - 17:00</option></select></label>
            <label className="field-wide">Lời nhắn / ghi chú<textarea name="note" maxLength={500} rows={4} placeholder="Nội dung thiệp, lưu ý khi giao..." /></label>
          </div>
        </section>
        <section className="form-card">
          <div className="form-card-title"><span>3</span><div><h2>Phương thức thanh toán</h2><p>Chọn cách thuận tiện nhất với bạn.</p></div></div>
          <div className="payment-options">
            {settings.codEnabled && <label className={payment === "COD" ? "payment-option selected" : "payment-option"}><input type="radio" checked={payment === "COD"} onChange={() => setPayment("COD")} /><PackageCheck /><span><strong>Thanh toán khi nhận hoa</strong><small>COD, shop xác nhận trước khi thực hiện</small></span></label>}
            {settings.momoEnabled && <label className={payment === "MOMO" ? "payment-option selected" : "payment-option"}><input type="radio" checked={payment === "MOMO"} onChange={() => setPayment("MOMO")} /><CreditCard /><span><strong>Chuyển khoản MoMo</strong><small>QR của chủ shop hiện sau khi tạo đơn; khách tự nhập tổng tiền</small></span></label>}
          </div>
        </section>
      </div>
      <aside className="checkout-summary">
        <h2>Đơn hoa của bạn</h2>
        {items.map((item) => <div className="checkout-item" key={item.productId}><div><Image src={item.image} alt="" width={74} height={88} /><b>{item.quantity}</b></div><span><strong>{item.name}</strong><small>Kích thước tiêu chuẩn</small></span><em>{formatVnd(item.price * item.quantity)}</em></div>)}
        <div className="summary-row"><span>Tạm tính</span><strong>{formatVnd(subtotal)}</strong></div>
        <div className="summary-row"><span>Giao đến {province}</span><strong>{formatVnd(shippingRule.fee)}</strong></div>
        <div className="shipping-estimate"><Truck /><span><strong>Phí giao tạm tính</strong><small>Shop sẽ xác nhận lại theo tuyến, mùa hoa và ngày giao.</small></span></div>
        <div className="summary-total"><span>Tổng thanh toán</span><strong>{formatVnd(totals.total)}</strong></div>
        <button className="button button-primary button-full" disabled={submitting}>{submitting ? "Đang tạo đơn..." : "Xác nhận đặt hoa"} <ChevronRight /></button>
        <small className="checkout-terms">Bằng việc đặt hoa, bạn xác nhận thông tin đã điền là chính xác và đồng ý để shop liên hệ xác nhận đơn.</small>
      </aside>
    </form>
  );
}
