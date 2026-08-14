CREATE TABLE retired_product_ids (id TEXT PRIMARY KEY);
INSERT INTO retired_product_ids (id)
VALUES
  ('amour-bleu'),
  ('pastel-poetry'),
  ('morning-mist'),
  ('garden-whisper'),
  ('spring-lullaby'),
  ('blue-sonata'),
  ('romance-deep'),
  ('sunlit-joy'),
  ('me-oi'),
  ('ghe-tham'),
  ('bui-phan'),
  ('loi-hen-do'),
  ('nha-co-em'),
  ('hien-nha-moi'),
  ('loc-xuan'),
  ('ngay-chung-doi'),
  ('sanh-buoc'),
  ('mo-loi'),
  ('mot-loi-tien'),
  ('ban-tiec-chom-thu');

CREATE TABLE retired_demo_order_ids (id TEXT PRIMARY KEY);
INSERT OR IGNORE INTO retired_demo_order_ids (id)
SELECT order_id
FROM order_items
WHERE product_id IN (SELECT id FROM retired_product_ids);

DELETE FROM payment_evidence
WHERE order_id IN (SELECT id FROM retired_demo_order_ids);
DELETE FROM order_events
WHERE order_id IN (SELECT id FROM retired_demo_order_ids);
DELETE FROM order_items
WHERE order_id IN (SELECT id FROM retired_demo_order_ids);
DELETE FROM orders
WHERE id IN (SELECT id FROM retired_demo_order_ids);
DELETE FROM product_variants
WHERE product_id IN (SELECT id FROM retired_product_ids);
DELETE FROM products
WHERE id IN (SELECT id FROM retired_product_ids);

DROP TABLE retired_demo_order_ids;
DROP TABLE retired_product_ids;

