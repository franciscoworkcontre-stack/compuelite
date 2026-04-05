import { type Metadata } from "next";
import { OrderConfirmation } from "@/components/shop/OrderConfirmation";

export const metadata: Metadata = {
  title: "Pedido confirmado — Compuelite",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderConfirmation orderId={id} />;
}
