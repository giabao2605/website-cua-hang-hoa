INSERT OR IGNORE INTO products (id, sku, slug, name, subtitle, description, category, seasonal, image_url, gallery_json, occasions_json, flowers_json, palette, badge, active, featured, sort_order)
VALUES
  ('amour-bleu', 'TF-BQ-001', 'amour-bleu', 'Tình Xanh', 'Cẩm tú cầu xanh và hồng garden', 'Bó hoa chủ đạo xanh sương, điểm hồng phấn và trắng kem. Một thiết kế dịu dàng nhưng có chiều sâu cho sinh nhật, kỷ niệm và lời cảm ơn trang trọng.', 'Bó hoa', 'Quanh năm, thay hoa tương đương theo mùa', '/products/amour-bleu.png', '["/products/amour-bleu.png","/products/pastel-poetry.png","/products/blue-sonata.png"]', '["Sinh nhật","Kỷ niệm","Cảm ơn"]', '["Cẩm tú cầu","Hồng garden","Cát tường"]', 'Xanh - hồng', 'Bán chạy', 1, 1, 10),
  ('pastel-poetry', 'TF-BQ-002', 'pastel-poetry', 'Vần Thơ Màu Phấn', 'Hoa theo mùa sắc pastel', 'Một bản phối nhiều tầng giữa hồng phấn, kem đào, tím lilac và xanh nhạt, được gói thủ công bằng giấy mỹ thuật cao cấp.', 'Bó hoa', 'Xuân - Hè', '/products/pastel-poetry.png', '["/products/pastel-poetry.png","/products/amour-bleu.png","/products/romance-deep.png"]', '["Sinh nhật","Chúc mừng","Tặng người thương"]', '["Hồng","Cẩm chướng","Lan","Cát tường"]', 'Pastel', 'Theo mùa', 1, 1, 20),
  ('morning-mist', 'TF-BQ-003', 'morning-mist', 'Sương Mai', 'Cẩm tú cầu và cát tường tinh khôi', 'Thiết kế thoáng, tự nhiên với sắc xanh dịu và nhịp hoa trắng thanh lịch, phù hợp tặng đồng nghiệp hoặc trang trí bàn tiệc.', 'Bó hoa', 'Hè - Thu', '/products/morning-mist.png', '["/products/morning-mist.png","/products/blue-sonata.png","/products/pastel-poetry.png"]', '["Cảm ơn","Chúc mừng","Khai trương"]', '["Cẩm tú cầu","Cát tường","Bạch đàn"]', 'Xanh - trắng', NULL, 1, 1, 30),
  ('garden-whisper', 'TF-BQ-004', 'garden-whisper', 'Lời Thì Thầm Của Vườn', 'Hồng garden và thanh liễu', 'Bó hoa lãng mạn lấy cảm hứng từ vườn hoa sớm mai, cân bằng giữa những nụ hồng mềm và cành lá mảnh.', 'Bó hoa', 'Quanh năm', '/products/garden-whisper.png', '["/products/garden-whisper.png","/products/pastel-poetry.png","/products/romance-deep.png"]', '["Hẹn hò","Sinh nhật","Xin lỗi"]', '["Hồng garden","Thanh liễu","Cẩm chướng"]', 'Hồng - tím', 'Mới', 1, 0, 40),
  ('spring-lullaby', 'TF-BQ-005', 'spring-lullaby', 'Khúc Ru Mùa Xuân', 'Tulip và lily vàng hồng', 'Tulip vàng tươi kết hợp lily hồng mềm mại tạo nên một món quà rạng rỡ, giàu năng lượng nhưng vẫn nữ tính.', 'Bó hoa', 'Xuân', '/products/spring-lullaby.png', '["/products/spring-lullaby.png","/products/sunlit-joy.png","/products/morning-mist.png"]', '["Sinh nhật","Chúc mừng","Tân gia"]', '["Tulip","Lily"]', 'Vàng - hồng', 'Giới hạn', 1, 0, 50),
  ('blue-sonata', 'TF-GH-006', 'blue-sonata', 'Khúc Xanh', 'Giỏ cẩm tú cầu xanh thanh lịch', 'Giỏ hoa bàn với những khối cẩm tú cầu xanh đầy đặn, xen cúc kem và lá bạc, dành cho không gian tiếp khách sang trọng.', 'Giỏ hoa', 'Hè - Thu', '/products/blue-sonata.png', '["/products/blue-sonata.png","/products/amour-bleu.png","/products/morning-mist.png"]', '["Kỷ niệm","Khai trương","Tân gia"]', '["Cẩm tú cầu","Cúc mẫu đơn","Hồng"]', 'Xanh - kem', 'Cao cấp', 1, 1, 60),
  ('romance-deep', 'TF-BQ-007', 'romance-deep', 'Tình Nồng', 'Hồng đỏ nghệ thuật', 'Hồng đỏ và vàng champagne trong lớp gói tối màu, một lựa chọn giàu cảm xúc cho ngày kỷ niệm và lời tỏ tình.', 'Bó hoa', 'Quanh năm', '/products/romance-deep.png', '["/products/romance-deep.png","/products/garden-whisper.png","/products/amour-bleu.png"]', '["Tỏ tình","Kỷ niệm","Valentine"]', '["Hồng đỏ","Hồng vàng"]', 'Đỏ - vàng', NULL, 1, 0, 70),
  ('sunlit-joy', 'TF-BQ-008', 'sunlit-joy', 'Nắng Vui', 'Hướng dương và hoa đồng nội', 'Một bó hoa vui tươi với hướng dương làm tâm điểm, điểm hoa trắng và lá xanh, thích hợp cho lễ tốt nghiệp và khởi đầu mới.', 'Bó hoa', 'Hè', '/products/sunlit-joy.png', '["/products/sunlit-joy.png","/products/spring-lullaby.png","/products/morning-mist.png"]', '["Tốt nghiệp","Chúc mừng","Sinh nhật"]', '["Hướng dương","Cúc tana","Lá bạc"]', 'Vàng - xanh', NULL, 1, 0, 80),
  ('me-oi', 'TF-BQ-009', 'me-oi', 'Mẹ Ơi', 'Cẩm chướng hồng kết tròn', 'Cẩm chướng hồng kết thành bó tròn, chen thanh liễu và lá bạc cho dáng hoa mềm hơn. Một bó vừa tay để tặng mẹ ngày lễ hoặc mang theo trong buổi ghé nhà.', 'Bó hoa', 'Quanh năm', '/products/me-oi.webp', '["/products/me-oi.webp"]', '["Ngày của Mẹ","8/3","20/10"]', '["Cẩm chướng hồng","Thanh liễu","Lá bạc"]', 'Hồng phấn - kem', 'Tặng mẹ', 1, 0, 90),
  ('ghe-tham', 'TF-BQ-010', 'ghe-tham', 'Ghé Thăm', 'Đồng tiền cam và cát tường trắng', 'Đồng tiền cam, cát tường trắng và cúc tana được gói thoáng, vừa tay mang vào phòng bệnh. Màu sáng, dáng gọn và không quá phô trương.', 'Bó hoa', 'Quanh năm', '/products/ghe-tham.webp', '["/products/ghe-tham.webp"]', '["Thăm bệnh","Chúc mau khỏe"]', '["Đồng tiền cam","Cát tường trắng","Cúc tana"]', 'Cam - vàng - trắng', NULL, 1, 0, 100),
  ('bui-phan', 'TF-BQ-011', 'bui-phan', 'Bụi Phấn', 'Freesia trắng và phi yến tím', 'Freesia trắng đi cùng phi yến tím và thạch thảo, kết theo dáng dài thanh thoát. Mẫu hoa lịch sự để gửi thầy cô mà vẫn có nét riêng.', 'Bó hoa', 'Thu - Xuân, thay hoa tương đương khi hết mùa', '/products/bui-phan.webp', '["/products/bui-phan.webp"]', '["Ngày Nhà giáo","Cảm ơn thầy cô"]', '["Freesia trắng","Phi yến tím","Thạch thảo"]', 'Trắng - tím', '20/11', 1, 0, 110),
  ('loi-hen-do', 'TF-BQ-012', 'loi-hen-do', 'Lời Hẹn Đỏ', 'Hồng đỏ kết xoắn gọn', 'Mười tám bông hồng đỏ được kết sát tay, giữ dáng tròn gọn và bọc giấy màu trầm. Hợp cho một lời tỏ tình rõ ràng, không cần thêm nhiều lời.', 'Bó hoa', 'Quanh năm, đặt trước 24 giờ', '/products/loi-hen-do.webp', '["/products/loi-hen-do.webp"]', '["Valentine","Tỏ tình","Cầu hôn"]', '["Hồng Ecuador đỏ","Lá bạc"]', 'Đỏ rượu - xanh bạc', 'Đặt trước', 1, 0, 120),
  ('nha-co-em', 'TF-GH-013', 'nha-co-em', 'Nhà Có Em', 'Giỏ cúc ping pong dịu sáng', 'Cúc ping pong, cát tường và cẩm chướng chùm cắm trong giỏ thấp, dễ đặt ở bàn khách. Mẫu không dùng lily, hợp mang đến chúc mừng gia đình vừa đón em bé.', 'Giỏ hoa', 'Quanh năm', '/products/nha-co-em.webp', '["/products/nha-co-em.webp"]', '["Mừng em bé","Đầy tháng"]', '["Cúc ping pong trắng","Cát tường kem","Cẩm chướng chùm"]', 'Kem - xanh mint - đào nhạt', 'Mẫu mới', 1, 0, 130),
  ('hien-nha-moi', 'TF-GH-014', 'hien-nha-moi', 'Hiên Nhà Mới', 'Thiên điểu và hồng môn dáng cao', 'Thiên điểu và hồng môn được cắm lệch một phía, phần lá mở rộng để giỏ hoa nhìn thoáng. Dáng cao hợp đặt ở sảnh hoặc góc phòng khách mới.', 'Giỏ hoa', 'Quanh năm', '/products/hien-nha-moi.webp', '["/products/hien-nha-moi.webp"]', '["Tân gia","Chuyển nhà"]', '["Thiên điểu","Hồng môn cam","Monstera"]', 'Cam - xanh lá', NULL, 1, 0, 140),
  ('loc-xuan', 'TF-GH-015', 'loc-xuan', 'Lộc Xuân', 'Địa lan vàng và nụ tầm xuân', 'Địa lan vàng làm mảng chính, điểm cúc tròn và vài nhánh tầm xuân đỏ. Giỏ hoa có dáng gọn để đặt trên bàn tiếp khách những ngày đầu năm.', 'Giỏ hoa', 'Mùa Tết, đặt trước 2 ngày', '/products/loc-xuan.webp', '["/products/loc-xuan.webp"]', '["Tết","Chúc năm mới"]', '["Địa lan vàng","Cúc ping pong vàng","Nụ tầm xuân"]', 'Vàng - đỏ - xanh', 'Theo mùa', 1, 0, 150),
  ('ngay-chung-doi', 'TF-HC-016', 'ngay-chung-doi', 'Ngày Chung Đôi', 'Rum trắng cầm tay dáng dài', 'Rum trắng giữ nguyên thân dài, bó gọn cùng baby và lá olive. Kiểu ôm tay hợp váy cưới tối giản và những buổi lễ có không gian nhỏ.', 'Hoa cưới', 'Quanh năm, đặt trước 3 ngày', '/products/ngay-chung-doi.webp', '["/products/ngay-chung-doi.webp"]', '["Lễ cưới","Lễ gia tiên"]', '["Hoa rum trắng","Baby trắng","Lá olive"]', 'Trắng - xanh olive', 'Hoa cưới', 1, 0, 160),
  ('sanh-buoc', 'TF-HC-017', 'sanh-buoc', 'Sánh Bước', 'Thược dược đỏ rượu dáng bán nguyệt', 'Thược dược đỏ rượu làm tâm, hồng chùm đi thấp và dương xỉ mở sang hai bên. Dáng bán nguyệt lên ảnh rõ nhưng vẫn dễ cầm.', 'Hoa cưới', 'Thu - Đông, thay thược dược tương đương khi hết mùa', '/products/sanh-buoc.webp', '["/products/sanh-buoc.webp"]', '["Lễ đính hôn","Chụp ảnh cưới"]', '["Thược dược đỏ rượu","Hồng chùm","Lá dương xỉ"]', 'Đỏ rượu - hồng bụi', NULL, 1, 0, 170),
  ('mo-loi', 'TF-SK-018', 'mo-loi', 'Mở Lối', 'Kệ lan mokara hai tầng', 'Kệ hai tầng với lan mokara chạy thành mảng, hồng môn tạo điểm đỏ và lá lớn giữ phom. Dáng kệ cao, dễ nhìn khi đặt trước cửa hàng.', 'Hoa sự kiện', 'Quanh năm, đặt trước 1 ngày', '/products/mo-loi.webp', '["/products/mo-loi.webp"]', '["Khai trương","Khánh thành"]', '["Lan mokara cam","Hồng môn đỏ","Monstera"]', 'Cam - đỏ - xanh', 'Khai trương', 1, 0, 180),
  ('mot-loi-tien', 'TF-SK-019', 'mot-loi-tien', 'Một Lời Tiễn', 'Kệ hoa trắng dáng oval', 'Ly và cúc trắng được cắm thành một mảng oval gọn, viền lá xanh vừa đủ. Thiết kế giữ màu sắc trang nhã cho lời chia buồn.', 'Hoa sự kiện', 'Quanh năm', '/products/mot-loi-tien.webp', '["/products/mot-loi-tien.webp"]', '["Chia buồn","Tưởng niệm"]', '["Ly trắng","Cúc trắng","Lá cau"]', 'Trắng - xanh', NULL, 1, 0, 190),
  ('ban-tiec-chom-thu', 'TF-SK-020', 'ban-tiec-chom-thu', 'Bàn Tiệc Chớm Thu', 'Hồng môn nâu cam cắm thấp', 'Hồng môn nâu cam và scabiosa được cắm thấp, mở ngang theo dáng lưỡi liềm. Bình không che tầm nhìn nên hợp đặt giữa bàn tiệc hoặc bàn gallery.', 'Hoa sự kiện', 'Hè - Thu, thay hoa tương đương theo mùa', '/products/ban-tiec-chom-thu.webp', '["/products/ban-tiec-chom-thu.webp"]', '["Tiệc doanh nghiệp","Bàn gallery","Tiệc tối"]', '["Hồng môn nâu cam","Scabiosa tím","Lá bạc"]', 'Đất nung - tím - xanh khói', NULL, 1, 0, 200);

