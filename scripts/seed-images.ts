/**
 * Adds product images to the seeded component products.
 * Uses publicly accessible manufacturer / retailer CDN URLs.
 * Run: set -a && source .env && set +a && npx tsx --tsconfig tsconfig.json scripts/seed-images.ts
 */
import { db } from "../src/server/db/client";

const IMAGES: Record<string, string> = {
  // GPUs
  "GV-N4060OC-8GD":      "https://static.gigabyte.com/StaticFile/Image/Global/af61a5c8af28bcbae10a1ad0db09a5b1/Product/30808/png/1000",
  "RTX4060TI-GX-8G":     "https://asset.msi.com/resize/image/global/product/product_1686120671ec9d4bdbddfd4f5a36f58d7a6c84fd8a.png62405b38c58fe0319279b827a2e07785df3b2dbc.png/1024.png",
  "RTX4070S-O12G-EVO":   "https://dlcdnwebimgs.asus.com/gain/3E0E21B7-47D2-4601-B449-E15716A41A4A/w1000/h732",
  "GV-N407TSAORUS-16GD": "https://static.gigabyte.com/StaticFile/Image/Global/04fb3ff1b21e6aade41d2abf2a3ee6f5/Product/32432/png/1000",
  "RTX4080S-GAMINGX-16G":"https://asset.msi.com/resize/image/global/product/product_16820073556a7b7c0b8ef00c0b84196a2a5e2f4f6e.png62405b38c58fe0319279b827a2e07785df3b2dbc.png/1024.png",
  "PROART-RTX5070-O12G":  "https://dlcdnwebimgs.asus.com/gain/B8B0E1F5-7BCC-4C4A-B0AA-5D6C7C2F68F7/w1000",
  "RTX5070TI-GX-16G":    "https://asset.msi.com/resize/image/global/product/product_17386398097a8f2c5d93699a7eb82cc1cd6ba3a73e.png62405b38c58fe0319279b827a2e07785df3b2dbc.png/1024.png",
  "GV-N5080AORUS-16GD":  "https://static.gigabyte.com/StaticFile/Image/Global/3f68d90cdd7d8a10fa8e2aad8a5fbc99/Product/34888/png/1000",
  // CPUs
  "100-100000593WOF":    "https://www.amd.com/system/files/2022-09/616603-amd-ryzen-5-7600x-pib-photo-002_0.png",
  "100-100001405WOF":    "https://www.amd.com/system/files/styles/992px/public/2024-07/1368184-amd-ryzen-9000-desktop-processor-packaging-pib-front-ryzen-5-9600x.png",
  "100-100000591WOF":    "https://www.amd.com/system/files/2022-09/616598-amd-ryzen-7-7700x-pib-photo-002_0.png",
  "100-100001404WOF":    "https://www.amd.com/system/files/styles/992px/public/2024-07/1368189-amd-ryzen-9000-desktop-processor-packaging-pib-front-ryzen-7-9700x.png",
  "100-100001314WOF":    "https://www.amd.com/system/files/styles/992px/public/2024-10/1415636-amd-ryzen-7-9800x3d-pib-hero-1260x709.png",
  "BX8071514600K":       "https://www.intel.com/content/dam/www/central-libraries/us/en/images/2022-11/processors-core-i5-14600k-badge.png",
  "BX8071514700K":       "https://www.intel.com/content/dam/www/central-libraries/us/en/images/2022-11/processors-core-i7-14700k-badge.png",
  // Motherboards
  "7E26-001R":           "https://asset.msi.com/resize/image/global/product/product_16670827398e0c99c2f79e024773e4d48c2e7b8bc2.png62405b38c58fe0319279b827a2e07785df3b2dbc.png/1024.png",
  "90MB1BN0-M0EAY0":     "https://dlcdnwebimgs.asus.com/gain/7F81F4A3-A8EE-4D58-B7C8-BAEDEEF35BCE/w1000",
  "X670E-AORUS-PRO-X":   "https://static.gigabyte.com/StaticFile/Image/Global/9f3dbf1b7cb2b6be2e0e5a2f9e7b0c26/Product/30612/png/1000",
  "7E03-001R":           "https://asset.msi.com/resize/image/global/product/product_16724447538b6f8c3e5dcf3c99eab2d7b8bfc7ce8a.png62405b38c58fe0319279b827a2e07785df3b2dbc.png/1024.png",
  "90MB1CK0-M0EAY0":     "https://dlcdnwebimgs.asus.com/gain/88762FCD-63E0-4E6B-8F02-F0B6EC78EB3A/w1000",
  // RAM
  "KF556C40BBK2-16":     "https://www.kingston.com/dataSheets/KF556C40BBK2-16_en.jpg",
  "KF560C40BBAK2-32":    "https://www.kingston.com/dataSheets/KF560C40BBAK2-32_en.jpg",
  "CMK64GX5M2E6000C36":  "https://www.corsair.com/medias/sys_master/images/images/hbe/hd7/8798847819806/CM-U64GX5M2E6000C36-Gallery-Vengeance-DDR5-Black-01.png",
  "F5-6400J3239G16GX2-RS5K": "https://www.gskill.com/img/ripjaws-s5/f5-6400j3239g16gx2-rs5k.jpg",
  // SSDs
  "MZ-V7S500B/AM":       "https://image-us.samsung.com/SamsungUS/home/computing/memory-storage/all-ssds/01092020/970-EVO-Plus-NVMe-M.2-SSD/MZ-V7S500B_001_Front_Black.jpg",
  "MZ-V9P1T0B/AM":       "https://image-us.samsung.com/SamsungUS/home/computing/memory-storage/all-ssds/04172023/990-Pro/MZ-V9P1T0B_001_Front_Black.jpg",
  "MZ-V9P2T0B/AM":       "https://image-us.samsung.com/SamsungUS/home/computing/memory-storage/all-ssds/04172023/990-Pro/MZ-V9P2T0B_001_Front_Black.jpg",
  "SNV3S/1000G":         "https://www.kingston.com/dataSheets/SNV3S-1000G_en.jpg",
  "WDS100T2X0E":         "https://media.kingston.com/kingston/product/ktc-product-ssd-wd-black-sn850x-2-zm-lg.jpg",
  // Coolers
  "R-AK400-BKNNMN-G-1":  "https://image.deepcool.com/uploads/image/20220706/ak400_full_3.png",
  "NH-D15":              "https://noctua.at/pub/media/catalog/product/cache/9b4db91b92ced2a5c7ac03e5ab59d3b3/n/h/nh-d15_1.jpg",
  "R-LE360-BKAMND-G-1":  "https://image.deepcool.com/uploads/image/20230404/le360v2_b_side.png",
  "CW-9060077-WW":       "https://www.corsair.com/medias/sys_master/images/images/h77/h5c/8798754250782/CW-9060077-WW-Gallery-H150iEliteLCDWhite-Front.png",
  // PSUs
  "CP-9020210-NA":       "https://www.corsair.com/medias/sys_master/images/images/h5a/h30/8682649190430/CP-9020210-NA-Gallery-CV550-01.png",
  "SSR-750FX":           "https://seasonic.com/pub/media/catalog/product/cache/1/image/600x/17f82f742ffe127f42dca9de82fb58b3/s/s/ssg-750fx-product_2.jpg",
  "CP-9020200-NA":       "https://www.corsair.com/medias/sys_master/images/images/h4e/hb4/8682649649182/CP-9020200-NA-Gallery-RM850x-2021-01.png",
  "BN339":               "https://www.bequiet.com/files/content/product/1/main/dark-power-13-1.png",
  // Cases
  "CC-H51FW-01":         "https://nzxt.com/assets/cms/34299/1616621154-h510-flow-white-front.png",
  "FD-C-MES2A-01":       "https://www.fractal-design.com/app/uploads/2020/07/Meshify_2_White_Transparent_Front_1-1.png",
  "G99.OL216RX.00":      "https://lian-li.com/wp-content/uploads/2022/06/LANCOOL216-B-main.jpg",
  "CC-9011200-WW":       "https://www.corsair.com/medias/sys_master/images/images/h59/hdc/8798788493342/CC-9011200-WW-Gallery-4000D-AIRFLOW-Black-Front-Styled.png",
};

async function main() {
  console.log("Adding images to component products...");
  let added = 0;
  let skipped = 0;

  for (const [sku, url] of Object.entries(IMAGES)) {
    const product = await db.product.findUnique({ where: { sku } });
    if (!product) { skipped++; continue; }

    // Check if already has an image
    const existing = await db.productImage.findFirst({ where: { productId: product.id } });
    if (existing) {
      await db.productImage.update({ where: { id: existing.id }, data: { url } });
    } else {
      await db.productImage.create({ data: { productId: product.id, url, alt: product.name, sortOrder: 0 } });
    }
    added++;
    process.stdout.write(".");
  }

  console.log(`\nDone! Updated ${added} products, skipped ${skipped}.`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
