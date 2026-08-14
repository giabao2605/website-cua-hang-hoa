"use client";

import { useState, type FormEvent } from "react";
import type { CustomerProfile } from "../lib/customer-profile";

export function AccountProfileCard({ initialProfile }: { initialProfile: CustomerProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName: data.get("fullName"), phone: data.get("phone"), address: data.get("address") }),
      });
      const body = await response.json() as { data?: { profile?: CustomerProfile }; error?: { message?: string } };
      if (!response.ok || !body.data?.profile) throw new Error(body.error?.message ?? "Không thể cập nhật hồ sơ.");
      setProfile(body.data.profile);
      setEditing(false);
      setNotice({ type: "success", text: "Đã cập nhật thông tin tài khoản." });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể cập nhật hồ sơ." });
    } finally {
      setSaving(false);
    }
  }

  return <section className="account-profile-card" aria-labelledby="account-profile-title">
    <header><div><span>Hồ sơ cá nhân</span><h2 id="account-profile-title">Thông tin tài khoản</h2></div><button type="button" onClick={() => { setEditing((value) => !value); setNotice(null); }}>{editing ? "Đóng" : "Chỉnh sửa"}</button></header>
    {notice && <p className={`account-profile-notice ${notice.type}`} role="status">{notice.text}</p>}
    {editing ? <form onSubmit={save}>
      <label>Họ và tên<input name="fullName" defaultValue={profile.fullName} minLength={2} maxLength={100} autoComplete="name" required /></label>
      <label>Email<input value={profile.email} type="email" readOnly aria-readonly="true" /></label>
      <label>Số điện thoại<input name="phone" defaultValue={profile.phone} inputMode="tel" autoComplete="tel" /></label>
      <label>Địa chỉ mặc định<textarea name="address" defaultValue={profile.address} maxLength={240} rows={3} autoComplete="street-address" placeholder="Số nhà, tên đường, xã/phường, tỉnh/thành phố" /></label>
      <div><button className="button button-outline" type="button" onClick={() => setEditing(false)}>Hủy</button><button className="button button-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thông tin"}</button></div>
    </form> : <dl>
      <div><dt>Họ và tên</dt><dd>{profile.fullName}</dd></div>
      <div><dt>Email tài khoản</dt><dd>{profile.email}</dd></div>
      <div><dt>Số điện thoại</dt><dd>{profile.phone || "Chưa cập nhật"}</dd></div>
      <div><dt>Địa chỉ mặc định</dt><dd>{profile.address || "Chưa cập nhật"}</dd></div>
    </dl>}
  </section>;
}
