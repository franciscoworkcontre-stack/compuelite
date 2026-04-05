import { type Metadata } from "next";
import { BuilderPage } from "@/components/builder/BuilderPage";
import { ContentZone } from "@/components/content/ContentZone";

export const metadata: Metadata = {
  title: "Configurador de PC — Compuelite",
  description: "Arma tu PC gamer ideal. Selecciona componentes compatibles y obtén el precio total de tu equipo.",
};

export default function Page() {
  return (
    <>
      <ContentZone zone="builder_notice" />
      <BuilderPage />
    </>
  );
}
