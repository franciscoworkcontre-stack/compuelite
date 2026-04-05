import { type Metadata } from "next";
import { CartView } from "@/components/shop/CartView";
import { ContentZone } from "@/components/content/ContentZone";

export const metadata: Metadata = {
  title: "Carrito — Compuelite",
};

export default function Page() {
  return (
    <>
      <ContentZone zone="cart_upsell" />
      <CartView />
    </>
  );
}
