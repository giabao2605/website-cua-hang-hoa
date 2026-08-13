INSERT OR IGNORE INTO products (id, sku, slug, name, subtitle, description, category, seasonal, image_url, gallery_json, occasions_json, flowers_json, palette, badge, active, featured, sort_order)
VALUES
  ('amour-bleu', 'TF-BQ-001', 'amour-bleu', 'Amour Bleu', 'Cẩm tú cầu xanh và hồng garden', 'Bó hoa chủ đạo xanh sương, điểm hồng phấn và trắng kem. Một thiết kế dịu dàng nhưng có chiều sâu cho sinh nhật, kỷ niệm và lời cảm ơn trang trọng.', 'Bó hoa', 'Quanh năm, thay hoa tương đương theo mùa', '/products/amour-bleu.png', '["/products/amour-bleu.png","/products/pastel-poetry.png","/products/blue-sonata.png"]', '["Sinh nhật","Kỷ niệm","Cảm ơn"]', '["Cẩm tú cầu","Hồng garden","Cát tường"]', 'Xanh - hồng', 'Bán chạy', 1, 1, 10),
  ('pastel-poetry', 'TF-BQ-002', 'pastel-poetry', 'Pastel Poetry', 'Hoa theo mùa sắc pastel', 'Một bản phối nhiều tầng giữa hồng phấn, kem đào, tím lilac và xanh nhạt, được gói thủ công bằng giấy mỹ thuật cao cấp.', 'Bó hoa', 'Xuân - Hè', '/products/pastel-poetry.png', '["/products/pastel-poetry.png","/products/amour-bleu.png","/products/romance-deep.png"]', '["Sinh nhật","Chúc mừng","Tặng người thương"]', '["Hồng","Cẩm chướng","Lan","Cát tường"]', 'Pastel', 'Theo mùa', 1, 1, 20),
  ('morning-mist', 'TF-BQ-003', 'morning-mist', 'Morning Mist', 'Cẩm tú cầu và cát tường tinh khôi', 'Thiết kế thoáng, tự nhiên với sắc xanh dịu và nhịp hoa trắng thanh lịch, phù hợp tặng đồng nghiệp hoặc trang trí bàn tiệc.', 'Bó hoa', 'Hè - Thu', '/products/morning-mist.png', '["/products/morning-mist.png","/products/blue-sonata.png","/products/pastel-poetry.png"]', '["Cảm ơn","Chúc mừng","Khai trương"]', '["Cẩm tú cầu","Cát tường","Bạch đàn"]', 'Xanh - trắng', NULL, 1, 1, 30),
  ('garden-whisper', 'TF-BQ-004', 'garden-whisper', 'Garden Whisper', 'Hồng garden và thanh liễu', 'Bó hoa lãng mạn lấy cảm hứng từ vườn hoa sớm mai, cân bằng giữa những nụ hồng mềm và cành lá mảnh.', 'Bó hoa', 'Quanh năm', '/products/garden-whisper.png', '["/products/garden-whisper.png","/products/pastel-poetry.png","/products/romance-deep.png"]', '["Hẹn hò","Sinh nhật","Xin lỗi"]', '["Hồng garden","Thanh liễu","Cẩm chướng"]', 'Hồng - tím', 'Mới', 1, 0, 40),
  ('spring-lullaby', 'TF-BQ-005', 'spring-lullaby', 'Spring Lullaby', 'Tulip và lily vàng hồng', 'Tulip vàng tươi kết hợp lily hồng mềm mại tạo nên một món quà rạng rỡ, giàu năng lượng nhưng vẫn nữ tính.', 'Bó hoa', 'Xuân', '/products/spring-lullaby.png', '["/products/spring-lullaby.png","/products/sunlit-joy.png","/products/morning-mist.png"]', '["Sinh nhật","Chúc mừng","Tân gia"]', '["Tulip","Lily"]', 'Vàng - hồng', 'Giới hạn', 1, 0, 50),
  ('blue-sonata', 'TF-GH-006', 'blue-sonata', 'Blue Sonata', 'Giỏ cẩm tú cầu xanh thanh lịch', 'Giỏ hoa bàn với những khối cẩm tú cầu xanh đầy đặn, xen cúc kem và lá bạc, dành cho không gian tiếp khách sang trọng.', 'Giỏ hoa', 'Hè - Thu', '/products/blue-sonata.png', '["/products/blue-sonata.png","/products/amour-bleu.png","/products/morning-mist.png"]', '["Kỷ niệm","Khai trương","Tân gia"]', '["Cẩm tú cầu","Cúc mẫu đơn","Hồng"]', 'Xanh - kem', 'Cao cấp', 1, 1, 60),
  ('romance-deep', 'TF-BQ-007', 'romance-deep', 'Deep Romance', 'Hồng đỏ nghệ thuật', 'Hồng đỏ và vàng champagne trong lớp gói tối màu, một lựa chọn giàu cảm xúc cho ngày kỷ niệm và lời tỏ tình.', 'Bó hoa', 'Quanh năm', '/products/romance-deep.png', '["/products/romance-deep.png","/products/garden-whisper.png","/products/amour-bleu.png"]', '["Tỏ tình","Kỷ niệm","Valentine"]', '["Hồng đỏ","Hồng vàng"]', 'Đỏ - vàng', NULL, 1, 0, 70),
  ('sunlit-joy', 'TF-BQ-008', 'sunlit-joy', 'Sunlit Joy', 'Hướng dương và hoa đồng nội', 'Một bó hoa vui tươi với hướng dương làm tâm điểm, điểm hoa trắng và lá xanh, thích hợp cho lễ tốt nghiệp và khởi đầu mới.', 'Bó hoa', 'Hè', '/products/sunlit-joy.png', '["/products/sunlit-joy.png","/products/spring-lullaby.png","/products/morning-mist.png"]', '["Tốt nghiệp","Chúc mừng","Sinh nhật"]', '["Hướng dương","Cúc tana","Lá bạc"]', 'Vàng - xanh', NULL, 1, 0, 80);

INSERT OR IGNORE INTO product_variants (id, product_id, name, price, compare_at_price, stock, active)
VALUES
  ('amour-bleu-standard', 'amour-bleu', 'Tiêu chuẩn', 890000, 990000, 12, 1),
  ('pastel-poetry-standard', 'pastel-poetry', 'Tiêu chuẩn', 790000, NULL, 9, 1),
  ('morning-mist-standard', 'morning-mist', 'Tiêu chuẩn', 690000, NULL, 8, 1),
  ('garden-whisper-standard', 'garden-whisper', 'Tiêu chuẩn', 590000, NULL, 16, 1),
  ('spring-lullaby-standard', 'spring-lullaby', 'Tiêu chuẩn', 750000, NULL, 6, 1),
  ('blue-sonata-standard', 'blue-sonata', 'Tiêu chuẩn', 1090000, NULL, 5, 1),
  ('romance-deep-standard', 'romance-deep', 'Tiêu chuẩn', 820000, NULL, 11, 1),
  ('sunlit-joy-standard', 'sunlit-joy', 'Tiêu chuẩn', 490000, NULL, 18, 1);

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
  ('cod_enabled', 'true'),
  ('momo_enabled', 'true');

UPDATE site_settings
SET value = 'NGUYỄN LÂM GIA BẢO', updated_at = datetime('now')
WHERE key = 'momo_owner' AND value = 'Chờ chủ shop xác nhận';
