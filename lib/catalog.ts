export type Product = Readonly<{
  id: string;
  slug: string;
  sku: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  gallery: readonly string[];
  category: "Bó hoa" | "Giỏ hoa" | "Hoa cưới" | "Hoa sự kiện";
  occasions: readonly string[];
  flowers: readonly string[];
  palette: string;
  seasonal: string;
  stock: number;
  featured?: boolean;
  badge?: string;
}>;

export const products: readonly Product[] = [
  {
    id: "amour-bleu",
    slug: "amour-bleu",
    sku: "TF-BQ-001",
    name: "Amour Bleu",
    subtitle: "Cẩm tú cầu xanh và hồng garden",
    description: "Bó hoa chủ đạo xanh sương, điểm hồng phấn và trắng kem. Một thiết kế dịu dàng nhưng có chiều sâu cho sinh nhật, kỷ niệm và lời cảm ơn trang trọng.",
    price: 890_000,
    compareAtPrice: 990_000,
    image: "/products/amour-bleu.png",
    gallery: ["/products/amour-bleu.png", "/products/pastel-poetry.png", "/products/blue-sonata.png"],
    category: "Bó hoa",
    occasions: ["Sinh nhật", "Kỷ niệm", "Cảm ơn"],
    flowers: ["Cẩm tú cầu", "Hồng garden", "Cát tường"],
    palette: "Xanh - hồng",
    seasonal: "Quanh năm, thay hoa tương đương theo mùa",
    stock: 12,
    featured: true,
    badge: "Bán chạy",
  },
  {
    id: "pastel-poetry",
    slug: "pastel-poetry",
    sku: "TF-BQ-002",
    name: "Pastel Poetry",
    subtitle: "Hoa theo mùa sắc pastel",
    description: "Một bản phối nhiều tầng giữa hồng phấn, kem đào, tím lilac và xanh nhạt, được gói thủ công bằng giấy mỹ thuật nhập khẩu.",
    price: 790_000,
    image: "/products/pastel-poetry.png",
    gallery: ["/products/pastel-poetry.png", "/products/amour-bleu.png", "/products/romance-deep.png"],
    category: "Bó hoa",
    occasions: ["Sinh nhật", "Chúc mừng", "Tặng người thương"],
    flowers: ["Hồng", "Cẩm chướng", "Lan", "Cát tường"],
    palette: "Pastel",
    seasonal: "Xuân - Hè",
    stock: 9,
    featured: true,
    badge: "Theo mùa",
  },
  {
    id: "morning-mist",
    slug: "morning-mist",
    sku: "TF-BQ-003",
    name: "Morning Mist",
    subtitle: "Cẩm tú cầu và cát tường tinh khôi",
    description: "Thiết kế thoáng, tự nhiên với sắc xanh dịu và nhịp hoa trắng thanh lịch, phù hợp tặng đồng nghiệp hoặc trang trí bàn tiệc.",
    price: 690_000,
    image: "/products/morning-mist.png",
    gallery: ["/products/morning-mist.png", "/products/blue-sonata.png", "/products/pastel-poetry.png"],
    category: "Bó hoa",
    occasions: ["Cảm ơn", "Chúc mừng", "Khai trương"],
    flowers: ["Cẩm tú cầu", "Cát tường", "Bạch đàn"],
    palette: "Xanh - trắng",
    seasonal: "Hè - Thu",
    stock: 8,
    featured: true,
  },
  {
    id: "garden-whisper",
    slug: "garden-whisper",
    sku: "TF-BQ-004",
    name: "Garden Whisper",
    subtitle: "Hồng garden và thanh liễu",
    description: "Bó hoa lãng mạn lấy cảm hứng từ vườn hoa sớm mai, cân bằng giữa những nụ hồng mềm và cành lá mảnh.",
    price: 590_000,
    image: "/products/garden-whisper.png",
    gallery: ["/products/garden-whisper.png", "/products/pastel-poetry.png", "/products/romance-deep.png"],
    category: "Bó hoa",
    occasions: ["Hẹn hò", "Sinh nhật", "Xin lỗi"],
    flowers: ["Hồng garden", "Thanh liễu", "Cẩm chướng"],
    palette: "Hồng - tím",
    seasonal: "Quanh năm",
    stock: 16,
    badge: "Mới",
  },
  {
    id: "spring-lullaby",
    slug: "spring-lullaby",
    sku: "TF-BQ-005",
    name: "Spring Lullaby",
    subtitle: "Tulip và lily vàng hồng",
    description: "Tulip vàng tươi kết hợp lily hồng mềm mại tạo nên một món quà rạng rỡ, giàu năng lượng nhưng vẫn nữ tính.",
    price: 750_000,
    image: "/products/spring-lullaby.png",
    gallery: ["/products/spring-lullaby.png", "/products/sunlit-joy.png", "/products/morning-mist.png"],
    category: "Bó hoa",
    occasions: ["Sinh nhật", "Chúc mừng", "Tân gia"],
    flowers: ["Tulip", "Lily"],
    palette: "Vàng - hồng",
    seasonal: "Xuân",
    stock: 6,
    badge: "Giới hạn",
  },
  {
    id: "blue-sonata",
    slug: "blue-sonata",
    sku: "TF-GH-006",
    name: "Blue Sonata",
    subtitle: "Giỏ cẩm tú cầu xanh thanh lịch",
    description: "Giỏ hoa bàn với những khối cẩm tú cầu xanh đầy đặn, xen cúc kem và lá bạc, dành cho không gian tiếp khách sang trọng.",
    price: 1_090_000,
    image: "/products/blue-sonata.png",
    gallery: ["/products/blue-sonata.png", "/products/amour-bleu.png", "/products/morning-mist.png"],
    category: "Giỏ hoa",
    occasions: ["Kỷ niệm", "Khai trương", "Tân gia"],
    flowers: ["Cẩm tú cầu", "Cúc mẫu đơn", "Hồng"],
    palette: "Xanh - kem",
    seasonal: "Hè - Thu",
    stock: 5,
    featured: true,
    badge: "Cao cấp",
  },
  {
    id: "romance-deep",
    slug: "romance-deep",
    sku: "TF-BQ-007",
    name: "Deep Romance",
    subtitle: "Hồng đỏ nghệ thuật",
    description: "Hồng đỏ và vàng champagne trong lớp gói tối màu, một lựa chọn giàu cảm xúc cho ngày kỷ niệm và lời tỏ tình.",
    price: 820_000,
    image: "/products/romance-deep.png",
    gallery: ["/products/romance-deep.png", "/products/garden-whisper.png", "/products/amour-bleu.png"],
    category: "Bó hoa",
    occasions: ["Tỏ tình", "Kỷ niệm", "Valentine"],
    flowers: ["Hồng đỏ", "Hồng vàng"],
    palette: "Đỏ - vàng",
    seasonal: "Quanh năm",
    stock: 11,
  },
  {
    id: "sunlit-joy",
    slug: "sunlit-joy",
    sku: "TF-BQ-008",
    name: "Sunlit Joy",
    subtitle: "Hướng dương và hoa đồng nội",
    description: "Một bó hoa vui tươi với hướng dương làm tâm điểm, điểm hoa trắng và lá xanh, thích hợp cho lễ tốt nghiệp và khởi đầu mới.",
    price: 490_000,
    image: "/products/sunlit-joy.png",
    gallery: ["/products/sunlit-joy.png", "/products/spring-lullaby.png", "/products/morning-mist.png"],
    category: "Bó hoa",
    occasions: ["Tốt nghiệp", "Chúc mừng", "Sinh nhật"],
    flowers: ["Hướng dương", "Cúc tana", "Lá bạc"],
    palette: "Vàng - xanh",
    seasonal: "Hè",
    stock: 18,
  },
];

export const categories = ["Tất cả", "Bó hoa", "Giỏ hoa", "Hoa cưới", "Hoa sự kiện"] as const;

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}
