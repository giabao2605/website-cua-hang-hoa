import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import { CartProvider } from "../components/cart-provider";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getSiteSettings } from "../lib/site-settings-store";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Trâm Florist | Hoa tươi theo mùa, giao toàn quốc",
    template: "%s | Trâm Florist",
  },
  description: "Hoa tươi theo mùa được kết thủ công tại Trâm Florist, giao tận nơi trên toàn quốc. Đặt hoa sinh nhật, kỷ niệm, chúc mừng và sự kiện.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/brand/tram-florist-logo.png",
    shortcut: "/brand/tram-florist-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Trâm Florist",
    title: "Trâm Florist | Hoa tươi theo mùa, giao toàn quốc",
    description: "Hoa tươi theo mùa được kết thủ công tại Tuy An Bắc, giao tận nơi trên toàn quốc.",
    images: [{
      url: "/brand/tram-florist-og-v2.jpg",
      width: 1200,
      height: 630,
      alt: "Trâm Florist - Hoa theo mùa, kết bằng tay",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trâm Florist | Hoa tươi theo mùa",
    description: "Hoa theo mùa, kết bằng tay.",
    images: ["/brand/tram-florist-og-v2.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} ${playfairDisplay.variable}`}>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
