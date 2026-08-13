"use client";

import Image from "next/image";
import Link from "@/components/safe-link";
import { FormEvent, useMemo, useState } from "react";
import type { AdminDashboard, AdminOrder, AdminProduct } from "../lib/admin-store";
import { formatVnd } from "../lib/commerce";
import type { ContactRequestRecord } from "../lib/engagement-store";
import { AdminProductEditor } from "./admin-product-editor";
import { AdminSettingsPanel } from "./admin-settings-panel";
import { AdminShippingPanel } from "./admin-shipping-panel";

type Notice = Readonly<{ type: "success" | "error"; text: string }> | null;
type AdminSection = "overview" | "orders" | "contacts" | "products" | "shipping" | "settings";

const statusLabels = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang kết hoa",
  delivering: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
} as const;

const paymentLabels = {
  cod_pending: "COD chờ thu",
  pending: "MoMo chờ chuyển",
  payment_review: "Đang kiểm tra MoMo",
  paid: "MoMo đã thanh toán",
  collected: "COD đã thu",
  rejected: "Thanh toán bị từ chối",
} as const;

const contactStatusLabels = {
  new: "Mới nhận",
  contacted: "Đã liên hệ",
  closed: "Đã hoàn tất",
} as const;

export function AdminShell({ email, initialDashboard }: { email: string; initialDashboard: AdminDashboard }) {
  const [products, setProducts] = useState([...initialDashboard.products]);
  const [shippingRules, setShippingRules] = useState([...initialDashboard.shippingRules]);
  const [orders, setOrders] = useState([...initialDashboard.orders]);
  const [contacts, setContacts] = useState([...initialDashboard.contacts]);
  const [settings, setSettings] = useState(initialDashboard.settings);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [shippingEditorOpen, setShippingEditorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<AdminSection>("overview");
  const activeProducts = products.filter((product) => product.active).length;
  const pendingOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
  const pendingContacts = contacts.filter((contact) => contact.status === "new").length;
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return query
      ? orders.filter((order) => [order.code, order.buyerName, order.buyerEmail, order.buyerPhone].join(" ").toLocaleLowerCase("vi").includes(query))
      : orders;
  }, [orders, search]);
  const sectionTitles: Record<AdminSection, string> = {
    overview: "Tổng quan cửa hàng",
    orders: "Quản lý đơn hàng",
    contacts: "Yêu cầu tư vấn",
    products: "Sản phẩm theo mùa",
    shipping: "Tuyến giao hàng",
    settings: "Cấu hình vận hành",
  };

  function createProduct() {
    const suffix = Date.now().toString(36);
    setEditingProduct({
      id: `hoa-${suffix}`,
      slug: `hoa-${suffix}`,
      sku: `TF-NEW-${suffix.toUpperCase()}`,
      name: "Thiết kế hoa mới",
      subtitle: "Hoa tươi kết thủ công theo mùa",
      description: "Mô tả rõ các loại hoa, bảng màu, phong cách và dịp tặng phù hợp cho thiết kế này.",
      price: 490_000,
      image: "/products/amour-bleu.png",
      gallery: ["/products/amour-bleu.png"],
      category: "Bó hoa",
      occasions: ["Sinh nhật"],
      flowers: ["Hoa theo mùa"],
      palette: "Theo mùa",
      seasonal: "Quanh năm",
      stock: 1,
      active: false,
      featured: false,
    });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const input = {
      id: String(form.get("id")),
      sku: String(form.get("sku")),
      slug: String(form.get("slug")),
      name: String(form.get("name")),
      subtitle: String(form.get("subtitle")),
      description: String(form.get("description")),
      category: String(form.get("category")),
      seasonal: String(form.get("seasonal")),
      image: String(form.get("image")),
      gallery: splitList(String(form.get("gallery"))),
      occasions: splitList(String(form.get("occasions"))),
      flowers: splitList(String(form.get("flowers"))),
      palette: String(form.get("palette")),
      price: Number(form.get("price")),
      compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : undefined,
      stock: Number(form.get("stock")),
      active: form.get("active") === "on",
      featured: form.get("featured") === "on",
      badge: String(form.get("badge") ?? "") || undefined,
    };
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(input.id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await response.json() as { data?: AdminProduct; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể lưu sản phẩm.");
      setProducts((current) => current.some((product) => product.id === body.data?.id)
        ? current.map((product) => product.id === body.data?.id ? body.data as AdminProduct : product)
        : [...current, body.data as AdminProduct]);
      setEditingProduct(null);
      setNotice({ type: "success", text: "Đã lưu sản phẩm. Cửa hàng sẽ dùng dữ liệu mới ở lần tải trang tiếp theo." });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể lưu sản phẩm." });
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File) {
    if (!editingProduct) return;
    setSaving(true);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const body = await response.json() as { data?: { url: string }; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể tải ảnh lên.");
      setEditingProduct((current) => current ? {
        ...current,
        image: body.data?.url ?? current.image,
        gallery: [body.data?.url ?? current.image, ...current.gallery.filter((image) => image !== body.data?.url)],
      } : current);
      setNotice({ type: "success", text: "Ảnh đã được tải lên kho riêng của cửa hàng." });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể tải ảnh lên." });
    } finally {
      setSaving(false);
    }
  }

  async function saveOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingOrder) return;
    setSaving(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(editingOrder.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: form.get("status"), paymentStatus: form.get("paymentStatus"), note: form.get("note"), version: editingOrder.version }),
      });
      const body = await response.json() as { data?: AdminOrder; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể cập nhật đơn.");
      setOrders((current) => current.map((order) => order.id === body.data?.id ? body.data as AdminOrder : order));
      setEditingOrder(null);
      setNotice({ type: "success", text: `Đã cập nhật đơn ${body.data.code}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể cập nhật đơn." });
    } finally {
      setSaving(false);
    }
  }

  async function saveContact(contact: ContactRequestRecord, form: HTMLFormElement) {
    setSaving(true);
    setNotice(null);
    const data = new FormData(form);
    try {
      const response = await fetch(`/api/admin/contacts/${encodeURIComponent(contact.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: data.get("status") }),
      });
      const body = await response.json() as { data?: { id: string; status: ContactRequestRecord["status"] }; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể cập nhật yêu cầu tư vấn.");
      setContacts((current) => current.map((item) => item.id === body.data?.id ? { ...item, status: body.data.status } : item));
      setNotice({ type: "success", text: `Đã cập nhật yêu cầu của ${contact.name}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể cập nhật yêu cầu tư vấn." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><Image src="/brand/tram-florist-logo.png" alt="" width={48} height={48} /><span><strong>Trâm Florist</strong><small>Quản trị cửa hàng</small></span></Link>
        <nav aria-label="Khu vực quản trị"><button className={section === "overview" ? "active" : ""} type="button" onClick={() => setSection("overview")}>Tổng quan</button><button className={section === "orders" ? "active" : ""} type="button" onClick={() => setSection("orders")}>Đơn hàng <b>{pendingOrders}</b></button><button className={section === "contacts" ? "active" : ""} type="button" onClick={() => setSection("contacts")}>Yêu cầu tư vấn <b>{pendingContacts}</b></button><button className={section === "products" ? "active" : ""} type="button" onClick={() => setSection("products")}>Sản phẩm</button><button className={section === "shipping" ? "active" : ""} type="button" onClick={() => { setShippingEditorOpen(false); setSection("shipping"); }}>Tuyến giao hàng</button><button className={section === "settings" ? "active" : ""} type="button" onClick={() => setSection("settings")}>Cấu hình vận hành</button></nav>
        <div className="admin-user"><span>{email.slice(0, 1).toUpperCase()}</span><div><strong>{email}</strong><small>Quản trị viên</small></div></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><span>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}</span><h1>{sectionTitles[section]}</h1></div><div>{section === "orders" && <label><span className="screen-reader-only">Tìm đơn hoặc khách hàng</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm đơn, khách hàng..." /></label>}<Link className="button button-primary" href="/" target="_blank">Xem cửa hàng</Link></div></header>
        <section className="admin-content" id="tong-quan">
          {!initialDashboard.databaseReady && <div className="admin-warning">D1 chưa sẵn sàng trong tiến trình hiện tại. Chạy <code>npm run setup:local</code> rồi khởi động lại máy chủ trước khi chỉnh sửa.</div>}
          {notice && <div className={`admin-notice admin-notice-${notice.type}`} role="status">{notice.text}</div>}
          {section === "overview" && <><section className="admin-quick-actions"><div><strong>Việc cần làm</strong><span>{settings.momoOwner.toLocaleLowerCase("vi").includes("chờ") ? "Bổ sung tên chủ tài khoản MoMo" : "Cấu hình thanh toán đã sẵn sàng"}</span></div><button type="button" onClick={() => setSection("orders")}>Xử lý {pendingOrders} đơn</button><button type="button" onClick={() => setSection("contacts")}>Xem {pendingContacts} yêu cầu mới</button><button type="button" onClick={() => { setSection("products"); createProduct(); }}>Thêm sản phẩm</button><button type="button" onClick={() => { setShippingEditorOpen(true); setSection("shipping"); }}>Thêm tuyến giao</button></section><div className="admin-metrics"><article><span>Đơn cần xử lý</span><strong>{pendingOrders}</strong><small>Dữ liệu thực từ cửa hàng</small></article><article><span>Doanh thu hôm nay</span><strong>{formatVnd(initialDashboard.metrics.revenueToday)}</strong><small>Không tính đơn đã hủy</small></article><article><span>Sản phẩm đang bán</span><strong>{activeProducts}</strong><small>{products.length - activeProducts} mẫu đang ẩn</small></article><article><span>Yêu cầu tư vấn mới</span><strong>{pendingContacts}</strong><small>{contacts.length} yêu cầu gần nhất</small></article><article><span>Khách hàng có tài khoản</span><strong>{initialDashboard.metrics.customers}</strong><small>Xác thực email hoặc Google</small></article><article><span>Đăng ký nhận tin</span><strong>{initialDashboard.metrics.newsletterSubscribers}</strong><small>Đã đồng ý nhận thư</small></article></div></>}

          {section === "orders" && <section className="admin-panel admin-orders" id="don-hang">
            <div className="panel-heading"><div><h2>Đơn hàng</h2><p>Cập nhật tiến độ và xác minh thanh toán thủ công.</p></div><span>{filteredOrders.length} đơn</span></div>
            {filteredOrders.length ? <div className="admin-table"><div className="admin-tr admin-th"><span>Mã đơn</span><span>Khách hàng</span><span>Thanh toán</span><span>Tổng tiền</span><span>Trạng thái</span><span></span></div>{filteredOrders.map((order) => <div className="admin-tr" key={order.id}><strong>{order.code}</strong><span>{order.buyerName}<small>{order.buyerPhone}</small></span><span>{order.paymentMethod}<small>{paymentLabels[order.paymentStatus]}</small></span><span>{formatVnd(order.total)}</span><em>{statusLabels[order.status]}</em><button type="button" onClick={() => setEditingOrder(order)}>Cập nhật</button></div>)}</div> : <div className="admin-empty">Chưa có đơn hàng. Đơn khách đặt trên storefront sẽ xuất hiện tại đây.</div>}
          </section>}

          {section === "contacts" && <section className="admin-panel admin-contacts" id="tu-van">
            <div className="panel-heading"><div><h2>Yêu cầu tư vấn</h2><p>Lời nhắn từ biểu mẫu liên hệ, sắp xếp mới nhất trước.</p></div><span>{contacts.length} yêu cầu</span></div>
            {contacts.length ? <div className="admin-contact-list">{contacts.map((contact) => <article key={contact.id}><div><span>{contact.occasion}</span><h3>{contact.name}</h3><a href={`tel:${contact.phone}`}>{contact.phone}</a>{contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}<time dateTime={contact.createdAt}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(contact.createdAt))}</time></div><p>{contact.message}</p><form onSubmit={(event) => { event.preventDefault(); void saveContact(contact, event.currentTarget); }}><label><span className="screen-reader-only">Trạng thái yêu cầu của {contact.name}</span><select name="status" defaultValue={contact.status}>{Object.entries(contactStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button disabled={saving}>Lưu</button></form></article>)}</div> : <div className="admin-empty">Chưa có yêu cầu tư vấn.</div>}
          </section>}

          {section === "products" && <section className="admin-panel product-admin" id="san-pham">
              <div className="panel-heading"><div><h2>Sản phẩm theo mùa</h2><p>Giá, tồn kho, ảnh và trạng thái hiển thị đều dùng chung với storefront.</p></div><button type="button" onClick={createProduct}>Thêm sản phẩm</button></div>
              <div className="admin-product-list">{products.map((product) => <div key={product.id}><Image src={product.image} alt="" width={58} height={68} /><span><strong>{product.name}</strong><small>{product.sku} · {product.active ? "Đang bán" : "Đang ẩn"}</small></span><b>{product.stock} mẫu</b><em>{formatVnd(product.price)}</em><button type="button" onClick={() => setEditingProduct(product)}>Sửa</button></div>)}</div>
          </section>}
          {section === "shipping" && <AdminShippingPanel rules={shippingRules} onChange={setShippingRules} creating={shippingEditorOpen} onCreatingChange={setShippingEditorOpen} pending={pendingAction} setPending={setPendingAction} setNotice={setNotice} />}
          {section === "settings" && <AdminSettingsPanel settings={settings} onChange={setSettings} pending={pendingAction} setPending={setPendingAction} setNotice={setNotice} />}
        </section>
      </main>

      {editingProduct && <AdminProductEditor product={editingProduct} existing={products.some((product) => product.id === editingProduct.id)} pending={saving} onChange={setEditingProduct} onClose={() => setEditingProduct(null)} onSubmit={saveProduct} onUpload={(file) => { void uploadImage(file); }} />}

      {editingOrder && <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="order-editor-title"><form className="admin-editor admin-order-editor" onSubmit={saveOrder}><header><div><span>Đơn hàng</span><h2 id="order-editor-title">{editingOrder.code}</h2></div><button type="button" onClick={() => setEditingOrder(null)}>Đóng</button></header><div className="order-editor-summary"><p><span>Khách đặt</span><strong>{editingOrder.buyerName}</strong><small>{editingOrder.buyerEmail} · {editingOrder.buyerPhone}</small></p><p><span>Người nhận</span><strong>{editingOrder.recipientName}</strong></p><p><span>Tổng tiền</span><strong>{formatVnd(editingOrder.total)}</strong></p></div><div className="admin-editor-grid"><label>Trạng thái đơn<select name="status" defaultValue={editingOrder.status}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Trạng thái thanh toán<select name="paymentStatus" defaultValue={editingOrder.paymentStatus}>{paymentOptions(editingOrder.paymentMethod).map((value) => <option key={value} value={value}>{paymentLabels[value]}</option>)}</select></label><label className="field-wide">Ghi chú kiểm tra<textarea name="note" rows={3} placeholder="Bắt buộc ghi căn cứ khi xác nhận MoMo đã thanh toán" /></label></div><footer><button className="button button-outline" type="button" onClick={() => setEditingOrder(null)}>Hủy</button><button className="button button-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></footer></form></div>}
    </div>
  );
}

function splitList(value: string) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function paymentOptions(method: "COD" | "MOMO") {
  return method === "COD"
    ? ["cod_pending", "collected", "rejected"] as const
    : ["pending", "payment_review", "paid", "rejected"] as const;
}
