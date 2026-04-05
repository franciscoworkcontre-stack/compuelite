import { AdminProducts } from "@/components/admin/AdminProducts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos — Admin Compuelite" };

export default function Page() {
  return <AdminProducts />;
}
