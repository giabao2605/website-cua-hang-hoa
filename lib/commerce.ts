export type ShippingRule = Readonly<{
  id: string;
  kind: "locality" | "province" | "region" | "nationwide";
  value: string;
  fee: number;
  priority: number;
  active: boolean;
}>;

export type DeliveryAddress = Readonly<{
  locality: string;
  province: string;
  region: string;
}>;

export type CartLine = Readonly<{
  id: string;
  unitPrice: number;
  quantity: number;
}>;

export type Discount = Readonly<{
  percentBasisPoints: number;
  maxDiscount: number;
}>;

export function formatVnd(value: number): string {
  assertVnd(value);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalizeVietnamPhone(value: string): string {
  const compact = value.replace(/[\s().-]/g, "");
  const normalized = compact.startsWith("+84")
    ? `0${compact.slice(3)}`
    : compact;

  if (!/^0(?:3|5|7|8|9)\d{8}$/.test(normalized)) {
    throw new Error("Số điện thoại Việt Nam không hợp lệ.");
  }
  return normalized;
}

export function selectShippingRule(
  rules: readonly ShippingRule[],
  address: DeliveryAddress,
): ShippingRule {
  if (!address.province.trim()) {
    throw new Error("Vui lòng chọn tỉnh/thành phố giao hoa.");
  }

  const matches = rules.filter((rule) => {
    if (!rule.active) return false;
    if (rule.kind === "nationwide") return true;
    if (rule.kind === "locality") return sameText(rule.value, address.locality);
    if (rule.kind === "province") return sameText(rule.value, address.province);
    return sameText(rule.value, address.region);
  });

  const selected = [...matches].sort(
    (left, right) => right.priority - left.priority || left.id.localeCompare(right.id),
  )[0];
  if (!selected) throw new Error("Chưa có tuyến giao phù hợp cho địa chỉ này.");
  assertVnd(selected.fee);
  return selected;
}

export function calculateCart(
  items: readonly CartLine[],
  discount: Discount | null,
  shipping: number,
) {
  assertVnd(shipping);
  if (items.length === 0) throw new Error("Giỏ hàng đang trống.");

  const subtotal = items.reduce((sum, item) => {
    assertVnd(item.unitPrice);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error("Số lượng sản phẩm phải từ 1 đến 99.");
    }
    const lineTotal = item.unitPrice * item.quantity;
    assertVnd(lineTotal);
    const next = sum + lineTotal;
    assertVnd(next);
    return next;
  }, 0);

  const discountValue = discount
    ? Math.min(
        Math.floor((subtotal * discount.percentBasisPoints) / 10_000),
        discount.maxDiscount,
      )
    : 0;
  assertVnd(discountValue);
  const total = Math.max(0, subtotal - discountValue + shipping);
  assertVnd(total);

  return {
    subtotal,
    discount: discountValue,
    shipping,
    total,
  };
}

function sameText(left: string, right: string) {
  return left.trim().localeCompare(right.trim(), "vi", { sensitivity: "base" }) === 0;
}

function assertVnd(value: number) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Giá trị tiền VND phải là số nguyên không âm hợp lệ.");
  }
}
