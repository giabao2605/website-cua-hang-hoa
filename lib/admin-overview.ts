import type { SiteSettings } from "./site.ts";

type OverviewOrder = Readonly<{
  id: string;
  code: string;
  buyerName: string;
  paymentMethod: "COD" | "MOMO";
  paymentStatus: string;
  status: string;
  archived?: boolean;
  total: number;
  createdAt: string;
}>;

type OverviewProduct = Readonly<{
  id: string;
  name: string;
  sku: string;
  stock: number;
  active: boolean;
}>;

type OverviewContact = Readonly<{
  id: string;
  name: string;
  occasion: string;
  status: string;
  createdAt: string;
}>;

type OverviewSection = "orders" | "contacts" | "products";

export function buildAdminOverview({ orders, products, contacts, shippingRules, settings, now = new Date() }: {
  orders: readonly OverviewOrder[];
  products: readonly OverviewProduct[];
  contacts: readonly OverviewContact[];
  shippingRules: readonly Readonly<{ active: boolean }>[];
  settings: SiteSettings;
  now?: Date;
}) {
  const operationalOrders = orders.filter((order) => !order.archived);
  const recentOrders = [...operationalOrders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5);
  const recentContacts = [...contacts].filter((contact) => contact.status === "new").sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3);
  const lowStockProducts = products.filter((product) => product.active && product.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 4);
  const pendingOrders = operationalOrders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
  const paymentReviews = operationalOrders.filter((order) => order.paymentStatus === "payment_review").length;
  const tasks = [
    pendingOrders ? { id: "orders", label: "Xử lý đơn hàng", detail: `${pendingOrders} đơn đang chờ xử lý`, section: "orders" as OverviewSection } : null,
    paymentReviews ? { id: "payments", label: "Đối soát MoMo", detail: `${paymentReviews} giao dịch cần kiểm tra`, section: "orders" as OverviewSection } : null,
    recentContacts.length ? { id: "contacts", label: "Phản hồi tư vấn", detail: `${recentContacts.length} yêu cầu mới chưa liên hệ`, section: "contacts" as OverviewSection } : null,
    lowStockProducts.length ? { id: "stock", label: "Kiểm tra tồn kho", detail: `${lowStockProducts.length} sản phẩm còn tối đa 5 mẫu`, section: "products" as OverviewSection } : null,
  ].filter((task): task is NonNullable<typeof task> => task !== null);
  const revenueDays = lastSevenDays(now).map(({ start, end, label }) => ({
    label,
    total: orders.filter((order) => order.status !== "cancelled" && Date.parse(order.createdAt) >= start && Date.parse(order.createdAt) < end).reduce((sum, order) => sum + order.total, 0),
  }));

  return {
    recentOrders,
    recentContacts,
    lowStockProducts,
    hiddenProducts: products.filter((product) => !product.active).length,
    deliveredOrders: orders.filter((order) => order.status === "delivered").length,
    tasks,
    revenueDays,
    revenueMax: Math.max(0, ...revenueDays.map((day) => day.total)),
    checklist: [
      { id: "products", label: "Có sản phẩm đang bán", complete: products.some((product) => product.active), section: "products" as const },
      { id: "shipping", label: "Có tuyến giao đang hoạt động", complete: shippingRules.some((rule) => rule.active), section: "shipping" as const },
      { id: "payment", label: "Thông tin thanh toán đã sẵn sàng", complete: (settings.codEnabled || settings.momoEnabled) && (!settings.momoEnabled || (!/chờ|xác nhận|placeholder/i.test(settings.momoOwner) && Boolean(settings.momoQrImage))), section: "settings" as const },
      { id: "test-order", label: "Đã kiểm tra luồng đặt hoa", complete: orders.length > 0, section: "orders" as const },
    ],
  };
}

function lastSevenDays(now: Date) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      start: date.getTime(),
      end: next.getTime(),
      label: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
    };
  });
}
