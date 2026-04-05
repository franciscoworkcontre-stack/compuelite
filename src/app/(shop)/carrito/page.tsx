import { type Metadata } from "next";
import { CartView } from "@/components/shop/CartView";

export const metadata: Metadata = {
  title: "Carrito — Compuelite",
};

export default function Page() {
  return <CartView />;
}
