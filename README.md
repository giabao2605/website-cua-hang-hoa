# Trâm Florist

Website thương mại điện tử bán hoa tươi theo mùa, giao diện tiếng Việt và responsive. Dự án hiện được cấu hình để chạy local, dùng Supabase Auth cho tài khoản khách và Cloudflare D1/R2 cho dữ liệu cửa hàng.

## Tính năng chính

- Trang chủ, danh mục, lọc và tìm hoa, chi tiết sản phẩm, giỏ hàng.
- Checkout COD hoặc MoMo, phí giao theo khu vực được tính lại ở máy chủ. MoMo dùng QR nhận tiền cá nhân của chủ shop, yêu cầu khách tự nhập tổng đơn cùng mã đơn và có nút báo đã chuyển khoản.
- Tra cứu đơn bằng mã đơn và số điện thoại.
- Đăng ký, đăng nhập bằng email/mật khẩu, xác nhận OTP qua email và Google OAuth.
- Trang tài khoản hiển thị lịch sử đơn của người dùng đã đăng nhập.
- Khu quản trị được bảo vệ ở máy chủ: quản lý sản phẩm, tồn kho, đơn hàng, trạng thái thanh toán, thêm/sửa tuyến giao, cấu hình cửa hàng và yêu cầu tư vấn.
- Form liên hệ, đăng ký nhận thư mùa hoa và trang nhật ký có bài viết chi tiết, bài liên quan.
- Typography thống nhất bằng Be Vietnam Pro cho nội dung và Playfair Display cho tiêu đề.
- SEO cơ bản gồm metadata, Open Graph, `robots.txt` và `sitemap.xml`.

## Công nghệ

- React 19, TypeScript, Vinext và Vite.
- Supabase Auth.
- Cloudflare D1, R2 và Wrangler cho môi trường local.
- Drizzle ORM, Zod và Lucide React.
- Node test runner và Playwright.

## Yêu cầu

- Node.js 22.13 trở lên.
- npm.
- Một dự án Supabase đã cấu hình Email và Google provider.

## Chạy trên localhost

```powershell
npm ci
Copy-Item .env.example .env.local
npm run setup:local
npm run dev
```

Mở `http://localhost:3000`.

`npm run setup:local` áp dụng migration D1 và nạp tám sản phẩm cùng bốn tuyến giao mặc định. Seed sử dụng `INSERT OR IGNORE`, vì vậy có thể chạy lại mà không tạo bản ghi trùng.

Nếu database local đã tồn tại từ trước khi bộ ảnh catalog mới được thêm, chạy một lần:

```powershell
npx wrangler d1 execute tram-florist-local-db --local --file db/refresh-generated-assets.sql
```

## Biến môi trường

Sao chép `.env.example` thành `.env.local`, sau đó điền cấu hình thật:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
ADMIN_EMAILS=owner@example.com
```

`ADMIN_EMAILS` nhận một hoặc nhiều email, phân tách bằng dấu phẩy. Người dùng vẫn phải đăng nhập và xác nhận email hợp lệ trước khi được mở `/admin`.

Không đưa service role key, Google Client Secret, mật khẩu hoặc file `.env.local` lên GitHub. Frontend chỉ sử dụng Supabase publishable key.

## Cấu hình Supabase Auth

1. Đặt Site URL thành `http://localhost:3000`.
2. Thêm Redirect URL `http://localhost:3000/auth/callback`.
3. Bật Email provider, yêu cầu xác nhận email và bật Google provider.
4. Trong mẫu email Confirm signup, hiển thị OTP bằng biến `{{ .Token }}`.
5. Trong Google Cloud Console, đặt Authorized redirect URI thành callback Supabase cung cấp, thường là `https://PROJECT_REF.supabase.co/auth/v1/callback`.
6. Khi dùng domain thật, cập nhật Site URL, Redirect URL, `NEXT_PUBLIC_SITE_URL` và cấu hình custom SMTP.

Ví dụ phần nội dung email OTP:

