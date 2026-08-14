# Trâm Florist

Website bán hoa tươi theo mùa, giao diện tiếng Việt, responsive và có đầy đủ luồng mua hàng cơ bản.

## Tính năng

- Danh mục 12 sản phẩm, tìm kiếm, lọc, chi tiết hoa và giỏ hàng.
- Thanh toán COD hoặc MoMo, tính phí giao ở máy chủ và tra cứu đơn.
- Đăng ký OTP email, đăng nhập Supabase và trang tài khoản khách hàng.
- Quản trị sản phẩm, tồn kho, đơn hàng, tài khoản, tuyến giao và cấu hình cửa hàng.
- Form tư vấn, nhận tin, nhật ký hoa, SEO và sitemap.

## Chạy local

Yêu cầu Node.js 22.13 trở lên và một dự án Supabase.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run setup:local
npm run dev
```

Mở `http://localhost:3000`.

Các biến cần cấu hình nằm trong `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `OTP_HMAC_SECRET`
- `BREVO_API_KEY`
- `ADMIN_EMAILS`

Không commit `.env.local`, secret key, API key, OTP secret hoặc mật khẩu.

## Dữ liệu

- Cloudflare D1 lưu sản phẩm, đơn hàng, tài khoản, phí giao và dữ liệu vận hành.
- R2 lưu ảnh do quản trị viên tải lên.
- Migration nằm trong `drizzle/`; dữ liệu mẫu nằm trong `db/seed.sql`.

## Kiểm thử

```powershell
npm run verify
```

Hoặc chạy riêng:

```powershell
npm run test:coverage
npm run test:integration
npm run test:rendered
npm run test:e2e
```

## Trước khi vận hành thật

- Kiểm tra QR MoMo, bảng phí giao và thông tin chủ cửa hàng.
- Xác minh Brevo sender, OTP, Google login và quyền admin.
- Cập nhật callback Supabase/Google và `NEXT_PUBLIC_SITE_URL` theo domain thật.
- Sao lưu D1/R2 và chạy lại `npm run verify`.

Dự án chưa được triển khai lên host hoặc domain nào.
