import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentError } from "@/components/shop/PaymentError";

export const metadata: Metadata = { title: "Pago fallido — Compuelite" };

export default function Page() {
  return (
    <Suspense>
      <PaymentError />
    </Suspense>
  );
}
