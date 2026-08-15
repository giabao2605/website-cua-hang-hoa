import { expect, test } from "@playwright/test";

test("empty cart invites customers back to three featured designs", async ({ page }) => {
  await page.goto("/gio-hang");

  await expect(page.getByRole("heading", { name: "Giỏ hoa đang chờ bạn chọn" })).toBeVisible();
  await expect(page.getByText("TF", { exact: true })).toHaveCount(0);
  const recommendations = page.locator(".empty-cart-recommendations .product-card");
  await expect(recommendations).toHaveCount(3);
  await expect(recommendations.first()).toBeVisible();
  await expect(recommendations.last()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Chọn hoa ngay" }).click();
  await expect(page).toHaveURL(/\/hoa$/);

  await page.goto("/thanh-toan");
  await expect(page.locator(".empty-checkout")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chưa có sản phẩm để thanh toán" })).toBeVisible();
});

test("catalog exposes exactly the 12 new designs", async ({ page }) => {
  await page.goto("/hoa");

  await expect(page.locator(".catalog-grid .product-card")).toHaveCount(12);
  await expect(page.getByText("12 thiết kế", { exact: true })).toBeVisible();
  for (const name of [
    "Vườn Trong Nắng",
    "Nắng Gọi Niềm Vui",
    "Hẹn Nhau Mùa Hồng",
    "Dạo Chơi Trong Vườn",
    "Chuông Trắng Bình Yên",
    "Trăng Xanh",
    "Vườn Cổ Tích",
    "Chạm Mây",
    "Tú Cầu Bé Xinh",
    "Sắc Màu Lễ Hội",
    "Sánh Đôi Hồng Lam",
    "Mây Lam",
  ]) {
    await expect(page.locator(".catalog-grid").getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await expect(page.locator(".catalog-grid")).not.toContainText(/Tình Xanh|Vần Thơ Màu Phấn|Sương Mai|Lời Thì Thầm Của Vườn|Khúc Ru Mùa Xuân|Khúc Xanh|Tình Nồng|Nắng Vui|Mẹ Ơi|Ghé Thăm|Bụi Phấn|Lời Hẹn Đỏ|Nhà Có Em|Hiên Nhà Mới|Lộc Xuân|Ngày Chung Đôi|Sánh Bước|Mở Lối|Một Lời Tiễn|Bàn Tiệc Chớm Thu/);
});

test("homepage prioritizes real shopping choices without fabricated proof", async ({ page }, testInfo) => {
  await page.goto("/");

  const hero = page.locator(".hero");
  await expect(hero).toBeVisible();
  await expect(hero.locator(".hero-proof, .hero-season-card")).toHaveCount(0);
  await expect(hero.locator(".hero-edition")).toHaveCount(0);
  await expect(hero).not.toContainText(/Hoa tươi tuyển chọn mỗi ngày|Mùa này Trâm có/);

  const occasion = page.locator(".occasion-section");
  const featured = page.locator(".collection-section");
  const occasionIntro = occasion.locator(".occasion-intro");
  await expect(occasionIntro).toBeVisible();
  await expect(occasion.locator(".occasion-rail")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const [heroBox, occasionIntroBox] = await Promise.all([hero.boundingBox(), occasionIntro.boundingBox()]);
  const occasionGap = occasionIntroBox!.y - (heroBox!.y + heroBox!.height);
  expect(occasionGap).toBeGreaterThanOrEqual(-1);
  expect(occasionGap).toBeLessThanOrEqual(24);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const [occasionBox, featuredBox] = await Promise.all([occasion.boundingBox(), featured.boundingBox()]);
  expect(occasionBox?.y).toBeLessThan(featuredBox?.y ?? 0);

  const trust = page.locator(".trust-strip.trust-band");
  await expect(trust.locator(".trust-grid")).toBeVisible();
  await expect(trust.locator(".seasonal-marquee")).toBeVisible();
  await expect(page.locator(".seasonal-editorial")).toHaveCount(0);

  const featuredCards = page.locator(".featured-product-grid .product-card");
  await expect(featuredCards).toHaveCount(8);
  await expect(featured.locator(".featured-lead")).toHaveCount(1);
  await expect(featuredCards.getByRole("heading", { name: "Dạo Chơi Trong Vườn" })).toBeVisible();
  await expect(featured.getByRole("link", { name: "Xem đủ 12 thiết kế" })).toHaveAttribute("href", "/hoa");
  if (testInfo.project.name === "desktop") {
    const [leadBox, regularBox] = await Promise.all([featuredCards.nth(0).boundingBox(), featuredCards.nth(1).boundingBox()]);
    expect(leadBox?.width).toBeGreaterThan((regularBox?.width ?? 0) * 1.5);
  }
  const firstCard = featuredCards.first();
  const [firstCardBox, firstImageBox, productInfoBox, productBuyBox, cartButtonBox] = await Promise.all([
    firstCard.boundingBox(),
    firstCard.locator(".product-image").boundingBox(),
    firstCard.locator(".product-info").boundingBox(),
    firstCard.locator(".product-buy").boundingBox(),
    firstCard.locator(".add-card-button").boundingBox(),
  ]);
  expect(Math.abs(productBuyBox!.x - productInfoBox!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(productBuyBox!.x + productBuyBox!.width - (productInfoBox!.x + productInfoBox!.width))).toBeLessThanOrEqual(1);
  expect(Math.abs(cartButtonBox!.x + cartButtonBox!.width - (firstCardBox!.x + firstCardBox!.width))).toBeLessThanOrEqual(1);
  expect(firstImageBox!.height).toBeLessThanOrEqual(firstImageBox!.width * 1.4);
  await expect(firstCard.locator(".add-card-button svg")).toBeVisible();

  const story = page.locator(".story-feature");
  await expect(story.locator("blockquote.story-quote")).toBeVisible();
  await expect(page.locator(".quote-section")).toHaveCount(0);

  expect(await page.locator("main .section-index").count()).toBeGreaterThanOrEqual(4);

  const delivery = page.locator(".delivery-ritual");
  await expect(delivery.locator(".delivery-ritual-steps article")).toHaveCount(3);
  await expect(delivery).toContainText(/kiểm tra hoa đang có/i);
  await expect(delivery).toContainText(/báo phí giao/i);
  await expect(delivery).toContainText(/giao theo giờ đã hẹn/i);
  await expect(delivery.getByRole("link", { name: "Xem tuyến và phí giao" })).toHaveAttribute("href", "/chinh-sach-giao-hang");
  await expect(delivery).not.toContainText(/Phí giao tạm tính/);
  expect(await delivery.locator(".delivery-ritual-steps h3").evaluateAll((titles) => titles.every((title) => getComputedStyle(title).whiteSpace === "nowrap"))).toBe(true);

  const journalCards = page.locator(".journal-section .journal-grid article");
  await expect(journalCards).toHaveCount(3);
  if (testInfo.project.name === "desktop") {
    await page.locator(".journal-section").scrollIntoViewIfNeeded();
    const journalBoxes = await journalCards.evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect()).map((box) => ({ top: box.top, bottom: box.bottom })));
    expect(journalBoxes[2].top).toBeLessThan(journalBoxes[0].bottom);
    expect(journalBoxes[2].top).toBeLessThan(page.viewportSize()!.height);
    await expect.poll(() => journalCards.nth(2).evaluate((card) => Number(getComputedStyle(card).opacity))).toBeGreaterThan(0.99);
    const sideImageCoverage = await journalCards.locator(".journal-image-link").evaluateAll((links) => links.slice(1).map((link) => {
      const linkBox = link.getBoundingClientRect();
      const imageBox = link.querySelector("img")!.getBoundingClientRect();
      return { widthGap: Math.abs(linkBox.width - imageBox.width), heightGap: Math.abs(linkBox.height - imageBox.height) };
    }));
    expect(sideImageCoverage.every(({ widthGap, heightGap }) => widthGap <= 1 && heightGap <= 1)).toBe(true);
  }
  await journalCards.last().scrollIntoViewIfNeeded();
  for (const card of await journalCards.all()) await expect(card).toBeVisible();

  await expect(page.locator(".customer-review, .customer-reviews, .testimonial, .testimonials, .review-stars")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/đánh giá từ khách|khách hàng nói/i);
  const titlesDoNotWrap = await featuredCards.locator("h3").evaluateAll((titles) => titles.every((title) => getComputedStyle(title).whiteSpace === "nowrap"));
  expect(titlesDoNotWrap).toBe(true);

  const seal = page.locator(".round-seal");
  await expect(seal).toBeVisible();
  const sealIsClear = await page.evaluate(() => {
    const sealBox = document.querySelector(".round-seal")!.getBoundingClientRect();
    const copyBox = document.querySelector(".story-copy")!.getBoundingClientRect();
    return sealBox.right <= copyBox.left || sealBox.left >= copyBox.right || sealBox.bottom <= copyBox.top || sealBox.top >= copyBox.bottom;
  });
  expect(sealIsClear).toBe(true);
  const normalMotion = await seal.evaluate((element) => {
    const style = getComputedStyle(element);
    return { name: style.animationName, duration: Number.parseFloat(style.animationDuration), iterations: style.animationIterationCount };
  });
  expect(normalMotion.name).not.toBe("none");
  expect(normalMotion.duration).toBeGreaterThanOrEqual(12);
  expect(normalMotion.iterations).toBe("infinite");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => seal.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("seasonal flowers and gift occasions are separate shopping journeys", async ({ page }) => {
  await page.goto("/");

  const occasionNavLink = page.locator("header").getByRole("link", { name: "Dịp tặng", exact: true });
  const mobileMenuButton = page.getByRole("button", { name: "Mở menu" });
  if (!await occasionNavLink.isVisible()) await mobileMenuButton.click();
  await expect(occasionNavLink).toBeVisible();
  await expect(occasionNavLink).toHaveAttribute("href", "/dip-tang");
  if (await mobileMenuButton.isVisible()) await mobileMenuButton.click();
  const birthdayLink = page.locator(".occasion-grid").getByRole("link", { name: /Sinh nhật/ });
  await expect(birthdayLink).toHaveAttribute("href", /\/dip-tang\?occasion=Sinh(?:%20|\+)nh%E1%BA%ADt#goi-y/);
  await birthdayLink.click();

  await expect(page).toHaveURL(/\/dip-tang\?occasion=Sinh(?:%20|\+)nh%E1%BA%ADt#goi-y$/);
  await expect(page.locator(".occasion-page-hero").getByRole("heading", { level: 1 })).toContainText("Chọn một khoảnh khắc");
  const occasionPickerTitle = page.getByRole("heading", { name: "Bạn đang chọn hoa cho dịp nào?" });
  await expect(occasionPickerTitle).toBeVisible();
  expect(await occasionPickerTitle.evaluate((heading) => heading.innerHTML)).toMatch(/Bạn đang chọn hoa\s*<br\s*\/?>\s*cho dịp nào\?/i);
  await expect(page.locator(".occasion-product-grid .product-card")).toHaveCount(8);
  await expect(page.locator(".occasion-product-grid").getByRole("heading", { name: "Vườn Trong Nắng" })).toBeVisible();
  await expect(page.locator(".occasion-product-grid").getByRole("heading", { name: "Hẹn Nhau Mùa Hồng" })).toHaveCount(0);
  expect(await page.locator(".occasion-product-grid .product-card h3").evaluateAll((titles) => titles.every((title) => getComputedStyle(title).whiteSpace === "nowrap"))).toBe(true);

  await page.goto("/dip-tang");
  const collageCaption = page.locator(".occasion-hero-collage > span");
  if (await collageCaption.isVisible()) {
    expect(await collageCaption.evaluate((caption) => getComputedStyle(caption).color)).not.toBe("rgb(11, 35, 72)");
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.locator(".occasion-picker-heading, .occasion-group-card, .occasion-guide header, .occasion-guide li, .occasion-results-heading, .occasion-product-grid .product-card").evaluateAll((elements) => elements.every((element) => {
    const style = getComputedStyle(element);
    return Number.parseFloat(style.opacity) >= .99 && style.filter === "none";
  }))).toBe(true);

  await page.goto("/hoa");
  await expect(page.locator(".seasonal-page-hero").getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bạn đang chọn hoa cho dịp nào" })).toHaveCount(0);
});

test("story, delivery, and contact guide customers through distinct journeys", async ({ page }, testInfo) => {
  const journeys = [
    ["/gioi-thieu", ".story-page-hero", ".story-chapters"],
    ["/chinh-sach-giao-hang", ".delivery-page-hero", ".delivery-route-board"],
    ["/lien-he", ".contact-page-hero", ".contact-concierge"],
  ] as const;
  const headings = new Set<string>();

  for (const [path, hero, section] of journeys) {
    await page.goto(path);
    await expect(page.locator(hero)).toBeVisible();
    await expect(page.locator(section)).toBeVisible();
    const heading = await page.locator(hero).getByRole("heading", { level: 1 }).innerText();
    headings.add(heading.trim());
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  expect(headings.size).toBe(3);

  await page.goto("/gioi-thieu");
  const storyPlaceLine = page.locator(".story-place-line");
  expect(await storyPlaceLine.evaluate((line) => {
    const range = document.createRange();
    range.selectNodeContents(line);
    return range.getClientRects().length;
  })).toBe(1);
  const chapterEyebrowContrast = await page.locator(".story-chapters header .eyebrow").evaluate((eyebrow) => {
    const parse = (value: string) => value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const luminance = (rgb: number[]) => {
      const values = rgb.map((value) => value / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
      return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
    };
    const foreground = luminance(parse(getComputedStyle(eyebrow).color));
    const background = luminance(parse(getComputedStyle(eyebrow.closest(".story-chapters")!).backgroundColor));
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
  expect(chapterEyebrowContrast).toBeGreaterThanOrEqual(3);
  await expect(page.locator(".story-chapter-list article").nth(1).getByRole("heading", { level: 3 })).toHaveText("Dưỡng và ghép");
  if (testInfo.project.name === "desktop") {
    expect(await page.locator(".story-principles h2, .story-principle-list h3").evaluateAll((titles) => titles.every((title) => getComputedStyle(title).whiteSpace === "nowrap"))).toBe(true);
  }
  const closingHasTreatment = await page.locator(".story-page-closing figure").evaluate((figure) => {
    const style = getComputedStyle(figure);
    const after = getComputedStyle(figure, "::after");
    return style.clipPath !== "none" || Number.parseFloat(style.borderRadius) > 0 || (after.content !== "none" && after.content !== "normal");
  });
  expect(closingHasTreatment).toBe(true);

  await page.goto("/chinh-sach-giao-hang");
  const routeBoard = page.locator(".delivery-route-board");
  await expect(routeBoard).toContainText("Xã Tuy An Bắc");
  await expect(routeBoard).toContainText(/25\.000\s*(?:₫|đ)/);
  const consultationLink = page.locator('a[href="/lien-he#tu-van"]');
  await expect(consultationLink).toBeVisible();
  await consultationLink.click();
  await expect(page).toHaveURL(/\/lien-he#tu-van$/);
  await expect(page.locator("form#tu-van")).toBeVisible();
});

test("search opens as an accessible focused dialog and closes with Escape", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tìm hoa" }).click();
  const dialog = page.getByRole("dialog", { name: "Tìm kiếm hoa" });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("textbox", { name: "Tìm bó hoa cho khoảnh khắc của bạn" });
  await expect(input).toBeFocused();
  const focusable = dialog.locator('a[href], input, button').filter({ visible: true });
  const closeButton = dialog.getByRole("button", { name: "Đóng tìm kiếm" });
  await closeButton.focus();
  await page.keyboard.press("Tab");
  await expect(focusable.first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("legacy cart storage is not hydrated into the new catalog", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("tram-florist-cart-v1", JSON.stringify([{
      productId: "retired-demo-product",
      slug: "retired-demo-product",
      name: "Sản phẩm demo đã ngừng bán",
      sku: "TF-OLD-999",
      image: "/products/retired-demo-product.webp",
      price: 1,
      quantity: 1,
    }]));
  });
  await page.goto("/gio-hang");

  await expect(page.getByRole("heading", { name: "Giỏ hoa đang chờ bạn chọn" })).toBeVisible();
  await expect(page.getByText("Sản phẩm demo đã ngừng bán")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("tram-florist-cart-v2"))).toBe("[]");
});

test("cart makes quantity and line totals explicit", async ({ page }) => {
  await page.goto("/hoa");
  await page.getByRole("button", { name: /Thêm Vườn Trong Nắng vào giỏ/ }).click();
  await page.getByRole("link", { name: /Giỏ hàng/ }).click();
  const item = page.locator(".cart-item").filter({ hasText: "Vườn Trong Nắng" });
  const decrease = item.getByRole("button", { name: "Giảm số lượng Vườn Trong Nắng" });
  const increase = item.getByRole("button", { name: "Tăng số lượng Vườn Trong Nắng" });
  await increase.click();

  await expect(page.getByRole("heading", { name: "1 mẫu hoa · 2 sản phẩm" })).toBeVisible();
  await expect(item.locator(".quantity-control > span")).toHaveText("2");
  await expect(item.getByText(/690\.000\s*[₫đ] × 2/)).toBeVisible();
  await expect(item.getByText("Thành tiền", { exact: true })).toBeVisible();
  await expect(item.getByText(/1\.380\.000\s*[₫đ]/)).toBeVisible();
  await expect(page.getByLabel("Mã ưu đãi")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Áp dụng" })).toHaveCount(0);
  await expect(item.getByRole("button", { name: "Xóa Vườn Trong Nắng khỏi giỏ" })).toBeVisible();
  await expect(page.getByText("Tổng tạm tính", { exact: true })).toBeVisible();
  const summaryTotal = page.locator(".summary-total strong");
  await expect(summaryTotal).toHaveText(/1\.380\.000\s*[₫đ]/);
  const subtotalFont = await page.locator(".summary-row strong").first().evaluate((element) => getComputedStyle(element).fontFamily);
  const totalFont = await summaryTotal.evaluate((element) => getComputedStyle(element).fontFamily);
  expect(totalFont).toBe(subtotalFont);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const control of [decrease, increase]) {
    const box = await control.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await decrease.click();
  await expect(item.locator(".quantity-control > span")).toHaveText("1");
  await expect(decrease).toBeDisabled();
  await expect(page.getByRole("heading", { name: "1 mẫu hoa · 1 sản phẩm" })).toBeVisible();
});

test("customer can browse, report a MoMo payment, and track a real order", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Để hoa nói hộ/ })).toBeVisible();
  await page.getByRole("link", { name: /Chọn hoa ngay/ }).click();
  await expect(page.locator(".seasonal-page-hero").getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /Thêm Vườn Trong Nắng vào giỏ/ }).click();
  await expect(page.getByRole("link", { name: /Giỏ hàng, 1 sản phẩm/ })).toBeVisible();
  await page.getByRole("link", { name: /Giỏ hàng/ }).click();
  await expect(page.getByRole("heading", { name: "1 mẫu hoa · 1 sản phẩm" })).toBeVisible();
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
  await expect(page.getByText("715.000", { exact: false })).toBeVisible();
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
  const deleteContactResponse = await page.request.delete("/api/admin/contacts/00000000-0000-4000-8000-000000000000");
  expect(deleteContactResponse.status()).toBe(401);
  const profileResponse = await page.request.patch("/api/account/profile", {
    data: { fullName: "Nguyễn Hà Trâm", phone: "0838469089", address: "Đắk Lắk" },
  });
  expect(profileResponse.status()).toBe(401);
  const accountResponse = await page.request.patch("/api/admin/accounts/00000000-0000-4000-8000-000000000000", {
    data: { disabled: true },
  });
  expect(accountResponse.status()).toBe(401);
  const deleteAccountResponse = await page.request.delete("/api/admin/accounts/00000000-0000-4000-8000-000000000000", {
    data: { confirmEmail: "member@example.com" },
  });
  expect(deleteAccountResponse.status()).toBe(401);
  const archiveOrderResponse = await page.request.patch("/api/admin/orders/00000000-0000-4000-8000-000000000000/archive", {
    data: { archived: true, version: 1 },
  });
  expect(archiveOrderResponse.status()).toBe(401);
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

test("editorial imagery is dedicated, loaded, and responsive", async ({ page }) => {
  const surfaces = [
    ["/", ".occasion-rail img, .story-photos img, .journal-grid img"],
    ["/hoa", ".seasonal-hero-visual img"],
    ["/dip-tang", ".occasion-hero-collage img"],
    ["/gioi-thieu", ".story-page-hero-images img, .story-page-closing img"],
    ["/chinh-sach-giao-hang", ".delivery-page-hero figure img"],
    ["/lien-he", ".contact-page-hero figure img"],
  ] as const;

  for (const [path, selector] of surfaces) {
    await page.goto(path);
    const images = page.locator(selector);
    expect(await images.count()).toBeGreaterThan(0);
    for (const image of await images.all()) {
      await expect.poll(() => image.getAttribute("src").then((src) => decodeURIComponent(src ?? ""))).toContain("/editorial/");
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
