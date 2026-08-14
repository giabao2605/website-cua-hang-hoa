"use client";

import type { Product } from "../lib/catalog";
import { useCart } from "./cart-provider";

export function ReorderButton({ lines }: { lines: readonly { product: Product; quantity: number }[] }) {
  const { addItems, ready } = useCart();
  if (!lines.length) return <button className="button button-outline" type="button" disabled>Sản phẩm không còn bán</button>;
  return <button className="button button-primary" type="button" disabled={!ready} onClick={() => {
    addItems(lines.map(({ product, quantity }) => ({ product, quantity: Math.min(quantity, product.stock) })));
    window.location.assign("/gio-hang");
  }}>Đặt lại đơn</button>;
}
