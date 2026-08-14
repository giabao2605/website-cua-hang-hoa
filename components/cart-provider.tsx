"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../lib/catalog";

export type CartItem = Readonly<{
  productId: string;
  slug: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
}>;

type CartContextValue = {
  items: readonly CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  addItem: (product: Product, quantity?: number) => void;
  addItems: (lines: readonly { product: Product; quantity: number }[]) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  notice: string;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tram-florist-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<readonly CartItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [notice, setNotice] = useState("");
  const storageReadyRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (storageReadyRef.current) return;
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        setItems(stored ? JSON.parse(stored) as CartItem[] : []);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        setItems([]);
      }
      storageReadyRef.current = true;
      setStorageReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (storageReady) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, storageReady]);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const addToItems = (current: readonly CartItem[]) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          sku: product.sku,
          image: product.image,
          price: product.price,
          quantity: Math.min(99, Math.max(1, quantity)),
        },
      ];
    };
    if (storageReadyRef.current) {
      setItems(addToItems);
    } else {
      let stored: readonly CartItem[] = [];
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        stored = raw ? JSON.parse(raw) as CartItem[] : [];
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      storageReadyRef.current = true;
      setStorageReady(true);
      setItems(addToItems(stored));
    }
    showNotice(`${product.name} đã được thêm vào giỏ.`);
  }, [showNotice]);

  const addItems = useCallback((lines: readonly { product: Product; quantity: number }[]) => {
    let stored: readonly CartItem[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) as CartItem[] : [];
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    const next = lines.reduce<readonly CartItem[]>((current, { product, quantity }) => {
      const safeQuantity = Math.max(1, Math.min(99, product.stock, quantity));
      const existing = current.find((item) => item.productId === product.id);
      return existing
        ? current.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(99, product.stock, item.quantity + safeQuantity) } : item)
        : [...current, { productId: product.id, slug: product.slug, name: product.name, sku: product.sku, image: product.image, price: product.price, quantity: safeQuantity }];
    }, stored);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    storageReadyRef.current = true;
    setStorageReady(true);
    setItems(next);
    showNotice("Các sản phẩm còn bán đã được thêm vào giỏ.");
  }, [showNotice]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.productId !== productId));
      return;
    }
    setItems((current) => current.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.min(99, quantity) } : item,
    ));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    ready: storageReady,
    addItem,
    addItems,
    updateQuantity,
    removeItem,
    clear,
    notice,
  }), [items, storageReady, addItem, addItems, updateQuantity, removeItem, clear, notice]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className={`toast ${notice ? "toast-visible" : ""}`} role="status" aria-live="polite">
        {notice}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
