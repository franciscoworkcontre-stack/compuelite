/**
 * Updates homepage content blocks to reflect active BLACK SALE promotion.
 * Run with: bun prisma/seed-banner.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  // 1. Update announcement_bar — BLACK SALE urgency
  await db.contentBlock.updateMany({
    where: { zone: "announcement_bar" },
    data: {
      data: {
        text: "⚡ BLACK SALE — Hasta 13% OFF en PCs Gamer armadas · 6 cuotas sin interés con Webpay",
        variant: "sale",
        linkHref: "/productos",
        linkLabel: "Ver ofertas →",
        dismissible: true,
      },
    },
  });

  // 2. Update homepage_promo — hero sale banner with real prices
  await db.contentBlock.updateMany({
    where: { zone: "homepage_promo" },
    data: {
      data: {
        eyebrow: "⚡ BLACK SALE — Solo por tiempo limitado",
        title: "PCs Gamer con hasta 13% OFF",
        subtitle: "Desde $667.166 · Intel i5 + RTX 3050 desde $876.432 · Ryzen 7 9800X3D + RTX 5070 Ti disponible · Garantía incluida · Despacho a todo Chile",
        ctaHref: "/productos",
        ctaLabel: "Ver todas las ofertas",
        ctaSecondaryHref: "/productos?categoria=pc-gamer-start-series",
        ctaSecondaryLabel: "Serie START desde $667K",
        accentColor: "#ff3300",
        layout: "full",
      },
    },
  });

  // 3. Create homepage_live block — compact offer strip below hero
  const existing = await db.contentBlock.findFirst({ where: { zone: "homepage_live" } });
  if (!existing) {
    await db.contentBlock.create({
      data: {
        zone: "homepage_live",
        type: "PROMO_BANNER",
        label: "homepage_live_blacksale",
        order: 0,
        active: true,
        data: {
          eyebrow: "OFERTA ACTIVA",
          title: "PC Gamer Ryzen 5 + RTX 3050 · $863.490",
          subtitle: "Antes $937.000 · Ahorrás $73.500 · Stock limitado",
          ctaHref: "/productos?categoria=pc-gamer-start-series",
          ctaLabel: "Ver oferta",
          accentColor: "#ff3300",
          layout: "compact",
        },
      },
    });
  } else {
    await db.contentBlock.update({
      where: { id: existing.id },
      data: {
        active: true,
        data: {
          eyebrow: "OFERTA ACTIVA",
          title: "PC Gamer Ryzen 5 + RTX 3050 · $863.490",
          subtitle: "Antes $937.000 · Ahorrás $73.500 · Stock limitado",
          ctaHref: "/productos?categoria=pc-gamer-start-series",
          ctaLabel: "Ver oferta",
          accentColor: "#ff3300",
          layout: "compact",
        },
      },
    });
  }

  console.log("✅ Banners updated with BLACK SALE content");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
