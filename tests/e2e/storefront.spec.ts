import { expect, test } from "@playwright/test";

test("customer can browse, report a MoMo payment, and track a real order", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Để hoa nói hộ/ })).toBeVisible();
  await page.getByRole("link", { name: /Chọn hoa ngay/ }).click();
  await expect(page.getByRole("heading", { name: /Tìm bó hoa dành riêng/ })).toBeVisible();
  await page.getByRole("button", { name: /Thêm Amour Bleu vào giỏ/ }).click();
  await expect(page.getByRole("link", { name: /Giỏ hàng, 1 sản phẩm/ })).toBeVisible();
  await page.getByRole("link", { name: /Giỏ hàng/ }).click();
  await expect(page.getByRole("heading", { name: /1 thiết kế đã chọn/ })).toBeVisible();
  await page.getByRole("link", { name: /Tiến hành đặt hoa/ }).click();
  await expect(page.getByRole("heading", { name: /Thông tin đặt và nhận hoa/ })).toBeVisible();
  await expect(page.getByText("25.000", { exact: false })).toBeVisible();
  await page.getByLabel("Họ và tên", { exact: true }).fill("Nguyễn Hà Trâm");
  await page.getByLabel("Email", { exact: true }).fill("tram.e2e@example.com");
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0838469089");
  await page.getByLabel("Họ tên người nhận", { exact: true }).fill("Trần Minh Anh");
  await page.getByLabel("Số điện thoại người nhận", { exact: true }).fill("0912345678");
  await page.getByLabel("Địa chỉ chi tiết", { exact: true }).fill("Thôn 1");
  await page.getByText("Chuyển khoản MoMo", { exact: true }).click();
  await page.getByRole("button", { name: /Xác nhận đặt hoa/ }).click();
  await expect(page.getByRole("heading", { name: /Cảm ơn bạn đã chọn/ })).toBeVisible();
  const orderCode = (await page.locator(".checkout-success strong").first().textContent())?.trim();
  expect(orderCode).toMatch(/^TF[A-Z0-9]{10,20}$/);
  await expect(page.getByAltText(/Mã QR MoMo của/)).toBeVisible();
  await page.getByRole("button", { name: "Đã thanh toán" }).click();
  const paymentConfirmation = page.locator(".payment-report-success");
  await expect(paymentConfirmation).toContainText("Gửi xác nhận thành công");
  await expect(paymentConfirmation).toContainText("Cảm ơn bạn đã thanh toán");
  await page.getByRole("link", { name: /Theo dõi đơn hàng/ }).click();
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0838469089");
  await page.getByRole("button", { name: /Tra cứu đơn/ }).click();
  await expect(page.getByRole("heading", { name: orderCode })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Chờ xác nhận MoMo")).toBeVisible();
  await expect(page.getByText("915.000", { exact: false })).toBeVisible();
});

test("auth reflects real Supabase configuration and never uses a fake account", async ({ page }) => {
  await page.goto("/tai-khoan");
  const missingConfiguration = page.getByText(/Xác thực thật chưa được cấu hình/);
  if (await missingConfiguration.isVisible().catch(() => false)) {
    await expect(page.getByRole("button", { name: /Tiếp tục với Google/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /^Đăng nhập$/ })).toBeDisabled();
  } else {
    await expect(page.getByRole("button", { name: /Tiếp tục với Google/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /^Đăng nhập$/ })).toBeEnabled();
  }
  await expect(page.getByText(/tài khoản giả|chế độ thử nghiệm/i)).toHaveCount(0);
});

test("customer can send a consultation request and opt in to seasonal email", async ({ page }) => {
  await page.goto("/lien-he");
  await page.getByLabel("Họ và tên").fill("Nguyễn Hà Trâm");
  await page.getByLabel("Số điện thoại").fill("0838469089");
  await page.getByLabel("Email, không bắt buộc").fill("tram.contact@example.com");
  await page.getByLabel("Dịp tặng").selectOption("Kỷ niệm");
  await page.getByLabel("Điều bạn muốn chia sẻ").fill("Mình muốn tư vấn một bó hoa tông xanh nhạt và trắng.");
  await page.getByRole("button", { name: "Gửi yêu cầu" }).click();
  await expect(page.locator(".contact-form").getByRole("status")).toContainText("Trâm đã nhận yêu cầu");

  await page.getByLabel("Email nhận tin").fill("tram.season@example.com");
  await page.getByLabel(/Tôi đồng ý nhận tin/).check();
  await page.getByRole("button", { name: "Đăng ký" }).click();
  await expect(page.locator(".newsletter-form").getByRole("status")).toContainText("Đã đăng ký thư hoa theo mùa");
});

test("admin route is server protected", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /Bạn cần đăng nhập/ })).toBeVisible();
  const response = await page.request.get("/api/admin/health");
  expect(response.status()).toBe(401);
  const shippingResponse = await page.request.post("/api/admin/shipping", {
    data: { id: "unauthorized", name: "Tuyến trái phép", kind: "province", value: "Phú Yên", fee: 1, estimate: "Ngay", priority: 1, active: true },
  });
  expect(shippingResponse.status()).toBe(401);
  const settingsResponse = await page.request.patch("/api/admin/settings", {
    data: { shopName: "Không hợp lệ" },
  });
  expect(settingsResponse.status()).toBe(401);
});

test("journal links open the real index and matching article", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Xem thêm" }).click();
  await expect(page).toHaveURL(/\/nhat-ky$/);
  await page.getByRole("link", { name: /5 cách giữ cẩm tú cầu/ }).click();
  await expect(page).toHaveURL(/\/nhat-ky\/giu-cam-tu-cau-tuoi-lau-ngay-he$/);
  await expect(page.getByRole("heading", { name: /Cắt lại gốc ngay khi nhận hoa/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Có thể bạn cũng quan tâm" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chọn bảng màu hoa phù hợp/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Một buổi sáng kết hoa theo mùa/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Những thiết kế dành cho bạn" })).toHaveCount(0);
});
