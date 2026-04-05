import { type Metadata } from "next";
import { CheckoutView } from "@/components/shop/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout — Compuelite",
};

export default function Page() {
  return <CheckoutView />;
}
