import type { Metadata } from "next";
import { OrderTracker } from "../../components/order-tracker";
export const metadata: Metadata = { title: "Tra cứu đơn hàng" };
export default async function Page({ searchParams }: { searchParams: Promise<{ code?: string }> }) { const { code } = await searchParams; return <section className="section tracker-section"><div className="container"><OrderTracker initialCode={code ?? ""} /></div></section>; }
