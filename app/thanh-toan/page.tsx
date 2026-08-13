import type { Metadata } from "next";
import { CheckoutPage } from "../../components/checkout-page";
import { getShippingRules } from "../../lib/catalog-store";
import { getCurrentAuthUser } from "../../lib/supabase/server";
import { getSiteSettings } from "../../lib/site-settings-store";
export const metadata: Metadata = { title: "Thanh toán" };
export default async function Page() { const [shippingRules, user, settings] = await Promise.all([getShippingRules(), getCurrentAuthUser(), getSiteSettings()]); return <section className="section checkout-section"><div className="container"><CheckoutPage shippingRules={shippingRules} customerEmail={user?.email ?? ""} settings={settings} /></div></section>; }
