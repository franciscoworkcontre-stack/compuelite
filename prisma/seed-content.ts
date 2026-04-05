/**
 * Seeds homepage content blocks for demo presentation.
 * Run with: bun prisma/seed-content.ts
 */
import "dotenv/config";
import { PrismaClient, BlockType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function upsertBlock(label: string, zone: string, type: BlockType, data: object, order = 0) {
  const existing = await db.contentBlock.findFirst({ where: { label } });
  if (existing) {
    await db.contentBlock.update({ where: { id: existing.id }, data: { data, active: true } });
    console.log(`  ↻ Updated: ${label}`);
  } else {
    await db.contentBlock.create({ data: { label, zone, type, data, active: true, order } });
    console.log(`  + Created: ${label}`);
  }
}

async function main() {
  console.log("📦 Seeding homepage content blocks...\n");

  // ── Announcement bar ─────────────────────────────────────────────────────
  await upsertBlock(
    "announcement_bar_shipping",
    "announcement_bar",
    BlockType.ANNOUNCEMENT,
    {
      text: "🚚 Envío gratis en pedidos sobre $1.500.000 · 6 cuotas sin interés con Webpay",
      linkLabel: "Ver modelos",
      linkHref: "/productos",
      variant: "sale",
      dismissible: true,
    }
  );

  // ── Promo banner (homepage_promo zone) ───────────────────────────────────
  await upsertBlock(
    "homepage_promo_elite",
    "homepage_promo",
    BlockType.PROMO_BANNER,
    {
      eyebrow: "Línea exclusiva",
      title: "PC ELITE® — Máximo rendimiento",
      subtitle: "RTX 5090 · Ryzen 9 9950X3D · 64GB DDR5. Para los que no se conforman con menos.",
      ctaLabel: "Ver serie ELITE",
      ctaHref: "/productos?categoria=pc-elite",
      ctaSecondaryLabel: "Comparar modelos",
      ctaSecondaryHref: "/productos",
      accentColor: "#00ff66",
      layout: "full",
    }
  );

  // ── Dual audience block (homepage_dual zone) ─────────────────────────────
  await upsertBlock(
    "homepage_dual_audiences",
    "homepage_dual",
    BlockType.DUAL_AUDIENCE,
    {
      leftLabel: "Gamer START",
      leftHref: "/productos?categoria=pc-gamer-start-series",
      leftDesc: "Entra al gaming con presupuesto real. RX 7600, RTX 5060 y los mejores Intel/AMD de gama media.",
      leftBullets: [
        "Desde $966.000 CLP",
        "6 cuotas sin interés",
        "Ideal para 1080p / 1440p",
        "Lista para usar el mismo día",
      ],
      leftAccent: "#00ff66",
      rightLabel: "PC ELITE®",
      rightHref: "/productos?categoria=pc-elite",
      rightDesc: "Para quien quiere lo mejor. RTX 5080/5090, procesadores de última generación y 32-64GB DDR5.",
      rightBullets: [
        "RTX 5090 disponible",
        "Desde $2.500.000 CLP",
        "4K ultra sin compromisos",
        "Garantía extendida incluida",
      ],
      rightAccent: "#ff6600",
    }
  );

  // ── Editorial block (homepage_editorial zone) ────────────────────────────
  await upsertBlock(
    "homepage_editorial_rtx5000",
    "homepage_editorial",
    BlockType.EDITORIAL,
    {
      category: "Nuestro pick del mes",
      headline: "¿RTX 5060 o RX 7600? Cuál conviene en Chile hoy",
      deck: "Comparamos las dos GPUs más vendidas de nuestra línea START en los juegos que realmente juegas: Fortnite, Valorant y Cyberpunk.",
      imageUrl: "https://picsum.photos/seed/editorial1/1200/600",
      ctaLabel: "Leer análisis",
      ctaHref: "/productos",
      readTime: 4,
      accentColor: "#00ff66",
      layout: "full",
    }
  );

  console.log("\n✅ Listo. Bloques activos en homepage:");
  const blocks = await db.contentBlock.findMany({
    where: { active: true },
    select: { zone: true, type: true, label: true },
    orderBy: [{ zone: "asc" }, { order: "asc" }],
  });
  blocks.forEach(b => console.log(`   [${b.zone}] ${b.type} — ${b.label}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