INSERT INTO products (id, sku, slug, name, subtitle, description, category, seasonal, image_url, gallery_json, occasions_json, flowers_json, palette, badge, active, featured, sort_order)
VALUES
  ('vuon-trong-nang', 'TF-BQ-001', 'vuon-trong-nang', 'Vườn Trong Nắng', 'Sắc hoa ấm áp cho một ngày thật trong trẻo', 'Thiết kế dáng tròn với những mảng màu sáng và lớp lá xanh tự nhiên, mang cảm giác như một khu vườn nhỏ vừa đón nắng đầu ngày.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/vuon-trong-nang.webp', '["/products/vuon-trong-nang.webp"]', '["Sinh nhật","Chúc mừng","Cảm ơn"]', '["Hồng cam","Hồng vàng","Cúc","Hoa đồng nội theo mùa"]', 'Vàng nắng - hồng phấn - xanh lá', 'Mới', 1, 1, 10),
  ('nang-goi-niem-vui', 'TF-BQ-002', 'nang-goi-niem-vui', 'Nắng Gọi Niềm Vui', 'Một khoảng nắng vui được gói trao tận tay', 'Bó hoa có phom mở thoáng, phối sắc vàng tươi cùng các gam sáng dịu để gửi lời chúc tích cực trong sinh nhật hoặc một khởi đầu mới.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/nang-goi-niem-vui.webp', '["/products/nang-goi-niem-vui.webp"]', '["Sinh nhật","Tốt nghiệp","Khởi đầu mới"]', '["Hướng dương","Hồng","Đồng tiền","Cúc ping pong","Baby"]', 'Vàng tươi - kem - xanh non', 'Bán chạy', 1, 1, 20),
  ('hen-nhau-mua-hong', 'TF-BQ-003', 'hen-nhau-mua-hong', 'Hẹn Nhau Mùa Hồng', 'Bó hoa tông hồng cho những cuộc hẹn dịu dàng', 'Các lớp hoa hồng sắc được kết mềm và ôm tròn trong giấy gói thanh lịch, phù hợp để đánh dấu một cuộc hẹn, ngày kỷ niệm hoặc lời tỏ tình.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/hen-nhau-mua-hong.webp', '["/products/hen-nhau-mua-hong.webp"]', '["Hẹn hò","Kỷ niệm","Tỏ tình"]', '["Lily hồng","Hồng","Hồng chùm","Cúc tana"]', 'Hồng phấn - hồng đậm - kem', 'Cao cấp', 1, 1, 30),
  ('dao-choi-trong-vuon', 'TF-BQ-004', 'dao-choi-trong-vuon', 'Dạo Chơi Trong Vườn', 'Phom hoa tự nhiên như vừa hái từ khu vườn nhỏ', 'Bó hoa phối kiểu vườn với độ cao thấp tự nhiên và những khoảng thở mềm mại, tạo cảm giác gần gũi cho sinh nhật, lời cảm ơn hoặc một buổi ghé thăm.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/dao-choi-trong-vuon.webp', '["/products/dao-choi-trong-vuon.webp"]', '["Sinh nhật","Cảm ơn","Ghé thăm"]', '["Hồng","Sao nhái","Phi yến xanh","Cúc nhí"]', 'Hồng đào - tím nhạt - xanh lá', 'Mẫu mới', 1, 1, 40),
  ('chuong-trang-binh-yen', 'TF-BQ-005', 'chuong-trang-binh-yen', 'Chuông Trắng Bình Yên', 'Sắc trắng nhẹ nhàng cho những phút giây an yên', 'Thiết kế tông trắng kem có phom gọn và nhịp hoa thanh thoát, dành cho lời hỏi thăm chân thành, món quà tân gia hoặc một lời cảm ơn trang nhã.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/chuong-trang-binh-yen.webp', '["/products/chuong-trang-binh-yen.webp"]', '["Cảm ơn","Thăm hỏi","Tân gia"]', '["Hoa chuông trắng","Sao xanh","Lá phụ"]', 'Trắng - kem - xanh dịu', 'Thanh lịch', 1, 0, 50),
  ('trang-xanh', 'TF-BQ-006', 'trang-xanh', 'Trăng Xanh', 'Bó hoa xanh lam dịu như ánh trăng đầu tối', 'Sắc xanh lam chuyển nhẹ sang trắng và tím nhạt trong một phom hoa cân đối, tạo món quà có nét riêng cho sinh nhật, kỷ niệm và người thương.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/trang-xanh.webp', '["/products/trang-xanh.webp"]', '["Sinh nhật","Kỷ niệm","Tặng người thương"]', '["Hoa trắng nhiều lớp","Hoa điểm xanh","Lá phụ"]', 'Xanh lam - trắng - tím nhạt', 'Được yêu thích', 1, 1, 60),
  ('vuon-co-tich', 'TF-GH-007', 'vuon-co-tich', 'Vườn Cổ Tích', 'Giỏ hoa nhiều tầng sắc như một khu vườn cổ tích', 'Giỏ hoa được cắm nhiều tầng với các cụm màu đan xen và phần lá mở thoáng, tạo điểm nhấn nổi bật cho sinh nhật, tân gia hoặc dịp chúc mừng.', 'Giỏ hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/vuon-co-tich.webp', '["/products/vuon-co-tich.webp"]', '["Sinh nhật","Tân gia","Chúc mừng"]', '["Cẩm tú cầu","Hồng","Cúc tana","Lan vàng"]', 'Hồng - tím - xanh - kem', 'Giỏ hoa cao cấp', 1, 1, 70),
  ('cham-may', 'TF-HC-008', 'cham-may', 'Chạm Mây', 'Hoa cầm tay mềm nhẹ cho ngày chung đôi', 'Bó hoa cưới tông trắng kem có đường nét mềm, vừa tay cầm và dễ hòa cùng nhiều kiểu váy, dành cho lễ cưới, lễ gia tiên hoặc buổi chụp ảnh.', 'Hoa cưới', 'Quanh năm, đặt trước 3 ngày để chọn hoa phù hợp', '/products/cham-may.webp', '["/products/cham-may.webp"]', '["Lễ cưới","Lễ gia tiên","Chụp ảnh cưới"]', '["Cẩm tú cầu xanh","Hồng kem","Cẩm chướng hồng","Hoa hồng nhạt theo mùa"]', 'Trắng mây - kem - xanh nhạt', 'Hoa cưới', 1, 1, 80),
  ('tu-cau-be-xinh', 'TF-BQ-009', 'tu-cau-be-xinh', 'Tú Cầu Bé Xinh', 'Bó hoa nhỏ xinh với sắc xanh trong trẻo', 'Thiết kế cỡ nhỏ được gói gọn gàng, phối sắc xanh ngọc cùng các điểm sáng mềm mại để dễ trao trong sinh nhật, lời cảm ơn hoặc buổi ghé thăm.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/tu-cau-be-xinh.webp', '["/products/tu-cau-be-xinh.webp"]', '["Sinh nhật","Cảm ơn","Ghé thăm"]', '["Cẩm tú cầu xanh","Hoa trắng theo mùa"]', 'Xanh ngọc - trắng - kem', 'Dễ thương', 1, 0, 90),
  ('sac-mau-le-hoi', 'TF-BQ-010', 'sac-mau-le-hoi', 'Sắc Màu Lễ Hội', 'Bó hoa rộn ràng với những mảng màu tươi sáng', 'Nhiều gam màu được sắp thành từng lớp có nhịp điệu, tạo một bó hoa vui mắt và tràn năng lượng cho dịp chúc mừng, tốt nghiệp hoặc sinh nhật.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/sac-mau-le-hoi.webp', '["/products/sac-mau-le-hoi.webp"]', '["Chúc mừng","Tốt nghiệp","Sinh nhật"]', '["Hồng","Cúc","Lan","Hoa đồng nội theo mùa"]', 'Cam - hồng - vàng - tím', 'Rực rỡ', 1, 0, 100),
  ('sanh-doi-hong-lam', 'TF-HC-011', 'sanh-doi-hong-lam', 'Sánh Đôi Hồng Lam', 'Hoa cầm tay hòa sắc hồng và lam cho lễ cưới', 'Bó hoa cưới phối hai tông hồng lam trong phom cầm tay cân đối, lên ảnh rõ màu nhưng vẫn mềm mại cho lễ cưới, lễ đính hôn hoặc buổi chụp hình.', 'Hoa cưới', 'Quanh năm, đặt trước 3 ngày để chọn hoa phù hợp', '/products/sanh-doi-hong-lam.webp', '["/products/sanh-doi-hong-lam.webp"]', '["Lễ cưới","Lễ đính hôn","Chụp ảnh cưới"]', '["Hồng","Cẩm tú cầu xanh","Alstroemeria","Sao xanh"]', 'Hồng bụi - lam nhạt - trắng', 'Hoa cưới', 1, 1, 110),
  ('may-lam', 'TF-BQ-012', 'may-lam', 'Mây Lam', 'Bó hoa tông lam mềm mại như một áng mây', 'Sắc lam khói được làm dịu bằng những điểm hoa trắng và lớp gói sáng, tạo món quà nhẹ nhàng cho sinh nhật, lời cảm ơn hoặc người thương.', 'Bó hoa', 'Quanh năm, phối hoa tương đương theo mùa', '/products/may-lam.webp', '["/products/may-lam.webp"]', '["Sinh nhật","Cảm ơn","Tặng người thương"]', '["Phi yến xanh","Phi yến trắng"]', 'Lam khói - trắng - xanh bạc', 'Dịu dàng', 1, 0, 120);