INSERT OR IGNORE INTO product_variants (id, product_id, name, price, compare_at_price, stock, active)
VALUES
  ('amour-bleu-standard', 'amour-bleu', 'Tiêu chuẩn', 890000, 990000, 12, 1),
  ('pastel-poetry-standard', 'pastel-poetry', 'Tiêu chuẩn', 790000, NULL, 9, 1),
  ('morning-mist-standard', 'morning-mist', 'Tiêu chuẩn', 690000, NULL, 8, 1),
  ('garden-whisper-standard', 'garden-whisper', 'Tiêu chuẩn', 590000, NULL, 16, 1),
  ('spring-lullaby-standard', 'spring-lullaby', 'Tiêu chuẩn', 750000, NULL, 6, 1),
  ('blue-sonata-standard', 'blue-sonata', 'Tiêu chuẩn', 1090000, NULL, 5, 1),
  ('romance-deep-standard', 'romance-deep', 'Tiêu chuẩn', 820000, NULL, 11, 1),
  ('sunlit-joy-standard', 'sunlit-joy', 'Tiêu chuẩn', 490000, NULL, 18, 1),
  ('me-oi-standard', 'me-oi', 'Tiêu chuẩn', 650000, NULL, 12, 1),
  ('ghe-tham-standard', 'ghe-tham', 'Tiêu chuẩn', 590000, NULL, 10, 1),
  ('bui-phan-standard', 'bui-phan', 'Tiêu chuẩn', 720000, NULL, 8, 1),
  ('loi-hen-do-standard', 'loi-hen-do', 'Tiêu chuẩn', 1190000, NULL, 6, 1),
  ('nha-co-em-standard', 'nha-co-em', 'Tiêu chuẩn', 790000, NULL, 7, 1),
  ('hien-nha-moi-standard', 'hien-nha-moi', 'Tiêu chuẩn', 990000, NULL, 5, 1),
  ('loc-xuan-standard', 'loc-xuan', 'Tiêu chuẩn', 1290000, NULL, 4, 1),
  ('ngay-chung-doi-standard', 'ngay-chung-doi', 'Tiêu chuẩn', 950000, NULL, 4, 1),
  ('sanh-buoc-standard', 'sanh-buoc', 'Tiêu chuẩn', 1090000, NULL, 3, 1),
  ('mo-loi-standard', 'mo-loi', 'Tiêu chuẩn', 1850000, NULL, 3, 1),
  ('mot-loi-tien-standard', 'mot-loi-tien', 'Tiêu chuẩn', 1450000, NULL, 3, 1),
  ('ban-tiec-chom-thu-standard', 'ban-tiec-chom-thu', 'Tiêu chuẩn', 890000, NULL, 8, 1);

