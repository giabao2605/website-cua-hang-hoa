"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import type { SiteSettings } from "../lib/site";

type NoticeSetter = (notice: { type: "success" | "error"; text: string } | null) => void;

export function AdminSettingsPanel({ settings, onChange, pending, setPending, setNotice }: {
  settings: SiteSettings;
  onChange: (settings: SiteSettings) => void;
  pending: string | null;
  setPending: (value: string | null) => void;
  setNotice: NoticeSetter;
}) {
  const [uploadingQr, setUploadingQr] = useState(false);

  async function uploadMomoQr(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    setNotice(null);
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const body = await response.json() as { data?: { url?: string }; error?: { message?: string } };
      const momoQrImage = body.data?.url;
      if (!response.ok || !momoQrImage) throw new Error(body.error?.message ?? "Không thể tải mã QR MoMo lên.");
      onChange({ ...settings, momoQrImage });
      setNotice({ type: "success", text: "Đã tải mã QR mới. Nhấn Lưu cấu hình vận hành để áp dụng." });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể tải mã QR MoMo lên." });
    } finally {
      setUploadingQr(false);
      event.currentTarget.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("settings");
    setNotice(null);
    const data = new FormData(event.currentTarget);
    const input = {
      shopName: data.get("shopName"),
      tagline: data.get("tagline"),
      phone: data.get("phone"),
      address: data.get("address"),
      openingHours: data.get("openingHours"),
      zaloUrl: data.get("zaloUrl"),
      momoNumber: data.get("momoNumber"),
      momoOwner: data.get("momoOwner"),
      momoQrImage: data.get("momoQrImage"),
      otpSenderEmail: data.get("otpSenderEmail"),
      codEnabled: data.get("codEnabled") === "on",
      momoEnabled: data.get("momoEnabled") === "on",
    };
    try {
      const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
      const body = await response.json() as { data?: SiteSettings; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể lưu cấu hình vận hành.");
      onChange(body.data);
      setNotice({ type: "success", text: "Đã lưu cấu hình vận hành. Trang khách sẽ dùng dữ liệu mới khi tải lại." });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể lưu cấu hình vận hành." });
    } finally {
      setPending(null);
    }
  }

  const needsMomoOwner = settings.momoEnabled && settings.momoOwner.toLocaleLowerCase("vi").includes("chờ");
  const needsOtpSender = !settings.otpSenderEmail;
  return <section className="admin-panel settings-admin" id="cai-dat">
    <div className="panel-heading"><div><h2>Cấu hình vận hành</h2><p>Thông tin cửa hàng, thanh toán và email xác thực tài khoản.</p></div><span>{needsMomoOwner || needsOtpSender ? "Cần hoàn tất" : "Đã cấu hình"}</span></div>
    {needsMomoOwner && <div className="settings-alert">Hãy nhập tên chủ tài khoản MoMo trước khi nhận thanh toán thật.</div>}
    {needsOtpSender && <div className="settings-alert">Hãy nhập email chủ shop đã được xác minh trên Brevo để gửi mã OTP.</div>}
    <form onSubmit={submit}>
      <div className="settings-grid">
        <fieldset><legend>Thông tin cửa hàng</legend><label>Tên cửa hàng<input name="shopName" defaultValue={settings.shopName} required /></label><label>Slogan<input name="tagline" defaultValue={settings.tagline} required /></label><label>Số điện thoại<input name="phone" defaultValue={settings.phoneDisplay} required /></label><label>Địa chỉ<textarea name="address" defaultValue={settings.address} rows={2} required /></label><label>Giờ mở cửa<input name="openingHours" defaultValue={settings.openingHours} required /></label><label>Đường dẫn Zalo<input name="zaloUrl" type="url" defaultValue={settings.zaloUrl} required /></label></fieldset>
        <fieldset><legend>Thanh toán</legend><label>Số MoMo<input name="momoNumber" defaultValue={settings.momoNumber} required /></label><label>Tên chủ tài khoản MoMo<input name="momoOwner" defaultValue={settings.momoOwner} required /></label><div className="momo-qr-settings"><span>Mã QR MoMo hiển thị</span><div><Image src={settings.momoQrImage} alt="Xem trước mã QR MoMo" width={84} height={150} /><label className="file-field">Đổi ảnh mã QR<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadMomoQr} disabled={uploadingQr || pending === "settings"} /></label></div><input type="hidden" name="momoQrImage" value={settings.momoQrImage} /><small>Chấp nhận JPEG, PNG hoặc WebP, tối đa 5 MB.</small></div><div className="payment-switches"><label className="checkbox-line"><input name="codEnabled" type="checkbox" defaultChecked={settings.codEnabled} /> Nhận thanh toán COD</label><label className="checkbox-line"><input name="momoEnabled" type="checkbox" defaultChecked={settings.momoEnabled} /> Nhận thanh toán MoMo</label></div><p>MoMo vẫn phải được đối soát thủ công; hệ thống không tự đánh dấu đơn đã thanh toán.</p></fieldset>
        <fieldset><legend>Email xác thực</legend><label>Email chủ shop gửi OTP<input name="otpSenderEmail" type="email" defaultValue={settings.otpSenderEmail} placeholder="email-chu-shop@gmail.com" autoComplete="email" /></label><p>Email này phải được thêm và xác minh trong Brevo trước khi gửi cho khách. Khóa Brevo chỉ được lưu trong secrets của máy chủ, không lưu tại đây.</p></fieldset>
      </div>
      <div className="settings-actions"><button className="button button-primary" disabled={pending === "settings"}>{pending === "settings" ? "Đang lưu..." : "Lưu cấu hình vận hành"}</button></div>
    </form>
  </section>;
}
