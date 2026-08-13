"use client";

import { useMemo, useState } from "react";
import { createShippingRuleId } from "../lib/admin-domain";
import type { AdminShippingRule } from "../lib/admin-store";
import { formatVnd } from "../lib/commerce";

type NoticeSetter = (notice: { type: "success" | "error"; text: string } | null) => void;
type ShippingKind = AdminShippingRule["kind"];

const routeKinds: Record<ShippingKind, Readonly<{
  label: string;
  description: string;
  placeholder: string;
  namePrefix: string;
  priority: number;
  fee: number;
  estimate: string;
}>> = {
  locality: { label: "Xã / Phường", description: "Khớp chính xác địa phương người nhận nhập.", placeholder: "Xã Tuy An Bắc", namePrefix: "Nội khu", priority: 300, fee: 25_000, estimate: "Trong ngày" },
  province: { label: "Tỉnh / Thành phố", description: "Áp dụng cho toàn bộ một tỉnh hoặc thành phố.", placeholder: "Phú Yên", namePrefix: "Khu vực", priority: 200, fee: 65_000, estimate: "1 - 2 ngày" },
  region: { label: "Vùng", description: "Dùng cho nhóm tỉnh đã được phân vùng ở checkout.", placeholder: "Tây Nguyên & Nam Trung Bộ", namePrefix: "Vùng", priority: 100, fee: 85_000, estimate: "1 - 2 ngày" },
  nationwide: { label: "Toàn quốc", description: "Tuyến dự phòng khi không có tuyến cụ thể hơn.", placeholder: "Việt Nam", namePrefix: "Các tỉnh thành còn lại", priority: 0, fee: 120_000, estimate: "2 - 4 ngày" },
};