```html
<h2>Xác nhận tài khoản Trâm Florist</h2>
<p>Mã OTP của bạn là:</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">{{ .Token }}</p>
<p>Mã chỉ dùng một lần. Không chia sẻ mã này cho người khác.</p>
```

## Dữ liệu và lưu trữ

- D1 lưu sản phẩm, biến thể, phí giao, đơn hàng, lịch sử trạng thái, hồ sơ khách, yêu cầu tư vấn, danh sách nhận tin và bằng chứng thanh toán.
- R2 lưu ảnh do quản trị viên tải lên. API chỉ nhận JPEG, PNG hoặc WebP hợp lệ, tối đa 5 MB.
- Migration nằm trong `drizzle/`; dữ liệu mẫu nằm trong `db/seed.sql`.
- Giá tiền được lưu bằng số nguyên VND và được tính lại ở phía máy chủ.

Phí giao mẫu hiện tại:

| Tuyến | Phí |
|---|---:|
| Xã Tuy An Bắc | 25.000đ |
| Khu vực khác tại Đắk Lắk | 50.000đ |
| Tây Nguyên và Nam Trung Bộ | 85.000đ |
| Các tỉnh thành còn lại | 120.000đ |

Quản trị viên có thể thêm tuyến mới, chỉnh phí, thời gian dự kiến, độ ưu tiên và trạng thái hoạt động của từng tuyến.

## Thanh toán

- COD bắt đầu ở trạng thái chờ xác nhận và chỉ ghi nhận đã thu sau khi giao.
- MoMo hiện dùng QR nhận tiền cá nhân tại `public/payment/momo-nguyen-lam-gia-bao.png`. Khách quét QR, tự nhập đúng tổng đơn và dùng mã đơn làm nội dung chuyển tiền.
- Nút `Đã thanh toán` chuyển đơn sang trạng thái chờ đối soát và gửi lời cảm ơn cho khách; nút này không tự xác nhận shop đã nhận tiền.
- Quản trị viên phải kiểm tra giao dịch và ghi chú căn cứ trước khi xác nhận đã thanh toán.
- QR tự điền số tiền chỉ nên triển khai sau khi có MoMo Business/Merchant API và quyền dùng QR production.

## Kiểm thử

Chạy toàn bộ kiểm tra trước khi đưa mã lên GitHub:

```powershell
npm run verify
```

Lệnh này chạy lint, typecheck, unit test với ngưỡng coverage tối thiểu 80%, integration test, production build, kiểm thử HTML phía máy chủ và Playwright E2E trên desktop/mobile. Bộ E2E bao gồm luồng đặt và tra cứu đơn, liên hệ, auth boundary, nhật ký và kiểm tra font/cỡ chữ trên các trang chính.

Các lệnh riêng:

```powershell
npm run test:coverage
npm run test:integration
npm run test:rendered
npm run test:e2e
npm run db:generate
npm run setup:local
```

## Cấu trúc chính

```text
app/          Trang, API route và stylesheet toàn site
components/   Thành phần giao diện và form tương tác
lib/          Logic nghiệp vụ, xác thực, catalog và truy cập dữ liệu
db/           Schema và dữ liệu mẫu
drizzle/      Migration D1
public/       Logo, ảnh sản phẩm và ảnh chia sẻ
tests/        Unit, integration, rendered HTML và E2E
worker/       Cloudflare worker entry
```

## Trước khi vận hành thật

- Quét thử QR MoMo trên thiết bị thật, xác nhận đúng chủ tài khoản, giờ mở cửa và bảng phí giao.
- Thay ảnh mẫu bằng ảnh chụp sản phẩm thật nếu có.
- Kiểm tra SMTP, OTP, Google login và quyền admin bằng tài khoản thật.
- Cập nhật callback Supabase/Google cho domain chính thức.
- Chạy `npm run verify`, sao lưu D1/R2 và kiểm tra lại biến môi trường.

Dự án chưa được triển khai lên host hoặc domain nào.
