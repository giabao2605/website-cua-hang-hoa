"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "../lib/catalog";
import { useCart } from "./cart-provider";

export function AddToCart({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem, ready } = useCart();
  return (
    <button
      className={compact ? "icon-button add-card-button" : "button button-primary"}
      type="button"
      disabled={!ready}
      onClick={() => addItem(product)}
      aria-label={`Thêm ${product.name} vào giỏ`}
    >
      <ShoppingBag size={18} aria-hidden="true" />
      {!compact && <span>Thêm vào giỏ</span>}
    </button>
  );
}