export function AdminShippingPanel({ rules, onChange, creating, onCreatingChange, pending, setPending, setNotice }: {
  rules: readonly AdminShippingRule[];
  onChange: (rules: AdminShippingRule[]) => void;
  creating: boolean;
  onCreatingChange: (value: boolean) => void;
  pending: string | null;
  setPending: (value: string | null) => void;
  setNotice: NoticeSetter;
}) {
  const [draft, setDraft] = useState({ kind: "province" as ShippingKind, value: "", name: "", fee: "65000", estimate: "1 - 2 ngày", active: true });
  const kind = routeKinds[draft.kind];
  const routeValue = draft.kind === "nationwide" ? "Việt Nam" : draft.value.trim();
  const suggestedName = draft.kind === "nationwide" ? kind.namePrefix : `${kind.namePrefix} ${routeValue}`.trim();
  const routeName = draft.name.trim() || suggestedName;
  const routeId = useMemo(() => createShippingRuleId(draft.kind, routeValue), [draft.kind, routeValue]);

  function chooseKind(nextKind: ShippingKind) {
    const next = routeKinds[nextKind];
    setDraft({
      kind: nextKind,
      value: nextKind === "nationwide" ? "Việt Nam" : "",
      name: "",
      fee: String(next.fee),
      estimate: next.estimate,
      active: true,
    });
  }

  async function saveRule(rule: AdminShippingRule, form: HTMLFormElement) {
    setPending(`shipping:${rule.id}`);
    setNotice(null);
    const data = new FormData(form);
    try {
      const response = await fetch(`/api/admin/shipping/${encodeURIComponent(rule.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fee: Number(data.get("fee")), estimate: String(data.get("estimate")), active: data.get("active") === "on" }),
      });
      const body = await response.json() as { data?: AdminShippingRule; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể lưu tuyến giao.");
      const saved = body.data;
      onChange(rules.map((item) => item.id === saved.id ? saved : item));
      setNotice({ type: "success", text: `Đã cập nhật ${saved.name}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể lưu tuyến giao." });
    } finally {
      setPending(null);
    }
  }

  async function createRule() {
    setPending("shipping:new");
    setNotice(null);
    const input = {
      id: routeId,
      name: routeName,
      kind: draft.kind,
      value: routeValue,
      fee: Number(draft.fee),
      estimate: draft.estimate,
      priority: kind.priority,
      active: draft.active,
    };
    try {
      const response = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await response.json() as { data?: AdminShippingRule; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể thêm tuyến giao.");
      onChange([...rules, body.data].sort((left, right) => right.priority - left.priority));
      onCreatingChange(false);
      setNotice({ type: "success", text: `Đã thêm tuyến giao ${body.data.name}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể thêm tuyến giao." });
    } finally {
      setPending(null);
    }
  }

  return <section className="admin-panel shipping-admin" id="giao-hang">
    <div className="panel-heading"><div><h2>Tuyến giao hàng</h2><p>Tuyến cụ thể được ưu tiên trước; tuyến toàn quốc luôn là phương án dự phòng.</p></div><button className={creating ? "button button-outline" : "button button-primary"} type="button" aria-expanded={creating} aria-controls="shipping-create-form" onClick={() => onCreatingChange(!creating)}>{creating ? "Đóng biểu mẫu" : "Thêm tuyến giao"}</button></div>

    {creating && <form className="shipping-create-form" id="shipping-create-form" onSubmit={(event) => { event.preventDefault(); void createRule(); }}>
      <header><div><span>Tuyến mới</span><h3>Thiết lập phạm vi và phí giao</h3><p>Chọn cấp áp dụng trước, sau đó nhập khu vực. Mã tuyến và độ ưu tiên được hệ thống tự tạo.</p></div><strong>Bước 1 trong 1</strong></header>
      <div className="shipping-create-layout">
        <div className="shipping-create-fields">
          <fieldset>
            <legend>1. Phạm vi áp dụng</legend>
            <div className="shipping-kind-options">
              {(Object.entries(routeKinds) as Array<[ShippingKind, (typeof routeKinds)[ShippingKind]]>).map(([value, option]) => <div className={draft.kind === value ? "shipping-kind-option selected" : "shipping-kind-option"} key={value}><input id={`shipping-kind-${value}`} type="radio" name="kind" value={value} checked={draft.kind === value} onChange={() => chooseKind(value)} /><label htmlFor={`shipping-kind-${value}`}><strong>{option.label}</strong><small>{option.description}</small></label></div>)}
            </div>
            <div className="admin-editor-grid">
              <label className="field-wide">Khu vực đối chiếu<input value={routeValue} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} readOnly={draft.kind === "nationwide"} placeholder={kind.placeholder} required /><small>Viết đúng tên khách sẽ dùng, ví dụ “Phú Yên”.</small></label>
              <label className="field-wide">Tên hiển thị<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder={suggestedName || "Tên tuyến hiển thị trong quản trị"} /><small>Để trống để dùng tên gợi ý: {suggestedName || "chưa có"}.</small></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>2. Phí và thời gian dự kiến</legend>
            <div className="admin-editor-grid">
              <label>Phí giao, VND<input value={draft.fee} onChange={(event) => setDraft((current) => ({ ...current, fee: event.target.value }))} type="number" min="0" max="2000000" step="1000" required /></label>
              <label>Thời gian dự kiến<input value={draft.estimate} onChange={(event) => setDraft((current) => ({ ...current, estimate: event.target.value }))} placeholder="1 - 2 ngày" required /></label>
              <div className="shipping-active-toggle field-wide"><input id="shipping-new-active" type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} /><label htmlFor="shipping-new-active"><strong>Bật tuyến ngay sau khi tạo</strong><small>Bỏ chọn nếu bạn muốn lưu trước và kiểm tra sau.</small></label></div>
            </div>
          </fieldset>
        </div>
        <aside className="shipping-create-summary" aria-label="Tóm tắt tuyến giao mới">
          <span>Xem lại trước khi tạo</span>
          <h3>{routeName || "Tuyến chưa có tên"}</h3>
          <dl><div><dt>Cấp áp dụng</dt><dd>{kind.label}</dd></div><div><dt>Khu vực</dt><dd>{routeValue || "Chưa nhập"}</dd></div><div><dt>Phí giao</dt><dd>{draft.fee && Number.isFinite(Number(draft.fee)) ? formatVnd(Number(draft.fee)) : "Chưa nhập"}</dd></div><div><dt>Thời gian</dt><dd>{draft.estimate || "Chưa nhập"}</dd></div><div><dt>Độ ưu tiên</dt><dd>{kind.priority}</dd></div><div><dt>Trạng thái</dt><dd>{draft.active ? "Đang bật" : "Đang tắt"}</dd></div></dl>
          <small>Mã tự tạo: {routeId}</small>
        </aside>
      </div>
      <footer><button className="button button-outline" type="button" onClick={() => onCreatingChange(false)}>Hủy</button><button className="button button-primary" disabled={pending === "shipping:new" || !routeValue || !draft.estimate || !draft.fee}>{pending === "shipping:new" ? "Đang thêm..." : "Tạo tuyến giao"}</button></footer>
    </form>}

    <div className="shipping-admin-list">{rules.map((rule) => <form className="shipping-admin-row" key={rule.id} onSubmit={(event) => { event.preventDefault(); void saveRule(rule, event.currentTarget); }}><div className="shipping-rule-identity"><span>{routeKinds[rule.kind].label}</span><strong>{rule.name}</strong><small>{rule.value} · ưu tiên {rule.priority}</small></div><div className="shipping-rule-fields"><label>Phí giao<input name="fee" type="number" min="0" max="2000000" step="1000" defaultValue={rule.fee} /></label><label>Thời gian dự kiến<input name="estimate" defaultValue={rule.estimate} /></label></div><div className="shipping-active-toggle"><input id={`shipping-active-${rule.id}`} name="active" type="checkbox" defaultChecked={rule.active} /><label htmlFor={`shipping-active-${rule.id}`}><strong>{rule.active ? "Đang bật" : "Đang tắt"}</strong><small>Có thể thay đổi rồi bấm Lưu.</small></label></div><button className="button button-outline" disabled={pending === `shipping:${rule.id}`}>{pending === `shipping:${rule.id}` ? "Đang lưu..." : "Lưu thay đổi"}</button></form>)}</div>
  </section>;
}
