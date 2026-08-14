import type { Metadata } from "next";
import { CheckoutPage } from "../../components/checkout-page";
import { getShippingRules } from "../../lib/catalog-store";
import { getCustomerProfile } from "../../lib/customer-profile";
import { getCurrentAuthUser } from "../../lib/supabase/server";
import { getSiteSettings } from "../../lib/site-settings-store";

export const metadata: Metadata = { title: "Thanh toán" };

export default async function Page() {
  const [shippingRules, user, settings] = await Promise.all([getShippingRules(), getCurrentAuthUser(), getSiteSettings()]);
  const profile = user?.email && user.email_confirmed_at ? await getCustomerProfile({
    authUserId: user.id,
    email: user.email,
    fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
  }) : null;
  return <section className="section checkout-section"><div className="container"><CheckoutPage shippingRules={shippingRules} customerEmail={profile?.email ?? user?.email ?? ""} customerName={profile?.fullName} customerPhone={profile?.phone} customerAddress={profile?.address} settings={settings} /></div></section>;
}
