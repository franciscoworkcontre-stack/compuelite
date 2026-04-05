/**
 * Imports all real products scraped from www.compuelite.cl into the database.
 * Images come directly from Jumpseller CDN (cdnx.jumpseller.com).
 * Run with: bun prisma/import-real-products.ts
 *
 * Strategy:
 *   1. Match by SKU → update price + upsert image
 *   2. No SKU match → create new product
 *   3. Images are replaced with real CDN URLs
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { PrismaClient, ProductType, ProductStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// Path to the scraped data (run prisma/scrape.ts first)
const DATA_PATH = process.env.DATA_PATH || "/tmp/all_products_final.json";

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log("🚀 Importing real products from compuelite.cl scrape...\n");

  const raw: Array<{
    href: string; name: string; imgSrc: string; price: number;
    compareAtPrice: number | null; sku: string; productSlug: string;
    category: "START" | "PRO" | "ELITE" | "MONITORES";
  }> = JSON.parse(readFileSync(DATA_PATH, "utf8"));

  // Get or create categories
  const [catStart, catPro, catElite, catMonitores] = await Promise.all([
    db.category.upsert({ where: { slug: "pc-gamer-start-series" }, update: {}, create: { name: "PC Gamer START Series", slug: "pc-gamer-start-series", sortOrder: 2 } }),
    db.category.upsert({ where: { slug: "pc-gamer-pro-series" }, update: {}, create: { name: "PC Gamer PRO Series", slug: "pc-gamer-pro-series", sortOrder: 3 } }),
    db.category.upsert({ where: { slug: "pc-elite" }, update: {}, create: { name: "PC ELITE®", slug: "pc-elite", sortOrder: 4 } }),
    db.category.upsert({ where: { slug: "monitores" }, update: {}, create: { name: "Monitores", slug: "monitores", sortOrder: 5 } }),
  ]);

  const catIdMap: Record<string, string> = {
    START: catStart.id, PRO: catPro.id, ELITE: catElite.id, MONITORES: catMonitores.id,
  };

  let updated = 0, created = 0, imageUpdated = 0, skipped = 0;

  for (const item of raw) {
    if (!item.price || item.price < 1000) { skipped++; continue; }

    const categoryId = catIdMap[item.category];
    const imgUrl = item.imgSrc?.includes("jumpseller") ? item.imgSrc : null;

    // Try to find existing product by SKU
    let product = item.sku
      ? await db.product.findUnique({ where: { sku: item.sku } })
      : null;

    if (product) {
      // Update price and compareAtPrice
      await db.product.update({
        where: { id: product.id },
        data: { price: item.price, compareAtPrice: item.compareAtPrice, categoryId },
      });
      updated++;
    } else {
      // Create new product
      const baseSlug = item.productSlug || slugify(item.name);
      const sku = item.sku || `IMPORT-${baseSlug.slice(0, 20).toUpperCase()}`;

      // Extract brand from name
      const brand = item.name.match(/Intel|Amd|AMD|ASUS|MSI|Samsung|Xiaomi|ViewSonic|ViewSonic/i)?.[0] || "COMPU ELITE";

      try {
        product = await db.product.create({
          data: {
            sku,
            name: item.name,
            slug: baseSlug,
            brand,
            price: item.price,
            compareAtPrice: item.compareAtPrice,
            currency: "CLP",
            categoryId,
            productType: ProductType.PREBUILT,
            status: ProductStatus.ACTIVE,
            stock: Math.floor(Math.random() * 6) + 2,
            featured: false,
            publishedAt: new Date(),
            shortDescription: item.name,
            tags: ["pc-armada"],
          },
        });
        created++;
      } catch {
        // Slug conflict — try with SKU suffix
        try {
          product = await db.product.create({
            data: {
              sku: sku + "-2",
              name: item.name,
              slug: baseSlug + "-" + sku.toLowerCase(),
              brand,
              price: item.price,
              compareAtPrice: item.compareAtPrice,
              currency: "CLP",
              categoryId,
              productType: ProductType.PREBUILT,
              status: ProductStatus.ACTIVE,
              stock: Math.floor(Math.random() * 6) + 2,
              featured: false,
              publishedAt: new Date(),
              shortDescription: item.name,
              tags: ["pc-armada"],
            },
          });
          created++;
        } catch { skipped++; continue; }
      }
    }

    // Set real Jumpseller CDN image as primary (sortOrder 0)
    if (product && imgUrl) {
      // Remove existing primary image (any source), then insert the real one
      await db.productImage.deleteMany({ where: { productId: product.id, sortOrder: 0 } });
      await db.productImage.create({
        data: { productId: product.id, url: imgUrl, alt: item.name, sortOrder: 0 },
      });
      imageUpdated++;
    }
  }

  // Summary
  const totalProducts = await db.product.count();
  const totalImages = await db.productImage.count();

  console.log(`✅ Updated: ${updated} products`);
  console.log(`✨ Created: ${created} new products`);
  console.log(`🖼️  Images: ${imageUpdated} updated with real CDN URLs`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`\n📦 Database totals: ${totalProducts} products, ${totalImages} images`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
