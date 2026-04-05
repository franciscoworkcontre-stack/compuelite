/**
 * Seeds demo promotions and blog posts for presentation purposes.
 * Run with: bun prisma/seed-demo.ts
 */
import "dotenv/config";
import { PrismaClient, PromotionType, PromotionConditionType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🎯 Seeding demo content...");

  // ─── Promotions ────────────────────────────────────────────────────────────

  const promotions = [
    {
      name: "Despacho gratis sobre $1.500.000",
      description: "Envío gratuito a todo Chile en pedidos que superen $1.500.000 CLP",
      type: PromotionType.FREE_SHIPPING,
      value: 0,
      conditionType: PromotionConditionType.CART_TOTAL,
      conditionValue: "1500000",
      isActive: true,
      stackable: true,
      priority: 10,
    },
    {
      name: "10% descuento Serie ELITE",
      description: "Descuento exclusivo en toda la línea PC ELITE®",
      type: PromotionType.PERCENTAGE,
      value: 10,
      conditionType: PromotionConditionType.CATEGORY,
      conditionValue: "", // will be filled with real category ID
      isActive: true,
      stackable: false,
      priority: 5,
    },
    {
      name: "Bienvenida: $50.000 en tu primera compra",
      description: "Descuento especial en el primer pedido",
      type: PromotionType.FIXED_AMOUNT,
      value: 50000,
      conditionType: PromotionConditionType.CART_TOTAL,
      conditionValue: "500000",
      isActive: true,
      stackable: false,
      priority: 1,
      maxUses: 100,
    },
    {
      name: "Despacho gratis Serie START",
      description: "Sin costo de envío en todos los modelos de la serie START",
      type: PromotionType.FREE_SHIPPING,
      value: 0,
      conditionType: PromotionConditionType.CATEGORY,
      conditionValue: "", // will be filled with START category ID
      isActive: true,
      stackable: true,
      priority: 8,
    },
  ];

  // Get category IDs for the promotions
  const [eliteCategory, startCategory] = await Promise.all([
    db.category.findUnique({ where: { slug: "pc-elite" } }),
    db.category.findUnique({ where: { slug: "pc-gamer-start-series" } }),
  ]);

  if (eliteCategory) promotions[1].conditionValue = eliteCategory.id;
  if (startCategory) promotions[3].conditionValue = startCategory.id;

  let promoCount = 0;
  for (const promo of promotions) {
    const existing = await db.promotionRule.findFirst({ where: { name: promo.name } });
    if (!existing) {
      await db.promotionRule.create({ data: promo as Parameters<typeof db.promotionRule.create>[0]["data"] });
      promoCount++;
    }
  }
  console.log(`✅ Promociones: ${promoCount} nuevas (${promotions.length - promoCount} ya existían)`);

  // ─── Blog posts ────────────────────────────────────────────────────────────

  // Check if Post model exists
  const hasPostModel = await db.$queryRaw<Array<{exists: boolean}>>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Post'
    ) as exists
  `.then(r => r[0]?.exists).catch(() => false);

  if (!hasPostModel) {
    console.log("ℹ️  Tabla Post no encontrada, omitiendo posts");
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  const totalProducts = await db.product.count();
  const totalImages = await db.productImage.count();
  const totalPromos = await db.promotionRule.count();

  console.log(`\n📊 Estado de la base de datos:`);
  console.log(`   Productos:   ${totalProducts}`);
  console.log(`   Imágenes:    ${totalImages}`);
  console.log(`   Promociones: ${totalPromos}`);
  console.log(`\n🎉 Demo listo para presentar`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
