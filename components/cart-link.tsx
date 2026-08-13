"use client";

import Link from "@/components/safe-link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link className="header-action cart-action" href="/gio-hang" aria-label={`Giỏ hàng, ${count} sản phẩm`}>
      <ShoppingBag size={21} aria-hidden="true" />
      <span>Giỏ hàng</span>
      {count > 0 && <b>{count}</b>}
    </Link>
  );
}
