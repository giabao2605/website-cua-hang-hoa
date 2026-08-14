export type JournalSection = Readonly<{
  heading: string;
  paragraphs: readonly string[];
  tip?: string;
}>;

export type JournalArticle = Readonly<{
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  readTime: string;
  publishedAt: string;
  sections: readonly JournalSection[];
}>;

export const journalArticles: readonly JournalArticle[] = [
  {
    slug: "giu-cam-tu-cau-tuoi-lau-ngay-he",
    category: "Mẹo chăm hoa",
    title: "5 cách giữ cẩm tú cầu tươi lâu trong ngày hè",
    excerpt: "Cẩm tú cầu uống rất nhiều nước và dễ mất sức khi trời nóng. Năm bước đơn giản dưới đây giúp từng khối hoa giữ được độ căng, màu trong và dáng tự nhiên lâu hơn.",
    image: "/products/morning-mist.png",
    imageAlt: "Cẩm tú cầu xanh và cát tường trắng trong bó Sương Mai",
    readTime: "5 phút đọc",
    publishedAt: "2026-08-13",
    sections: [
      {
        heading: "1. Cắt lại gốc ngay khi nhận hoa",
        paragraphs: [
          "Tháo phần giấy giữ nước, dùng kéo hoặc dao thật sạch cắt chéo mỗi cành khoảng 2–3 cm. Vết cắt mới và rộng giúp thân hút nước nhanh hơn sau quãng đường vận chuyển.",
          "Nếu bó hoa đã được Trâm cố định dáng, bạn chỉ cần nới nhẹ dây buộc trước khi cắt. Không nên tháo toàn bộ cấu trúc nếu vẫn muốn giữ đúng phom thiết kế.",
        ],
      },
      {
        heading: "2. Dùng bình sạch và đủ nước",
        paragraphs: [
          "Cẩm tú cầu cần mực nước cao hơn nhiều loại hoa khác. Hãy rửa bình kỹ, đổ nước mát ngập ít nhất một phần hai thân cành và loại bỏ mọi lá nằm dưới mặt nước.",
        ],
        tip: "Thay toàn bộ nước mỗi ngày; chỉ châm thêm nước sẽ không loại bỏ được vi khuẩn đã tích tụ trong bình.",
      },
      {
        heading: "3. Chọn vị trí mát, tránh luồng gió trực tiếp",
        paragraphs: [
          "Đặt hoa ở nơi có ánh sáng tán xạ, tránh nắng cửa sổ, bếp, thiết bị tỏa nhiệt và luồng điều hòa thổi thẳng. Nhiệt độ ổn định giúp cánh hoa thoát nước chậm hơn.",
        ],
      },
      {
        heading: "4. Hồi nước khi hoa có dấu hiệu mềm",
        paragraphs: [
          "Nếu một khối cẩm tú cầu hơi rũ, cắt lại gốc rồi nhúng riêng phần bông vào chậu nước sạch khoảng 15–20 phút. Cánh cẩm tú cầu có thể hấp thụ nước trực tiếp và thường căng trở lại khá nhanh.",
        ],
        tip: "Chỉ dùng cách này với cẩm tú cầu còn sạch và không có dấu hiệu úng nâu.",
      },
      {
        heading: "5. Dưỡng hoa một chút mỗi sáng",
        paragraphs: [
          "Kiểm tra mực nước, bỏ cánh dập và cắt lại 0,5–1 cm ở gốc sau mỗi hai ngày. Một lần chăm ngắn vào buổi sáng thường hiệu quả hơn việc xử lý nhiều khi hoa đã mất nước lâu.",
        ],
      },
    ],
  },
  {
    slug: "chon-bang-mau-hoa-cho-loi-nhan",
    category: "Chọn hoa",
    title: "Chọn bảng màu hoa phù hợp với từng lời nhắn",
    excerpt: "Màu hoa tạo cảm xúc trước cả khi tấm thiệp được mở. Từ dịu dàng, ấm áp đến rực rỡ, mỗi bảng màu có thể giúp lời nhắn của bạn trở nên rõ ràng và tinh tế hơn.",
    image: "/products/garden-whisper.png",
    imageAlt: "Bó hồng garden màu hồng và tím Lời Thì Thầm Của Vườn",
    readTime: "6 phút đọc",
    publishedAt: "2026-08-10",
    sections: [
      {
        heading: "Xanh và trắng cho sự bình yên",
        paragraphs: [
          "Xanh phấn, trắng kem và một chút lá bạc tạo cảm giác nhẹ, sạch và đáng tin cậy. Bảng màu này hợp với lời cảm ơn, chúc mừng đồng nghiệp, tân gia hoặc một món quà không cần quá riêng tư.",
          "Cẩm tú cầu giúp tổng thể đầy đặn, trong khi cát tường và hoa phụ trắng giữ cho thiết kế thoáng và thanh lịch.",
        ],
      },
      {
        heading: "Hồng pastel cho sự dịu dàng",
        paragraphs: [
          "Hồng phấn, kem đào và lilac là lựa chọn an toàn cho sinh nhật, kỷ niệm hoặc lời xin lỗi. Sắc độ mềm truyền tải sự quan tâm mà không tạo cảm giác phô trương.",
        ],
        tip: "Nếu người nhận thích phong cách tối giản, hãy dùng ít loại hoa hơn nhưng tăng chênh lệch sắc độ trong cùng một gam màu.",
      },
      {
        heading: "Đỏ trầm cho một lời yêu rõ ràng",
        paragraphs: [
          "Đỏ burgundy và hồng đỏ tạo chiều sâu, phù hợp với ngày kỷ niệm hoặc lời tỏ tình. Kết hợp giấy gói navy và điểm champagne sẽ giữ vẻ sang trọng, tránh cảm giác quá chói.",
        ],
      },
      {
        heading: "Vàng và xanh cho một khởi đầu mới",
        paragraphs: [
          "Hướng dương, vàng bơ và lá xanh mang năng lượng vui tươi. Đây là bảng màu hợp với tốt nghiệp, khai trương, thăng chức hoặc bất kỳ cột mốc nào cần một lời động viên đầy ánh sáng.",
          "Khi chưa chắc nên chọn gì, hãy nói với Trâm ba điều: dịp tặng, tính cách người nhận và cảm xúc bạn muốn gửi. Shop sẽ đề xuất bảng màu trước khi lên hoa.",
        ],
      },
    ],
  },
  {
    slug: "buoi-sang-ket-hoa-theo-mua",
    category: "Sau cánh cửa tiệm",
    title: "Một buổi sáng kết hoa theo mùa tại Trâm Florist",
    excerpt: "Trước khi một bó hoa rời Tuy An Bắc, mỗi cành đều đi qua nhiều bước nhỏ: kiểm tra độ tươi, dưỡng nước, phân bảng màu, kết dáng và đóng gói cho đúng hành trình giao.",
    image: "/products/pastel-poetry.png",
    imageAlt: "Bó hoa pastel nhiều tầng màu tại Trâm Florist",
    readTime: "4 phút đọc",
    publishedAt: "2026-08-06",
    sections: [
      {
        heading: "Bắt đầu bằng hoa đang đẹp nhất",
        paragraphs: [
          "Buổi sáng của Trâm bắt đầu bằng việc kiểm tra từng cành: độ cứng của thân, độ mở của nụ, màu cánh và khả năng chịu quãng đường giao. Những cành chưa đủ sức sẽ được dưỡng riêng thay vì đưa ngay vào thiết kế.",
        ],
      },
      {
        heading: "Giữ tinh thần mẫu, không ép hoa phải giống hệt",
        paragraphs: [
          "Hoa tươi thay đổi theo mùa nên hai bó cùng tên vẫn có thể khác nhẹ về giống hoa phụ. Trâm giữ lại những yếu tố quan trọng nhất: bảng màu, tỷ lệ, dáng bó và cảm xúc tổng thể.",
          "Khi một loại hoa chính cần thay thế, shop chọn loại có giá trị và sắc độ tương đương rồi xác nhận với khách nếu thay đổi ảnh hưởng đáng kể đến thiết kế.",
        ],
      },
      {
        heading: "Kết từ khối lớn đến nhịp nhỏ",
        paragraphs: [
          "Cẩm tú cầu, hồng garden hoặc hướng dương thường tạo khối chính. Hoa cát tường, cúc tana và cành lá được thêm sau để dẫn mắt, tạo khoảng thở và giúp bó hoa trông tự nhiên từ nhiều góc.",
        ],
        tip: "Một bó hoa đẹp không nhất thiết phải thật chặt; khoảng trống đúng chỗ giúp từng bông có không gian để nở.",
      },
      {
        heading: "Đóng gói theo nơi hoa sẽ đến",
        paragraphs: [
          "Đơn giao gần có thể ưu tiên phom mở và giấy gói nhẹ. Với quãng đường xa, phần gốc được giữ ẩm kỹ hơn, lớp giấy bảo vệ được gia cố và thời điểm giao được tính để hoa không nằm chờ quá lâu.",
          "Sau cùng, shop kiểm tra tấm thiệp, thông tin người nhận và trạng thái thanh toán trước khi bàn giao. Đó là những bước nhỏ nhưng quyết định trải nghiệm khi bó hoa được trao đi.",
        ],
      },
    ],
  },
];

export function getJournalArticle(slug: string) {
  return journalArticles.find((article) => article.slug === slug);
}
