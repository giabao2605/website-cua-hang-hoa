import Link from "@/components/safe-link";
import { AuthPanel } from "../../components/auth-panel";
import { formatVnd } from "../../lib/commerce";
import { listOrdersForCustomer } from "../../lib/order-store";
import { getCurrentAuthUser } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

const statusLabels: Readonly<Record<string, string>> = {
  pending_confirmation: "Chờ shop xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang kết hoa",
  delivering: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ mode?: string; error?: string }> }) {
  const params = await searchParams;
  const resetMode = params.mode === "reset";
  const user = await getCurrentAuthUser();
  if (!user || resetMode) {
    return <section className="auth-page"><div className="auth-visual"><div><span className="eyebrow eyebrow-light">Không gian riêng của bạn</span><h2>Theo dõi từng hành trình hoa.</h2><p>Lưu địa chỉ nhận, xem lịch sử đơn và nhận những bộ sưu tập theo mùa sớm nhất.</p></div></div><AuthPanel initialMode={resetMode ? "reset" : "login"} initialError={params.error === "auth" ? "Không thể hoàn tất đăng nhập. Vui lòng thử lại." : ""} /></section>;
  }
  const orders = user.email ? await listOrdersForCustomer({
    authUserId: user.id,
    email: user.email,
    fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
  }) : [];
  return (
    <section className="section account-page">
      <div className="container">
        <span className="eyebrow">Tài khoản của bạn</span>
        <h1>Xin chào, {user.user_metadata.full_name ?? user.email}</h1>
        <p>Email đã xác nhận: {user.email}</p>
        <div className="account-cards"><Link href="/hoa"><strong>Chọn hoa mới</strong><span>Khám phá hoa đang vào mùa</span></Link><Link href="/tra-cuu-don"><strong>Tra cứu bằng mã đơn</strong><span>Dùng mã đơn và số điện thoại nhận</span></Link><Link href="/admin"><strong>Khu quản trị</strong><span>Chỉ dành cho email được cấp quyền</span></Link></div>
        <section className="account-orders">
          <div className="section-heading"><span className="eyebrow">Lịch sử mua hoa</span><h2>Đơn hàng của tôi</h2></div>
          {orders.length ? <div className="account-order-list">{orders.map((order) => <article key={order.code}><div><span>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(order.createdAt))}</span><h3>{order.code}</h3><p>Giao cho {order.recipientName} tại {order.locality}, {order.province}</p></div><div><strong>{formatVnd(order.total)}</strong><span>{statusLabels[order.status] ?? order.status}</span></div><ul>{order.items.map((item) => <li key={`${order.code}-${item.name}`}>{item.quantity} × {item.name}</li>)}</ul></article>)}</div> : <div className="admin-empty">Bạn chưa có đơn nào gắn với email này.</div>}
        </section>
        <form action="/api/auth/signout" method="post"><button className="button button-outline">Đăng xuất</button></form>
      </div>
    </section>
  );
}
