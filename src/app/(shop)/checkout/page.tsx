import { type Metadata } from "next";
import { CheckoutView } from "@/components/shop/CheckoutView";
import { ContentZone } from "@/components/content/ContentZone";

export const metadata: Metadata = {
  title: "Checkout — Compuelite",
};

export default function Page() {
  return (
    <>
      <ContentZone zone="checkout_notice" />
      <CheckoutView />
    </>
  );
}
