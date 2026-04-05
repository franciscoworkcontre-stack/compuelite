import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = { title: "Mi cuenta — Compuelite" };

export default function Page() {
  return <AccountView />;
}
