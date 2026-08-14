"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, type Product } from "../lib/catalog";
import { ProductCard } from "./product-card";

type Availability = "Tất cả" | "Có thể đặt hằng ngày" | "Cần đặt trước";

export function CatalogBrowser({ products, initialQuery = "", initialCategory = "Tất cả" }: { products: readonly Product[]; initialQuery?: string; initialCategory?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<(typeof categories)[number]>(categories.find((item) => item === initialCategory) ?? "Tất cả");
  const [availability, setAvailability] = useState<Availability>("Tất cả");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    const filtered = products.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.name, product.subtitle, product.description, ...product.flowers, ...product.occasions]
        .join(" ").toLocaleLowerCase("vi").includes(normalizedQuery);
      const needsAdvanceOrder = product.seasonal.toLocaleLowerCase("vi").includes("đặt trước");
      const matchesAvailability = availability === "Tất cả"
        || (availability === "Cần đặt trước" ? needsAdvanceOrder : !needsAdvanceOrder);
      return matchesQuery && (category === "Tất cả" || product.category === category) && matchesAvailability;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name, "vi");
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [products, query, category, availability, sort]);

  return (
    <div className="catalog-layout">
      <aside className={filtersOpen ? "catalog-filters filters-open" : "catalog-filters"}>
        <button className="filter-close" onClick={() => setFiltersOpen(false)}><X /> Đóng</button>
        <div className="filter-group"><h3>Loại thiết kế</h3>{categories.map((item) => <label key={item}><input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)} /><span>{item}</span></label>)}</div>
        <div className="filter-group"><h3>Khả năng đặt</h3>{(["Tất cả", "Có thể đặt hằng ngày", "Cần đặt trước"] as const).map((item) => <label key={item}><input type="radio" name="availability" checked={availability === item} onChange={() => setAvailability(item)} /><span>{item}</span></label>)}</div>
        <div className="shipping-note"><strong>Giao hoa toàn quốc</strong><p>Phí tạm tính từ 25.000đ, xác nhận lại theo tuyến và ngày giao.</p></div>
      </aside>
      <div className="catalog-main">
        <div className="catalog-tools">
          <button className="mobile-filter" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={18} /> Bộ lọc</button>
          <div className="catalog-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên hoa, màu sắc, loại hoa..." aria-label="Tìm sản phẩm" /></div>
          <span>{visible.length} thiết kế</span>
          <label>Sắp xếp<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Nổi bật</option><option value="price-asc">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option><option value="name">Tên A-Z</option></select></label>
        </div>
        {visible.length ? <div className="product-grid catalog-grid">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>Chưa tìm thấy bó hoa phù hợp</h2><p>Thử từ khóa khác hoặc bỏ bớt bộ lọc nhé.</p><button className="button button-outline" onClick={() => { setQuery(""); setCategory("Tất cả"); setAvailability("Tất cả"); }}>Xóa bộ lọc</button></div>}
      </div>
    </div>
  );
}
