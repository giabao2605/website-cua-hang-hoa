import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/safe-link";
import { ProductCard } from "../../components/product-card";
import { getCatalogProducts } from "../../lib/catalog-store";

export const metadata: Metadata = {
  title: "Hoa theo dịp tặng",
  description: "Chọn hoa theo sinh nhật, kỷ niệm, lời cảm ơn, chúc mừng và những khoảnh khắc quan trọng cùng Trâm Florist.",
};

const occasionGroups = [
  { title: "Mừng một cột mốc", note: "Sinh nhật, tốt nghiệp và những khởi đầu mới", occasions: ["Sinh nhật", "Chúc mừng", "Tốt nghiệp", "Khởi đầu mới", "Tân gia"] },
  { title: "Gửi lời thương", note: "Những điều dịu dàng đôi khi khó nói thành lời", occasions: ["Kỷ niệm", "Tặng người thương", "Hẹn hò", "Tỏ tình"] },
  { title: "Cảm ơn và đồng hành", note: "Một lời ghi nhận, hỏi thăm hay chuyến ghé thăm", occasions: ["Cảm ơn", "Ghé thăm", "Thăm hỏi"] },
  { title: "Ngày trọng đại", note: "Hoa cầm tay cho lễ cưới và những bức hình đáng nhớ", occasions: ["Lễ cưới", "Lễ gia tiên", "Lễ đính hôn", "Chụp ảnh cưới"] },
] as const;

export default async function OccasionPage({ searchParams }: { searchParams: Promise<{ occasion?: string }> }) {
  const params = await searchParams;
  const products = await getCatalogProducts();
  const availableOccasions = new Set(products.flatMap((product) => product.occasions));
  const selectedOccasion = params.occasion && availableOccasions.has(params.occasion) ? params.occasion : undefined;
  const visibleProducts = selectedOccasion ? products.filter((product) => product.occasions.includes(selectedOccasion)) : products;

  return (
    <>
      <section className="occasion-page-hero">
        <div className="container occasion-hero-layout">
          <div className="occasion-hero-copy"><span className="eyebrow">Chọn theo dịp tặng</span><p className="occasion-hero-number">Một lời nhắn được kết bằng hoa</p><h1>Chọn một khoảnh khắc,<br />Trâm chọn lời hoa.</h1><p>Mỗi dịp có một ngôn ngữ riêng. Hãy bắt đầu bằng điều bạn muốn nói, Trâm sẽ gợi ý những thiết kế phù hợp nhất.</p><Link className="button button-primary" href="#chon-dip">Bắt đầu chọn dịp</Link></div>
          <div className="occasion-hero-collage" aria-label="Gợi ý hoa cho những khoảnh khắc đáng nhớ"><figure className="occasion-hero-main"><Image src="/products/hen-nhau-mua-hong.webp" alt="Bó hoa tông hồng cho ngày kỷ niệm" fill priority sizes="(max-width: 760px) 72vw, 34vw" /></figure><figure className="occasion-hero-secondary"><Image src="/products/nang-goi-niem-vui.webp" alt="Bó hoa tông vàng cho ngày sinh nhật" fill sizes="(max-width: 760px) 42vw, 18vw" /></figure><span>Trao đúng cảm xúc<br />vào đúng ngày</span></div>
        </div>
      </section>

      <section className="section occasion-picker" id="chon-dip" aria-labelledby="occasion-picker-title">
        <div className="container">
          <header className="occasion-picker-heading"><span className="eyebrow">Bắt đầu từ điều muốn nói</span><h2 id="occasion-picker-title">Bạn đang chọn hoa cho dịp nào</h2><p>Chọn một nhóm cảm xúc rồi đi đến dịp cụ thể. Mỗi lựa chọn đều là một đường dẫn riêng để bạn có thể lưu lại hoặc gửi cho người cùng chọn.</p></header>
          <div className="occasion-group-grid">
            {occasionGroups.map((group, index) => {
              const groupOccasions = group.occasions.filter((occasion) => availableOccasions.has(occasion));
              if (!groupOccasions.length) return null;
              return <article className="occasion-group-card" key={group.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{group.title}</h3><p>{group.note}</p><div>{groupOccasions.map((occasion) => <Link key={occasion} href={`/dip-tang?occasion=${encodeURIComponent(occasion)}#goi-y`} aria-current={selectedOccasion === occasion ? "page" : undefined}>{occasion}<small>{products.filter((product) => product.occasions.includes(occasion)).length} mẫu</small></Link>)}</div></article>;
            })}
          </div>
        </div>
      </section>

      <section className="occasion-guide"><div className="container occasion-guide-layout"><header><span className="eyebrow eyebrow-light">Nếu bạn chưa biết chọn gì</span><h2>Ba điều giúp một bó hoa trở nên đúng ý</h2></header><ol><li><span>01</span><div><strong>Người nhận là ai</strong><p>Mối quan hệ giúp Trâm chọn độ trang trọng phù hợp.</p></div></li><li><span>02</span><div><strong>Bạn muốn nói điều gì</strong><p>Lời chúc quyết định sắc độ và tinh thần của bó hoa.</p></div></li><li><span>03</span><div><strong>Hoa sẽ được trao khi nào</strong><p>Ngày giao giúp Trâm kiểm tra hoa đang đẹp và chuẩn bị đúng lúc.</p></div></li></ol></div></section>

      <section className="section occasion-results" id="goi-y">
        <div className="container">
          <div className="occasion-results-heading"><div><span className="eyebrow">Gợi ý từ Trâm</span><h2>{selectedOccasion ? `Hoa cho dịp ${selectedOccasion.toLocaleLowerCase("vi")}` : "Những lời hoa dành cho bạn"}</h2><p>{selectedOccasion ? `${visibleProducts.length} thiết kế phù hợp với dịp bạn vừa chọn.` : "Chọn một dịp phía trên để thu hẹp gợi ý, hoặc xem toàn bộ thiết kế hiện có."}</p></div>{selectedOccasion && <Link className="text-link" href="/dip-tang#goi-y">Xem tất cả dịp</Link>}</div>
          <div className="product-grid occasion-product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>
    </>
  );
}
