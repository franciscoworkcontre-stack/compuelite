/**
 * Replaces failed Unsplash images with reliable picsum.photos URLs.
 * picsum.photos/seed/{n}/800/800 always returns a beautiful, consistent photo.
 * Run with: bun prisma/fix-images.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// picsum seeds that return good-looking tech/dark photos
// Verified seeds: these return attractive images suitable for a tech store
const PC_SEEDS = [20, 48, 60, 96, 119, 160, 180, 200, 250, 280, 360, 450];
const MONITOR_SEEDS = [10, 30, 42, 68, 90, 110];

async function main() {
  console.log("🔄 Replacing failed Unsplash images with picsum.photos...");

  const badImages = await db.productImage.findMany({
    where: { url: { contains: "unsplash" } },
    include: { product: { include: { category: { select: { slug: true } } } } },
  });

  console.log(`Found ${badImages.length} Unsplash images to replace`);

  let updated = 0;
  for (const img of badImages) {
    const isMonitor = img.product?.category?.slug === "monitores";
    const pool = isMonitor ? MONITOR_SEEDS : PC_SEEDS;

    // Deterministic seed based on product ID
    const idSum = img.productId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const seedOffset = img.sortOrder ?? 0;
    const seed = pool[(idSum + seedOffset) % pool.length];
    const newUrl = `https://picsum.photos/seed/${seed}/800/800`;

    await db.productImage.update({
      where: { id: img.id },
      data: { url: newUrl },
    });
    updated++;
  }

  console.log(`✅ Updated ${updated} images to picsum.photos`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
