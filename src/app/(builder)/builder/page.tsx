import { type Metadata } from "next";
import { BuilderPage } from "@/components/builder/BuilderPage";

export const metadata: Metadata = {
  title: "PC Builder 3D — Compuelite",
  description: "Arma tu PC gamer ideal. Selecciona componentes compatibles y visualízalos en 3D en tiempo real.",
};

export default function Page() {
  return <BuilderPage />;
}
