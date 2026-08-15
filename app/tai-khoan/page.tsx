import Image from "next/image";
import Link from "@/components/safe-link";
import { AccountProfileCard } from "../../components/account-profile-card";
import { AuthPanel } from "../../components/auth-panel";
import { ReorderButton } from "../../components/reorder-button";
import { hasAdminAccess } from "../../lib/admin-access";
import { getCatalogProducts } from "../../lib/catalog-store";
import { formatVnd } from "../../lib/commerce";
import { getCustomerProfile, type CustomerIdentity } from "../../lib/customer-profile";
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

  const email = user.email ?? "";
  const identity: CustomerIdentity = {
    authUserId: user.id,
    email,
    fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
  };
  const verified = Boolean(email && user.email_confirmed_at);
  const [products, profile, orders] = await Promise.all([
    getCatalogProducts(),
    verified ? getCustomerProfile(identity) : Promise.resolve({ fullName: identity.fullName ?? email, email, phone: "", address: "" }),
    verified ? listOrdersForCustomer(identity) : Promise.resolve([]),
  ]);
  const productById = new Map(products.map((product) => [product.id, product]));

  return <section className="section account-page">
    <div className="container account-dashboard">
      <header className="account-hero">
        <div><span className="eyebrow">Tài khoản của bạn</span><h1>Xin chào, {profile.fullName}</h1><p>{verified ? `Email đã xác nhận: ${email}` : "Email chưa được xác nhận."}</p></div>
        <form action="/api/auth/signout" method="post"><button className="button button-danger">Đăng xuất</button></form>
      </header>

      <div className="account-main-grid">
        <AccountProfileCard initialProfile={profile} />
        <section className="account-shortcuts" aria-labelledby="account-shortcuts-title">
          <header><span>Đi nhanh</span><h2 id="account-shortcuts-title">Bạn muốn làm gì?</h2></header>
          <div><Link href="/hoa"><strong>Chọn hoa mới</strong><span>Khám phá hoa đang vào mùa</span></Link><Link href="/tra-cuu-don"><strong>Tra cứu đơn đã đặt</strong><span>Dùng mã đơn và số điện thoại nhận</span></Link>{hasAdminAccess(user) && <Link href="/admin"><strong>Khu quản trị</strong><span>Quản lý vận hành cửa hàng</span></Link>}</div>
        </section>
      </div>

      <section className="account-orders">
        <div className="section-heading"><span className="eyebrow">Lịch sử mua hoa</span><h2>Đơn hàng của tôi</h2></div>
        {orders.length ? <div className="account-order-list">{orders.map((order) => {
          const reorderLines = order.items.flatMap((item) => {
            const product = productById.get(item.productId);
            return product && product.stock > 0 ? [{ product, quantity: item.quantity }] : [];
          });
          return <article className="account-order-card" key={order.code}>
            <div className="account-order-image"><Image src={order.items[0]?.image ?? "/products/vuon-trong-nang.webp"} alt="" width={116} height={138} /></div>
            <div className="account-order-copy"><span>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(order.createdAt))}</span><h3>{order.code}</h3><p>Giao cho <strong>{order.recipientName}</strong> tại {order.locality}, {order.province}</p><ul>{order.items.map((item) => <li key={`${order.code}-${item.productId}`}>{item.quantity} × {item.name}</li>)}</ul></div>
            <div className="account-order-summary"><strong>{formatVnd(order.total)}</strong><span>{statusLabels[order.status] ?? order.status}</span><div><Link className="button button-outline" href={`/tra-cuu-don?code=${encodeURIComponent(order.code)}`}>Xem chi tiết</Link>{order.status === "delivered" && <ReorderButton lines={reorderLines} />}</div></div>
          </article>;
        })}</div> : <div className="account-orders-empty"><strong>Bạn chưa có đơn hàng trong tài khoản</strong><p>Đơn đặt bằng đúng email đã xác nhận sẽ tự xuất hiện tại đây. Nếu đã dùng email khác, bạn vẫn có thể tra cứu bằng mã đơn và số điện thoại người nhận.</p><div><Link className="button button-primary" href="/hoa">Chọn hoa ngay</Link><Link className="button button-outline" href="/tra-cuu-don">Tra cứu đơn đã đặt</Link></div></div>}
      </section>
    </div>
  </section>;
}
