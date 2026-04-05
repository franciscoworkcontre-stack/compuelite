import { AdminOrders } from "@/components/admin/AdminOrders";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pedidos — Admin Compuelite" };

export default function Page() {
  return <AdminOrders />;
}
