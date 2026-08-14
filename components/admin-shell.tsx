"use client";

import Image from "next/image";
import Link from "@/components/safe-link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { AdminAccount, AdminAccountList } from "../lib/admin-accounts";
import type { AdminDashboard, AdminOrder, AdminProduct } from "../lib/admin-store";
import { buildAdminOverview } from "../lib/admin-overview";
import { ADMIN_NOTICE_DURATION_MS, createAdminNotice, isAdminNoticeVisible, shouldStoreAdminNotice, type AdminNotice, type AdminNoticeInput, type AdminSection } from "../lib/admin-notice";
import { formatVnd } from "../lib/commerce";
import type { ContactRequestRecord } from "../lib/engagement-store";
import { AdminProductEditor } from "./admin-product-editor";
import { AdminSettingsPanel } from "./admin-settings-panel";
import { AdminShippingPanel } from "./admin-shipping-panel";
import { orderStatuses, type OrderStatus } from "../lib/orders";

type AccountStatusFilter = "all" | "active" | "disabled";
type OrderFilter = OrderStatus | "archived";

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

export function AdminShell({ email, adminUserId, initialDashboard, initialAccountList }: { email: string; adminUserId: string; initialDashboard: AdminDashboard; initialAccountList: AdminAccountList }) {
  const [products, setProducts] = useState([...initialDashboard.products]);
  const [shippingRules, setShippingRules] = useState([...initialDashboard.shippingRules]);
  const [orders, setOrders] = useState([...initialDashboard.orders]);
  const [contacts, setContacts] = useState([...initialDashboard.contacts]);
  const [accounts, setAccounts] = useState([...initialAccountList.accounts]);
  const [settings, setSettings] = useState(initialDashboard.settings);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [notice, setNoticeState] = useState<AdminNotice>(null);
  const [saving, setSaving] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [shippingEditorOpen, setShippingEditorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [section, setSectionState] = useState<AdminSection>("overview");
  const activeSection = useRef<AdminSection>("overview");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderFilter>("pending_confirmation");
  const [accountStatusFilter, setAccountStatusFilter] = useState<AccountStatusFilter>("all");
  const activeProducts = products.filter((product) => product.active).length;
  const pendingOrders = orders.filter((order) => !order.archived && !["delivered", "cancelled"].includes(order.status)).length;
  const pendingContacts = contacts.filter((contact) => contact.status === "new").length;
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return orders.filter((order) => (orderStatusFilter === "archived" ? order.archived : !order.archived && order.status === orderStatusFilter) && (!query || [order.code, order.buyerName, order.buyerEmail, order.buyerPhone].join(" ").toLocaleLowerCase("vi").includes(query)));
  }, [orders, orderStatusFilter, search]);
  const orderStatusCounts = useMemo(() => Object.fromEntries(orderStatuses.map((status) => [status, orders.filter((order) => !order.archived && order.status === status).length])) as Record<OrderStatus, number>, [orders]);
  const archivedOrderCount = orders.filter((order) => order.archived).length;
  const filteredAccounts = useMemo(() => {
    const query = accountSearch.trim().toLocaleLowerCase("vi");
    return accounts.filter((account) => (accountStatusFilter === "all" || (accountStatusFilter === "disabled") === account.disabled)
      && (!query || [account.fullName, account.email, account.phone].join(" ").toLocaleLowerCase("vi").includes(query)));
  }, [accounts, accountSearch, accountStatusFilter]);
  const accountStatusCounts = useMemo(() => ({ all: accounts.length, active: accounts.filter((account) => !account.disabled).length, disabled: accounts.filter((account) => account.disabled).length }), [accounts]);
  const overview = useMemo(() => buildAdminOverview({ orders, products, contacts, shippingRules, settings }), [orders, products, contacts, shippingRules, settings]);
  const sectionTitles: Record<AdminSection, string> = {
    overview: "Tổng quan cửa hàng",
    orders: "Quản lý đơn hàng",
    contacts: "Yêu cầu tư vấn",
    accounts: "Quản lý tài khoản",
    products: "Sản phẩm theo mùa",
    shipping: "Tuyến giao hàng",
    settings: "Cấu hình vận hành",
  };

  function setNotice(nextNotice: AdminNoticeInput) {
    if (!shouldStoreAdminNotice(section, activeSection.current)) return;
    setNoticeState(createAdminNotice(section, nextNotice));
  }

  function setSection(nextSection: AdminSection) {
    activeSection.current = nextSection;
    setNoticeState(null);
    setSectionState(nextSection);
  }

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNoticeState(null), ADMIN_NOTICE_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [notice]);

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
      setOrderStatusFilter(body.data.archived ? "archived" : body.data.status);
      setEditingOrder(null);
      setNotice({ type: "success", text: `Đã cập nhật đơn ${body.data.code}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể cập nhật đơn." });
    } finally {
      setSaving(false);
    }
  }

  async function toggleOrderArchived(order: AdminOrder) {
    const archived = !order.archived;
    if (archived && !window.confirm(`Lưu trữ đơn ${order.code}? Đơn sẽ rời các danh sách vận hành nhưng toàn bộ lịch sử vẫn được giữ lại.`)) return;
    setPendingAction(`archive-order:${order.id}`);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/archive`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ archived, version: order.version }),
      });
      const body = await response.json() as { data?: AdminOrder; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể thay đổi trạng thái lưu trữ.");
      setOrders((current) => current.map((item) => item.id === body.data?.id ? body.data as AdminOrder : item));
      setNotice({ type: "success", text: archived ? `Đã lưu trữ đơn ${order.code}.` : `Đã khôi phục đơn ${order.code}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể thay đổi trạng thái lưu trữ." });
    } finally {
      setPendingAction(null);
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

  async function deleteContact(contact: ContactRequestRecord) {
    if (!window.confirm(`Xóa yêu cầu tư vấn của ${contact.name}? Thao tác này không thể hoàn tác.`)) return;
    setDeletingContactId(contact.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/contacts/${encodeURIComponent(contact.id)}`, { method: "DELETE" });
      const body = await response.json() as { data?: { id: string }; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể xóa yêu cầu tư vấn.");
      setContacts((current) => current.filter((item) => item.id !== body.data?.id));
      setNotice({ type: "success", text: `Đã xóa yêu cầu tư vấn của ${contact.name}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể xóa yêu cầu tư vấn." });
    } finally {
      setDeletingContactId(null);
    }
  }

  async function toggleAccount(account: AdminAccount) {
    const disabled = !account.disabled;
    if (disabled && !window.confirm(`Khóa tài khoản ${account.email}? Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa.`)) return;
    setPendingAction(`account:${account.id}`);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/accounts/${encodeURIComponent(account.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ disabled }),
      });
      const body = await response.json() as { data?: { id: string; disabled: boolean }; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể cập nhật tài khoản.");
      setAccounts((current) => current.map((item) => item.id === body.data?.id ? { ...item, disabled: body.data.disabled } : item));
      setNotice({ type: "success", text: disabled ? `Đã khóa tài khoản ${account.email}.` : `Đã mở khóa tài khoản ${account.email}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể cập nhật tài khoản." });
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteAccount(account: AdminAccount) {
    const confirmEmail = window.prompt(`Xóa vĩnh viễn tài khoản ${account.email}?\n\nĐơn hàng vẫn được giữ nhưng hồ sơ cá nhân sẽ được ẩn danh. Nhập đúng email để xác nhận:`);
    if (confirmEmail === null) return;
    setPendingAction(`delete-account:${account.id}`);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/accounts/${encodeURIComponent(account.id)}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmEmail }),
      });
      const body = await response.json() as { data?: { id: string }; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Không thể xóa tài khoản.");
      setAccounts((current) => current.filter((item) => item.id !== body.data?.id));
      setNotice({ type: "success", text: `Đã xóa tài khoản ${account.email}.` });
    } catch (cause) {
      setNotice({ type: "error", text: cause instanceof Error ? cause.message : "Không thể xóa tài khoản." });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><Image src="/brand/tram-florist-logo.png" alt="" width={48} height={48} /><span><strong>Trâm Florist</strong><small>Quản trị cửa hàng</small></span></Link>
        <nav aria-label="Khu vực quản trị"><button className={section === "overview" ? "active" : ""} type="button" onClick={() => setSection("overview")}>Tổng quan</button><button className={section === "orders" ? "active" : ""} type="button" onClick={() => setSection("orders")}>Đơn hàng <b>{pendingOrders}</b></button><button className={section === "contacts" ? "active" : ""} type="button" onClick={() => setSection("contacts")}>Yêu cầu tư vấn <b>{pendingContacts}</b></button><button className={section === "accounts" ? "active" : ""} type="button" onClick={() => setSection("accounts")}>Tài khoản <b>{accounts.length}</b></button><button className={section === "products" ? "active" : ""} type="button" onClick={() => setSection("products")}>Sản phẩm</button><button className={section === "shipping" ? "active" : ""} type="button" onClick={() => { setShippingEditorOpen(false); setSection("shipping"); }}>Tuyến giao hàng</button><button className={section === "settings" ? "active" : ""} type="button" onClick={() => setSection("settings")}>Cấu hình vận hành</button></nav>
        <div className="admin-user"><span>{email.slice(0, 1).toUpperCase()}</span><div><strong>{email}</strong><small>Quản trị viên</small></div></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><span>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}</span><h1>{sectionTitles[section]}</h1></div><div>{section === "orders" && <label><span className="screen-reader-only">Tìm đơn hoặc khách hàng</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm đơn, khách hàng..." /></label>}{section === "accounts" && <label><span className="screen-reader-only">Tìm tài khoản</span><input value={accountSearch} onChange={(event) => setAccountSearch(event.target.value)} placeholder="Tìm tên, email, số điện thoại..." /></label>}<Link className="button button-primary" href="/" target="_blank">Xem cửa hàng</Link></div></header>
        <section className="admin-content" id="tong-quan">
          {!initialDashboard.databaseReady && <div className="admin-warning">D1 chưa sẵn sàng trong tiến trình hiện tại. Chạy <code>npm run setup:local</code> rồi khởi động lại máy chủ trước khi chỉnh sửa.</div>}
          {isAdminNoticeVisible(notice, section) && <div className={`admin-notice admin-notice-${notice.type}`} role="status">{notice.text}</div>}
          {section === "overview" && <AdminOverview overview={overview} pendingOrders={pendingOrders} pendingContacts={pendingContacts} activeProducts={activeProducts} totalProducts={products.length} revenueToday={initialDashboard.metrics.revenueToday} customers={accounts.filter((account) => !account.isAdmin).length || initialDashboard.metrics.customers} newsletterSubscribers={initialDashboard.metrics.newsletterSubscribers} onSection={setSection} onCreateProduct={() => { setSection("products"); createProduct(); }} onCreateShipping={() => { setShippingEditorOpen(true); setSection("shipping"); }} onEditOrder={setEditingOrder} />}

          {section === "orders" && <section className="admin-panel admin-orders" id="don-hang">
            <div className="panel-heading"><div><h2>Đơn hàng</h2><p>Cập nhật tiến độ, xác minh thanh toán và lưu trữ các đơn không cần theo dõi thường xuyên.</p></div><span>{filteredOrders.length} đơn</span></div>
            <div className="admin-order-tabs" role="tablist" aria-label="Lọc đơn hàng theo trạng thái">{orderStatuses.map((status) => <button key={status} id={`order-tab-${status}`} type="button" role="tab" aria-selected={orderStatusFilter === status} aria-controls="order-status-panel" className={orderStatusFilter === status ? "active" : ""} onClick={() => setOrderStatusFilter(status)}><span>{statusLabels[status]}</span><b>{orderStatusCounts[status]}</b></button>)}<button id="order-tab-archived" type="button" role="tab" aria-selected={orderStatusFilter === "archived"} aria-controls="order-status-panel" className={orderStatusFilter === "archived" ? "active" : ""} onClick={() => setOrderStatusFilter("archived")}><span>Đã lưu trữ</span><b>{archivedOrderCount}</b></button></div>
            <div id="order-status-panel" role="tabpanel" aria-labelledby={`order-tab-${orderStatusFilter}`} tabIndex={0}>{filteredOrders.length ? <div className="admin-table"><div className="admin-tr admin-th"><span>Mã đơn</span><span>Khách hàng</span><span>Thanh toán</span><span>Tổng tiền</span><span>Trạng thái</span><span></span></div>{filteredOrders.map((order) => <div className="admin-tr" key={order.id}><strong>{order.code}</strong><span>{order.buyerName}<small>{order.buyerPhone}</small></span><span>{order.paymentMethod}<small>{paymentLabels[order.paymentStatus]}</small></span><span>{formatVnd(order.total)}</span><em>{statusLabels[order.status]}</em><span className="admin-order-actions"><button type="button" onClick={() => setEditingOrder(order)}>Cập nhật</button><button type="button" className={order.archived ? "restore" : "archive"} disabled={pendingAction === `archive-order:${order.id}`} onClick={() => { void toggleOrderArchived(order); }}>{pendingAction === `archive-order:${order.id}` ? "Đang lưu..." : order.archived ? "Khôi phục" : "Lưu trữ"}</button></span></div>)}</div> : <div className="admin-empty">Không có đơn {orderStatusFilter === "archived" ? "đã lưu trữ" : statusLabels[orderStatusFilter].toLocaleLowerCase("vi")} {search ? "phù hợp với từ khóa tìm kiếm." : "trong trạng thái này."}</div>}</div>
          </section>}

          {section === "contacts" && <section className="admin-panel admin-contacts" id="tu-van">
            <div className="panel-heading"><div><h2>Yêu cầu tư vấn</h2><p>Lời nhắn từ biểu mẫu liên hệ, sắp xếp mới nhất trước.</p></div><span>{contacts.length} yêu cầu</span></div>
            {contacts.length ? <div className="admin-contact-list">{contacts.map((contact) => <article key={contact.id}><div><span>{contact.occasion}</span><h3>{contact.name}</h3><a href={`tel:${contact.phone}`}>{contact.phone}</a>{contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}<time dateTime={contact.createdAt}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(contact.createdAt))}</time></div><p>{contact.message}</p><form onSubmit={(event) => { event.preventDefault(); void saveContact(contact, event.currentTarget); }}><label><span className="screen-reader-only">Trạng thái yêu cầu của {contact.name}</span><select name="status" defaultValue={contact.status} disabled={deletingContactId === contact.id}>{Object.entries(contactStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button disabled={saving || deletingContactId === contact.id}>Lưu</button><button type="button" className="admin-contact-delete" onClick={() => { void deleteContact(contact); }} disabled={saving || deletingContactId === contact.id}>{deletingContactId === contact.id ? "Đang xóa..." : "Xóa"}</button></form></article>)}</div> : <div className="admin-empty">Chưa có yêu cầu tư vấn.</div>}
          </section>}

          {section === "accounts" && <section className="admin-panel admin-accounts" id="tai-khoan">
            <div className="panel-heading"><div><h2>Tài khoản người dùng</h2><p>Theo dõi khách đã đăng ký và khóa tạm thời khi phát hiện hoạt động bất thường.</p></div><span>{accounts.length} tài khoản</span></div>
            {!initialAccountList.ready ? <div className="admin-warning">Chưa thể kết nối dịch vụ xác thực để đọc danh sách tài khoản.</div> : <>
              {initialAccountList.truncated && <div className="admin-warning">Danh sách đang hiển thị 1.000 tài khoản mới nhất.</div>}
              <div className="admin-order-tabs admin-account-tabs" role="tablist" aria-label="Lọc tài khoản theo trạng thái">{(["all", "active", "disabled"] as const).map((status) => <button key={status} type="button" role="tab" aria-selected={accountStatusFilter === status} className={accountStatusFilter === status ? "active" : ""} onClick={() => setAccountStatusFilter(status)}><span>{status === "all" ? "Tất cả" : status === "active" ? "Đang hoạt động" : "Đã khóa"}</span><b>{accountStatusCounts[status]}</b></button>)}</div>
              {filteredAccounts.length ? <div className="admin-table"><div className="admin-account-tr admin-th"><span>Người dùng</span><span>Liên hệ</span><span>Ngày tạo</span><span>Đăng nhập gần nhất</span><span>Trạng thái</span><span></span></div>{filteredAccounts.map((account) => { const protectedAccount = account.isAdmin || account.id === adminUserId; const accountPending = pendingAction?.endsWith(account.id); return <div className="admin-account-tr" key={account.id}><span><strong>{account.fullName}</strong><small>{account.email || "Chưa có email"}</small></span><span>{account.phone || "Chưa cập nhật"}<small>{account.provider === "google" ? "Đăng nhập Google" : "Email và mật khẩu"}</small></span><time dateTime={account.createdAt}>{formatAdminDate(account.createdAt)}</time><time dateTime={account.lastSignInAt || undefined}>{account.lastSignInAt ? formatAdminDate(account.lastSignInAt) : "Chưa đăng nhập"}</time><em className={account.disabled ? "disabled" : "active"}>{account.isAdmin ? "Quản trị viên" : account.disabled ? "Đã khóa" : "Hoạt động"}</em><span className="admin-account-actions"><button type="button" className={!account.disabled ? "danger" : ""} disabled={protectedAccount || accountPending} onClick={() => { void toggleAccount(account); }}>{protectedAccount ? "Được bảo vệ" : pendingAction === `account:${account.id}` ? "Đang lưu..." : account.disabled ? "Mở khóa" : "Khóa"}</button>{!protectedAccount && <button type="button" className="delete" disabled={accountPending} onClick={() => { void deleteAccount(account); }}>{pendingAction === `delete-account:${account.id}` ? "Đang xóa..." : "Xóa"}</button>}</span></div>; })}</div> : <div className="admin-empty">Không có tài khoản phù hợp với bộ lọc.</div>}
            </>}
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

function AdminOverview({ overview, pendingOrders, pendingContacts, activeProducts, totalProducts, revenueToday, customers, newsletterSubscribers, onSection, onCreateProduct, onCreateShipping, onEditOrder }: {
  overview: ReturnType<typeof buildAdminOverview>;
  pendingOrders: number;
  pendingContacts: number;
  activeProducts: number;
  totalProducts: number;
  revenueToday: number;
  customers: number;
  newsletterSubscribers: number;
  onSection: (section: AdminSection) => void;
  onCreateProduct: () => void;
  onCreateShipping: () => void;
  onEditOrder: (order: AdminOrder) => void;
}) {
  const completedChecklist = overview.checklist.filter((item) => item.complete).length;
  const sevenDayRevenue = overview.revenueDays.reduce((total, day) => total + day.total, 0);
  return <div className="admin-overview">
    <section className="admin-overview-intro">
      <div><span>Tổng quan vận hành</span><h2>{pendingOrders + pendingContacts ? `${pendingOrders + pendingContacts} việc đang chờ bạn` : "Cửa hàng đang vận hành ổn định"}</h2><p>Theo dõi những việc quan trọng và xử lý ngay từ một màn hình.</p></div>
      <div className="admin-overview-actions"><button type="button" onClick={() => onSection("orders")}>Xử lý đơn</button><button type="button" onClick={() => onSection("contacts")}>Xem tư vấn</button><button type="button" onClick={onCreateProduct}>Thêm sản phẩm</button><button type="button" onClick={onCreateShipping}>Thêm tuyến giao</button></div>
    </section>

    <div className="admin-metrics admin-overview-metrics">
      <article><span>Đơn cần xử lý</span><strong>{pendingOrders}</strong><small>{pendingOrders ? "Cần kiểm tra trong hôm nay" : "Không có đơn đang chờ"}</small></article>
      <article><span>Doanh thu hôm nay</span><strong>{formatVnd(revenueToday)}</strong><small>Không tính đơn đã hủy</small></article>
      <article><span>Đơn đã giao</span><strong>{overview.deliveredOrders}</strong><small>Trong dữ liệu đơn hiện có</small></article>
      <article><span>Yêu cầu tư vấn mới</span><strong>{pendingContacts}</strong><small>{pendingContacts ? "Nên phản hồi sớm" : "Không có yêu cầu mới"}</small></article>
    </div>

    <div className="admin-overview-main">
      <section className="admin-overview-card admin-overview-orders">
        <header><div><h2>Đơn hàng gần đây</h2><p>Những đơn mới nhất cần theo dõi.</p></div><button type="button" onClick={() => onSection("orders")}>Xem tất cả</button></header>
        {overview.recentOrders.length ? <div className="admin-overview-order-list">{overview.recentOrders.map((order) => <button type="button" key={order.id} onClick={() => onEditOrder(order as AdminOrder)}><span><strong>{order.code}</strong><small>{order.buyerName} · {order.paymentMethod}</small></span><span><strong>{formatVnd(order.total)}</strong><small>{statusLabels[order.status as OrderStatus]}</small></span></button>)}</div> : <div className="admin-overview-empty"><strong>Chưa có đơn hàng</strong><p>Kiểm tra toàn bộ luồng đặt hoa bằng một đơn thử trước khi nhận khách thật.</p><Link href="/hoa" target="_blank">Tạo đơn thử tại cửa hàng</Link></div>}
      </section>

      <section className="admin-overview-card admin-overview-tasks">
        <header><div><h2>Việc cần làm</h2><p>Ưu tiên theo dữ liệu hiện tại.</p></div><span>{overview.tasks.length} việc</span></header>
        {overview.tasks.length ? <div className="admin-overview-task-list">{overview.tasks.map((task) => <button type="button" key={task.id} onClick={() => onSection(task.section)}><span><strong>{task.label}</strong><small>{task.detail}</small></span><b>Mở</b></button>)}</div> : <div className="admin-overview-clear"><strong>Không có việc gấp</strong><p>Bạn có thể tiếp tục hoàn thiện checklist vận hành bên dưới.</p></div>}
        <div className="admin-overview-checklist"><div><strong>Sẵn sàng vận hành</strong><span>{completedChecklist}/{overview.checklist.length} hoàn tất</span></div>{overview.checklist.map((item) => <div key={item.id}><span className={item.complete ? "complete" : ""}>{item.complete ? "Đã xong" : "Chưa xong"}</span><strong>{item.label}</strong>{item.id === "test-order" && !item.complete ? <Link href="/hoa" target="_blank">Kiểm tra</Link> : <button type="button" onClick={() => onSection(item.section)}>Mở</button>}</div>)}</div>
      </section>
    </div>

    <div className="admin-overview-bottom">
      <section className="admin-overview-card admin-revenue-card">
        <header><div><h2>Doanh thu 7 ngày</h2><p>Không tính các đơn đã hủy.</p></div><strong>{formatVnd(sevenDayRevenue)}</strong></header>
        <div className="admin-revenue-chart" aria-label="Biểu đồ doanh thu 7 ngày">{overview.revenueDays.map((day) => <div key={day.label}><div><span style={{ height: `${overview.revenueMax ? Math.max(6, Math.round(day.total / overview.revenueMax * 100)) : 4}%` }} aria-label={`${day.label}: ${formatVnd(day.total)}`} /></div><small>{day.label}</small></div>)}</div>
        {!sevenDayRevenue && <p className="admin-overview-muted">Chưa có doanh thu trong 7 ngày gần đây.</p>}
      </section>

      <section className="admin-overview-card admin-stock-card">
        <header><div><h2>Sản phẩm cần chú ý</h2><p>{activeProducts}/{totalProducts} sản phẩm đang bán.</p></div><button type="button" onClick={() => onSection("products")}>Quản lý</button></header>
        {overview.lowStockProducts.length ? <div className="admin-stock-list">{overview.lowStockProducts.map((product) => <div key={product.id}><span><strong>{product.name}</strong><small>{product.sku}</small></span><b>{product.stock} mẫu</b></div>)}</div> : <p className="admin-overview-healthy">Không có sản phẩm sắp hết hàng.</p>}
        <div className="admin-stock-summary"><span>Sản phẩm đang ẩn</span><strong>{overview.hiddenProducts}</strong></div>
      </section>

      <section className="admin-overview-card admin-contact-card">
        <header><div><h2>Tư vấn mới</h2><p>Lời nhắn mới nhất từ khách.</p></div><button type="button" onClick={() => onSection("contacts")}>Xem tất cả</button></header>
        {overview.recentContacts.length ? <div className="admin-overview-contact-list">{overview.recentContacts.map((contact) => <button type="button" key={contact.id} onClick={() => onSection("contacts")}><span><strong>{contact.name}</strong><small>{contact.occasion}</small></span><time dateTime={contact.createdAt}>{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(contact.createdAt))}</time></button>)}</div> : <p className="admin-overview-healthy">Chưa có yêu cầu tư vấn mới.</p>}
        <div className="admin-audience-summary"><span><b>{customers}</b> khách có tài khoản</span><span><b>{newsletterSubscribers}</b> người nhận tin</span></div>
      </section>
    </div>
  </div>;
}

function splitList(value: string) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function paymentOptions(method: "COD" | "MOMO") {
  return method === "COD"
    ? ["cod_pending", "collected", "rejected"] as const
    : ["pending", "payment_review", "paid", "rejected"] as const;
}

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}
