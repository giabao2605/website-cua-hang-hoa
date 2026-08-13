import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/hoa",
  "/hoa/amour-bleu",
  "/gio-hang",
  "/thanh-toan",
  "/tra-cuu-don",
  "/tai-khoan",
  "/gioi-thieu",
  "/chinh-sach-giao-hang",
  "/lien-he",
  "/nhat-ky",
  "/nhat-ky/giu-cam-tu-cau-tuoi-lau-ngay-he",
  "/admin",
] as const;

test("all pages use the shared Vietnamese typography system", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const audit = await page.evaluate(() => {
      const undersized = [...document.querySelectorAll<HTMLElement>("body *")].flatMap((element) => {
        if (element.closest(".form-honeypot, [hidden], [aria-hidden='true']")) return [];
        const hasOwnText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        const isControl = ["BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(element.tagName);
        if (!hasOwnText && !isControl) return [];
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (!rect.width || !rect.height || style.display === "none" || style.visibility === "hidden") return [];
        const size = Number.parseFloat(style.fontSize);
        return size < 12 ? [{ tag: element.tagName.toLowerCase(), className: element.className, size, text: element.textContent?.trim().slice(0, 80) }] : [];
      });
      const firstHeading = document.querySelector<HTMLElement>("h1, h2, h3");

      return {
        bodyFont: getComputedStyle(document.body).fontFamily,
        headingFont: firstHeading ? getComputedStyle(firstHeading).fontFamily : "",
        fontsStatus: document.fonts.status,
        undersized,
      };
    });

    expect.soft(audit.bodyFont, `${route} phải dùng Be Vietnam Pro`).toContain("Be Vietnam Pro");
    expect.soft(audit.headingFont, `${route} phải dùng Playfair Display cho tiêu đề`).toContain("Playfair Display");
    expect.soft(audit.fontsStatus, `${route} phải tải xong font`).toBe("loaded");
    expect.soft(audit.undersized, `${route} không được có chữ hiển thị nhỏ hơn 12px`).toEqual([]);
  }
});