INSERT OR IGNORE INTO shipping_rules (id, name, kind, value, fee, estimate, priority, active)
VALUES
  ('local', 'Nội xã Tuy An Bắc', 'locality', 'Xã Tuy An Bắc', 25000, 'Trong ngày', 300, 1),
  ('daklak', 'Các khu vực khác tại Đắk Lắk', 'province', 'Đắk Lắk', 50000, 'Trong ngày hoặc ngày kế tiếp', 200, 1),
  ('region', 'Tây Nguyên và Nam Trung Bộ', 'region', 'Tây Nguyên & Nam Trung Bộ', 85000, '1 - 2 ngày', 100, 1),
  ('nationwide', 'Các tỉnh thành còn lại', 'nationwide', 'Việt Nam', 120000, '2 - 4 ngày', 0, 1);

INSERT OR IGNORE INTO site_settings (key, value)
VALUES
  ('shop_name', 'Trâm Florist'),
  ('tagline', 'Trao một mùa hoa, giữ một đời thương'),
  ('phone', '0838469089'),
  ('address', 'Xã Tuy An Bắc, Tỉnh Đắk Lắk'),
  ('opening_hours', '08:00 - 17:00, Thứ Hai - Chủ Nhật'),
  ('zalo_url', 'https://zalo.me/0838469089'),
  ('momo_number', '0838469089'),
  ('momo_owner', 'NGUYỄN LÂM GIA BẢO'),
  ('momo_qr_image', '/payment/momo-nguyen-lam-gia-bao.png'),
  ('cod_enabled', 'true'),
  ('momo_enabled', 'true');

UPDATE site_settings
SET value = 'NGUYỄN LÂM GIA BẢO', updated_at = datetime('now')
WHERE key = 'momo_owner' AND value = 'Chờ chủ shop xác nhận';
