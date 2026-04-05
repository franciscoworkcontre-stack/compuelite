import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Compuelite" };

export default function Page() {
  return <AdminDashboard />;
}
