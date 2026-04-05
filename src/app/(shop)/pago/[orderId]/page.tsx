import type { Metadata } from "next";
import { PaymentSelector } from "@/components/shop/PaymentSelector";

export const metadata: Metadata = { title: "Seleccionar pago — Compuelite" };

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <PaymentSelector orderId={orderId} />;
}
