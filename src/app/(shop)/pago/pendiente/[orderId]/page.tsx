import type { Metadata } from "next";
import { PaymentPending } from "@/components/shop/PaymentPending";

export const metadata: Metadata = { title: "Pago en proceso — Compuelite" };

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <PaymentPending orderId={orderId} />;
}
