import { expect, test } from "@playwright/test";

test("signup shows four OTP boxes, resend cooldown and change-email action", async ({ page }) => {
  await page.route("**/api/auth/signup-otp", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { email: "tram@example.com", expiresInSeconds: 300, retryAfterSeconds: 120 } }),
    });
  });
  await page.goto("/tai-khoan");
  if (await page.getByText(/Xác thực thật chưa được cấu hình/).isVisible().catch(() => false)) test.skip();

  await page.getByRole("button", { name: "Đăng ký ngay" }).click();
  await page.getByLabel("Họ và tên").fill("Nguyễn Hà Trâm");
  await page.getByLabel("Email", { exact: true }).fill("tram@example.com");
  await page.locator('input[name="password"]').fill("hoa-mua-xuan-2026");
  await page.getByRole("button", { name: "Đăng ký và nhận OTP" }).click();

  const otpGroup = page.getByRole("group", { name: "Mã OTP 4 số" });
  await expect(otpGroup).toBeVisible();
  await expect(otpGroup.locator("input")).toHaveCount(4);
  await otpGroup.locator("input").first().focus();
  await page.keyboard.type("1234");
  await expect(otpGroup.locator("input").nth(0)).toHaveValue("1");
  await expect(otpGroup.locator("input").nth(3)).toHaveValue("4");
  await expect(page.getByRole("button", { name: "Xác nhận mã OTP" })).toBeEnabled();
  await expect(page.getByRole("button", { name: /Gửi lại sau 2:00/ })).toBeDisabled();

  await page.getByRole("button", { name: "Đổi email" }).click();
  await expect(page.getByRole("heading", { name: "Tạo tài khoản" })).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeEditable();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("tram@example.com");
});
