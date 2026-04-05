import type { Metadata } from "next";
import { PaymentSuccess } from "@/components/shop/PaymentSuccess";

export const metadata: Metadata = { title: "Pago exitoso — Compuelite" };

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <PaymentSuccess orderId={orderId} />;
}