INSERT INTO product_variants (id, product_id, name, price, compare_at_price, stock, active)
VALUES
  ('vuon-trong-nang-standard', 'vuon-trong-nang', 'Tiêu chuẩn', 690000, NULL, 14, 1),
  ('nang-goi-niem-vui-standard', 'nang-goi-niem-vui', 'Tiêu chuẩn', 790000, NULL, 12, 1),
  ('hen-nhau-mua-hong-standard', 'hen-nhau-mua-hong', 'Tiêu chuẩn', 1190000, NULL, 7, 1),
  ('dao-choi-trong-vuon-standard', 'dao-choi-trong-vuon', 'Tiêu chuẩn', 620000, NULL, 16, 1),
  ('chuong-trang-binh-yen-standard', 'chuong-trang-binh-yen', 'Tiêu chuẩn', 590000, NULL, 10, 1),
  ('trang-xanh-standard', 'trang-xanh', 'Tiêu chuẩn', 720000, NULL, 9, 1),
  ('vuon-co-tich-standard', 'vuon-co-tich', 'Tiêu chuẩn', 1350000, NULL, 5, 1),
  ('cham-may-standard', 'cham-may', 'Tiêu chuẩn', 1150000, NULL, 4, 1),
  ('tu-cau-be-xinh-standard', 'tu-cau-be-xinh', 'Tiêu chuẩn', 490000, NULL, 13, 1),
  ('sac-mau-le-hoi-standard', 'sac-mau-le-hoi', 'Tiêu chuẩn', 980000, NULL, 8, 1),
  ('sanh-doi-hong-lam-standard', 'sanh-doi-hong-lam', 'Tiêu chuẩn', 1250000, NULL, 4, 1),
  ('may-lam-standard', 'may-lam', 'Tiêu chuẩn', 650000, NULL, 11, 1);
