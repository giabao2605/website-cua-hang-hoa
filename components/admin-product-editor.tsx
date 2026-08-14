"use client";

import Image from "next/image";
import type { FormEventHandler } from "react";
import type { AdminProduct } from "../lib/admin-store";
import { formatVnd } from "../lib/commerce";

export function AdminProductEditor({
  product,
  existing,
  pending,
  onChange,
  onClose,
  onSubmit,
  onUpload,
}: {
  product: AdminProduct;
  existing: boolean;
  pending: boolean;
  onChange: (product: AdminProduct) => void;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUpload: (file: File) => void;
}) {
  const previewImage = /^\/(?:products|media)\/[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp)$/i.test(product.image)
    ? product.image
    : "/products/vuon-trong-nang.webp";
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-editor-title">
      <form className="admin-editor admin-product-editor" onSubmit={onSubmit}>
        <header>
          <div><span>{existing ? "Chỉnh sửa sản phẩm" : "Sản phẩm mới"}</span><h2 id="product-editor-title">{product.name}</h2></div>
          <button type="button" onClick={onClose}>Đóng</button>
        </header>
        <div className="product-editor-layout">
          <aside className="product-editor-preview">
            <div className="product-editor-image"><Image src={previewImage} alt={`Xem trước ${product.name}`} width={560} height={700} /></div>
            <span>Xem trước trên cửa hàng</span>
            <h3>{product.name}</h3>
            <p>{product.subtitle}</p>
            <strong>{formatVnd(product.price)}</strong>
            <small>{product.active ? "Đang hiển thị để bán" : "Đang ẩn khỏi cửa hàng"}</small>
          </aside>
          <div className="product-editor-sections">
            <fieldset>
              <legend>1. Thông tin cơ bản</legend>
              <div className="admin-editor-grid">
                <label>Mã nội bộ<input name="id" defaultValue={product.id} readOnly={existing} required /></label>
                <label>SKU<input name="sku" defaultValue={product.sku} required /></label>
                <label>Slug đường dẫn<input name="slug" defaultValue={product.slug} required /></label>
                <label>Tên sản phẩm<input name="name" value={product.name} onChange={(event) => onChange({ ...product, name: event.target.value })} required /></label>
                <label className="field-wide">Mô tả ngắn<input name="subtitle" value={product.subtitle} onChange={(event) => onChange({ ...product, subtitle: event.target.value })} required /></label>
                <label className="field-wide">Mô tả chi tiết<textarea name="description" defaultValue={product.description} rows={4} required /></label>
                <label>Loại<select name="category" defaultValue={product.category}><option>Bó hoa</option><option>Giỏ hoa</option><option>Hoa cưới</option><option>Hoa sự kiện</option></select></label>
                <label>Mùa hoa<input name="seasonal" defaultValue={product.seasonal} required /></label>
              </div>
            </fieldset>
            <fieldset>
              <legend>2. Giá và tồn kho</legend>
              <div className="admin-editor-grid three-columns">
                <label>Giá bán<input name="price" type="number" min="0" step="1000" value={product.price} onChange={(event) => onChange({ ...product, price: Number(event.target.value) })} required /></label>
                <label>Giá so sánh<input name="compareAtPrice" type="number" min="0" step="1000" defaultValue={product.compareAtPrice} /></label>
                <label>Tồn kho<input name="stock" type="number" min="0" step="1" defaultValue={product.stock} required /></label>
              </div>
            </fieldset>
            <fieldset>
              <legend>3. Hoa và dịp tặng</legend>
              <div className="admin-editor-grid">
                <label>Bảng màu<input name="palette" defaultValue={product.palette} required /></label>
                <label>Nhãn hiển thị<input name="badge" defaultValue={product.badge} placeholder="Ví dụ: Bán chạy" /></label>
                <label className="field-wide">Dịp tặng, cách nhau bằng dấu phẩy<input name="occasions" defaultValue={product.occasions.join(", ")} required /></label>
                <label className="field-wide">Các loại hoa, cách nhau bằng dấu phẩy<input name="flowers" defaultValue={product.flowers.join(", ")} required /></label>
              </div>
            </fieldset>
            <fieldset>
              <legend>4. Hình ảnh</legend>
              <div className="admin-editor-grid">
                <label className="field-wide">Đường dẫn ảnh chính<input name="image" value={product.image} onChange={(event) => onChange({ ...product, image: event.target.value })} required /><small>Dùng ảnh trong /products hoặc ảnh đã tải lên /media.</small></label>
                <label className="field-wide">Thư viện ảnh, cách nhau bằng dấu phẩy<input name="gallery" value={product.gallery.join(", ")} onChange={(event) => onChange({ ...product, gallery: splitList(event.target.value) })} required /></label>
                <label className="file-field field-wide">Tải ảnh mới, tối đa 5 MB<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); }} /></label>
              </div>
            </fieldset>
            <fieldset>
              <legend>5. Hiển thị</legend>
              <div className="product-editor-toggles">
                <label className="checkbox-line"><input name="active" type="checkbox" checked={product.active} onChange={(event) => onChange({ ...product, active: event.target.checked })} /> Hiển thị để bán</label>
                <label className="checkbox-line"><input name="featured" type="checkbox" checked={product.featured} onChange={(event) => onChange({ ...product, featured: event.target.checked })} /> Đưa lên trang chủ</label>
              </div>
            </fieldset>
          </div>
        </div>
        <footer><button className="button button-outline" type="button" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={pending}>{pending ? "Đang lưu..." : "Lưu sản phẩm"}</button></footer>
      </form>
    </div>
  );
}

function splitList(value: string) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}
