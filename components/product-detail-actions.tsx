"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Product } from "../lib/catalog";
import { useCart } from "./cart-provider";

export function ProductDetailActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, ready } = useCart();
  return (
    <div className="product-actions">
      <div className="quantity-control"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Giảm số lượng"><Minus /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Tăng số lượng"><Plus /></button></div>
      <button className="button button-primary product-add" type="button" disabled={!ready} onClick={() => addItem(product, quantity)}><ShoppingBag size={18} /> Thêm vào giỏ</button>
    </div>
  );
}
