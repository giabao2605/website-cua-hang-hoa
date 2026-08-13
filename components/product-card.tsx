import Image from "next/image";
import Link from "@/components/safe-link";
import { Heart } from "lucide-react";
import type { Product } from "../lib/catalog";
import { formatVnd } from "../lib/commerce";
import { AddToCart } from "./add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link className="product-image" href={`/hoa/${product.slug}`}>
        <Image src={product.image} alt={`${product.name} - ${product.subtitle}`} fill sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 25vw" />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className="wishlist-button" type="button" aria-label={`Lưu ${product.name}`}><Heart size={18} /></button>
      </Link>
      <div className="product-info">
        <div><Link href={`/hoa/${product.slug}`}><h3>{product.name}</h3></Link><p>{product.subtitle}</p></div>
        <div className="product-buy"><span>{formatVnd(product.price)}{product.compareAtPrice && <del>{formatVnd(product.compareAtPrice)}</del>}</span><AddToCart product={product} compact /></div>
      </div>
    </article>
  );
}
