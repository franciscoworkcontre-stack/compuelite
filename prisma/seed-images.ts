/**
 * Adds demo product images to all products in the database.
 * Uses curated Unsplash photo IDs per category for a professional demo look.
 * Run with: bun prisma/seed-images.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// Curated gaming PC images from Unsplash (by photo ID, ?w=800&fit=crop)
const PC_IMAGES = [
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&h=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1593640408182-31c228168beb?w=800&h=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&h=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800&h=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=800&h=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&h=800&fit=crop&auto=format",
];

const MONITOR_IMAGES = [
  "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&h=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&h=800&fit=crop&auto=format",
];

async function main() {
  console.log("🖼️  Seeding product images...");

  const products = await db.product.findMany({
    select: { id: true, sku: true, name: true, category: { select: { slug: true } } },
  });

  let added = 0;
  let skipped = 0;

  for (const product of products) {
    // Skip if already has an image
    const existing = await db.productImage.count({ where: { productId: product.id } });
    if (existing > 0) {
      skipped++;
      continue;
    }

    const isMonitor = product.category?.slug === "monitores";
    const pool = isMonitor ? MONITOR_IMAGES : PC_IMAGES;

    // Pick image deterministically based on SKU (consistent across runs)
    const skuSum = product.sku.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const primaryIdx = skuSum % pool.length;
    const secondaryIdx = (skuSum + 2) % pool.length;

    await db.productImage.createMany({
      data: [
        { productId: product.id, url: pool[primaryIdx], alt: product.name, sortOrder: 0 },
        { productId: product.id, url: pool[secondaryIdx], alt: product.name, sortOrder: 1 },
      ],
    });
    added++;
  }

  console.log(`✅ Images added: ${added} products`);
  console.log(`⏭️  Already had images: ${skipped} products`);
  console.log(`\n🎨 Total products with images: ${added + skipped}/${products.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
