import type { Metadata } from "next";
import Link from "@/components/safe-link";
import { AdminShell } from "../../components/admin-shell";
import { listAdminAccounts } from "../../lib/admin-accounts";
import { requireAdmin } from "../../lib/admin";
import { getAdminDashboard } from "../../lib/admin-store";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản trị cửa hàng" };
export default async function Page() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    const title = admin.reason === "unauthenticated"
      ? "Bạn cần đăng nhập"
      : admin.reason === "unverified"
        ? "Email chưa được xác nhận"
        : "Tài khoản chưa có quyền quản trị";
    return <section className="section admin-access-page"><div className="container"><div className="empty-cart-hero"><div className="empty-cart-copy"><span className="eyebrow">Trâm Florist Admin</span><h1>{title}</h1><p>Khu vực này được bảo vệ ở phía máy chủ. Quyền admin chỉ được cấp cho email đã xác nhận và nằm trong danh sách cấu hình an toàn.</p><div className="admin-access-actions"><Link className="button button-primary" href="/tai-khoan">Đi tới đăng nhập</Link><Link className="button button-outline" href="/">Về cửa hàng</Link></div></div></div></div></section>;
  }
  const [dashboard, accountList] = await Promise.all([getAdminDashboard(), listAdminAccounts()]);
  return <AdminShell email={admin.user.email ?? "Admin"} adminUserId={admin.user.id} initialDashboard={dashboard} initialAccountList={accountList} />;
}
