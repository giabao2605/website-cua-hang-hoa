import type { Metadata } from "next";
import { CartPage } from "../../components/cart-page";
import { getSiteSettings } from "../../lib/site-settings-store";

export const metadata: Metadata = { title: "Giỏ hàng" };
export default async function Page() { const settings = await getSiteSettings(); return <section className="section cart-section"><div className="container"><CartPage settings={settings} /></div></section>; }
