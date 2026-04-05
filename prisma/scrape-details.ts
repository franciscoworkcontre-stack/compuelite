/**
 * Scrapes product descriptions and all images from each compuelite.cl product page.
 * Uses direct HTTP fetch with concurrency — no browser needed, much faster.
 * Run with: bun prisma/scrape-details.ts
 *
 * Progress is saved incrementally so it can resume if interrupted.
 */
import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const CONCURRENCY = 8;
const PROGRESS_FILE = "/tmp/scrape-details-progress.json";
const RESULTS_FILE = "/tmp/scrape-details-results.json";

interface ScrapedDetail {
  href: string;
  sku: string;
  images: string[];      // all image URLs from gallery
  descriptionHtml: string; // raw description HTML
}

// ─── HTML parsing helpers ─────────────────────────────────────────────────────

function extractImages(html: string): string[] {
  const images: string[] = [];
  // Match gallery images (610x610 size - those are the product-specific ones)
  const galleryRegex = /src=["']([^"']*jumpseller[^"']*\/thumb\/\d+\/\d+[^"']*)["']/g;
  let m;
  while ((m = galleryRegex.exec(html)) !== null) {
    const url = m[1].replace(/\/thumb\/\d+\/\d+/, "/thumb/1000/1000");
    if (!images.includes(url)) images.push(url);
  }
  // Also check data-src
  const dataSrcRegex = /data-src=["']([^"']*jumpseller[^"']*\/thumb\/\d+\/\d+[^"']*)["']/g;
  while ((m = dataSrcRegex.exec(html)) !== null) {
    const url = m[1].replace(/\/thumb\/\d+\/\d+/, "/thumb/1000/1000");
    if (!images.includes(url)) images.push(url);
  }
  // Keep only product gallery images (610px and smaller sources, not 1000px from related products)
  // Product page shows its own images at 610 before we normalize them
  return [...new Set(images)].slice(0, 8); // max 8 images per product
}

function extractDescription(html: string): string {
  // Extract the product description section
  const descMatch = html.match(/class="product-description__content"[^>]*>([\s\S]*?)<\/h3>/);
  if (descMatch) {
    // Clean up the HTML - remove excessive whitespace and scripts
    return descMatch[1]
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/\s{3,}/g, " ")
      .trim()
      .slice(0, 20000); // cap at 20KB
  }
  // Fallback: try any product description div
  const fallback = html.match(/class="[^"]*product[^"]*description[^"]*"[^>]*>([\s\S]{100,5000})/);
  if (fallback) return fallback[1].replace(/<script[\s\S]*?<\/script>/gi, "").trim();
  return "";
}

// ─── Fetch with retry ─────────────────────────────────────────────────────────

async function fetchPage(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "es-CL,es;q=0.9",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return null;
      return await res.text();
    } catch {
      if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

// ─── Concurrency pool ─────────────────────────────────────────────────────────

async function runConcurrent<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  concurrency: number
) {
  let idx = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (idx < items.length) {
      const i = idx++;
      await fn(items[i], i);
    }
  });
  await Promise.all(workers);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 Scraping product details from compuelite.cl...\n");

  // Load scraped product list
  const products: Array<{ href: string; sku: string; productSlug: string }> =
    JSON.parse(readFileSync("/tmp/all_products_final.json", "utf8"));

  // Load progress (to resume if interrupted)
  const done: Set<string> = new Set(
    existsSync(PROGRESS_FILE) ? JSON.parse(readFileSync(PROGRESS_FILE, "utf8")) : []
  );
  const results: ScrapedDetail[] = existsSync(RESULTS_FILE)
    ? JSON.parse(readFileSync(RESULTS_FILE, "utf8"))
    : [];

  const remaining = products.filter(p => !done.has(p.href));
  console.log(`Total: ${products.length} | Done: ${done.size} | Remaining: ${remaining.length}`);
  console.log(`Concurrency: ${CONCURRENCY} | Est. time: ~${Math.ceil(remaining.length / CONCURRENCY / 60 * 3)}min\n`);

  let processed = 0;
  let failed = 0;

  await runConcurrent(remaining, async (product, _i) => {
    const html = await fetchPage(product.href);

    if (html) {
      const images = extractImages(html);
      const descriptionHtml = extractDescription(html);
      results.push({ href: product.href, sku: product.sku, images, descriptionHtml });
    } else {
      failed++;
    }

    done.add(product.href);
    processed++;

    if (processed % 20 === 0 || processed === remaining.length) {
      writeFileSync(PROGRESS_FILE, JSON.stringify([...done]));
      writeFileSync(RESULTS_FILE, JSON.stringify(results));
      const pct = Math.round((done.size / products.length) * 100);
      process.stdout.write(`\r  ${done.size}/${products.length} (${pct}%) | failed: ${failed} | images found: ${results.reduce((s, r) => s + r.images.length, 0)}`);
    }
  }, CONCURRENCY);

  console.log("\n\n✅ Scraping complete!\n");
  writeFileSync(RESULTS_FILE, JSON.stringify(results));

  // ─── Update database ──────────────────────────────────────────────────────
  console.log("💾 Updating database...\n");

  let imgUpdated = 0, descUpdated = 0, notFound = 0;

  for (const detail of results) {
    if (!detail.sku) { notFound++; continue; }

    const product = await db.product.findUnique({ where: { sku: detail.sku } });
    if (!product) { notFound++; continue; }

    // Update description
    if (detail.descriptionHtml && detail.descriptionHtml.length > 100) {
      await db.product.update({
        where: { id: product.id },
        data: { description: detail.descriptionHtml },
      });
      descUpdated++;
    }

    // Add secondary images (sortOrder 1, 2, 3...)
    if (detail.images.length > 1) {
      // Delete old secondary images (keep sortOrder 0 = primary from listing scrape)
      await db.productImage.deleteMany({ where: { productId: product.id, sortOrder: { gt: 0 } } });

      const secondaryImages = detail.images.slice(1, 5); // up to 4 extra images
      if (secondaryImages.length > 0) {
        await db.productImage.createMany({
          data: secondaryImages.map((url, i) => ({
            productId: product.id,
            url,
            alt: product.name,
            sortOrder: i + 1,
          })),
        });
        imgUpdated++;
      }
    }

    // Also update primary image if we got a better one from the product page
    if (detail.images.length > 0) {
      await db.productImage.deleteMany({ where: { productId: product.id, sortOrder: 0 } });
      await db.productImage.create({
        data: { productId: product.id, url: detail.images[0], alt: product.name, sortOrder: 0 },
      });
    }
  }

  const totalProducts = await db.product.count();
  const totalImages = await db.productImage.count();

  console.log(`✅ Descriptions updated: ${descUpdated}`);
  console.log(`🖼️  Secondary images added: ${imgUpdated} products`);
  console.log(`⚠️  Not found in DB: ${notFound}`);
  console.log(`\n📦 Totals: ${totalProducts} products, ${totalImages} images`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
