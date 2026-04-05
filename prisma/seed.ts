import "dotenv/config";
import { PrismaClient, ProductType, ProductStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePrice(raw: string): number {
  // First price in the string (sale price)
  const match = raw.match(/\$([0-9.]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/\./g, ""), 10);
}

function parseComparePrice(raw: string): number | null {
  // Second price (original price)
  const matches = [...raw.matchAll(/\$([0-9.]+)/g)];
  if (matches.length < 2) return null;
  return parseInt(matches[1][1].replace(/\./g, ""), 10);
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseSku(brand: string): string {
  const match = brand.match(/SKU:\s*([A-Z0-9]+)/);
  return match ? match[1] : Math.random().toString(36).substr(2, 8).toUpperCase();
}

function parseBrand(brand: string): string {
  return brand.split("|")[0].trim();
}

// ─── Raw data scraped from compuelite.cl ──────────────────────────────────────

const rawStartSeries = [
  { name: "PC Gamer Intel i5 12400F 6-Core + 16GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCB304", price: "$1.012.729\n$1.099.000\n6 cuotas sin interés de $177.672" },
  { name: "PC Gamer Intel i5 14400F 10-Core + 16GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCB305", price: "$1.115.937\n$1.211.000\n6 cuotas sin interés de $195.778" },
  { name: "PC Gamer Intel i7 12700F 12-Core + 16GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCB306", price: "$1.209.930\n$1.313.000\n6 cuotas sin interés de $212.268" },
  { name: "PC Gamer Amd Ryzen 5 5500 6-Core + 16GB DDR4 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCB298", price: "$966.654\n$1.049.000\n6 cuotas sin interés de $169.588" },
  { name: "PC Gamer Amd Ryzen 5 5600X 6-Core + 16GB DDR4 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCB299", price: "$1.044.060\n$1.133.000\n6 cuotas sin interés de $183.168" },
  { name: "PC Gamer Amd Ryzen 7 5700X 8-Core + 16GB DDR4 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCB300", price: "$1.094.742\n$1.188.000\n6 cuotas sin interés de $192.060" },
  { name: "PC Gamer Amd Ryzen 7 7700 8-Core + 16GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCB302", price: "$1.301.158\n$1.412.000\n6 cuotas sin interés de $228.273" },
  { name: "PC Gamer Amd Ryzen 7 8700G 8-Core + 16GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCB367", price: "$1.220.066\n$1.324.000\n6 cuotas sin interés de $214.047" },
  { name: "PC Gamer Amd Ryzen 7 7700 8-Core + 16GB DDR5 + RTX 5060 8GB", brand: "COMPU ELITE | SKU: PCB370", price: "$1.428.325\n$1.550.000\n6 cuotas sin interés de $250.583" },
  { name: "PC Gamer Intel i5 12400F 6-Core + 16GB DDR5 + RTX 5060 8GB", brand: "COMPU ELITE | SKU: PCB372", price: "$1.187.814\n$1.289.000\n6 cuotas sin interés de $208.388" },
  { name: "PC Gamer Intel i5 14400F 10-Core + 16GB DDR5 + RTX 5060 8GB", brand: "COMPU ELITE | SKU: PCB374", price: "$1.291.022\n$1.401.000\n6 cuotas sin interés de $226.495" },
  { name: "PC Gamer Intel i7 12700F 12-Core + 16GB DDR5 + RTX 5060 8GB", brand: "COMPU ELITE | SKU: PCB375", price: "$1.385.015\n$1.503.000\n6 cuotas sin interés de $242.985" },
  { name: "PC Gamer Intel i7 14700F 12-Core + 16GB DDR5 + RTX 5060 8GB", brand: "COMPU ELITE | SKU: PCB376", price: "$1.457.813\n$1.582.000\n6 cuotas sin interés de $255.757" },
];

const rawProSeries = [
  { name: "PC Gamer Amd Ryzen 7 7700 8-Core + 32GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCP744", price: "$1.754.536\n$1.904.000\n6 cuotas sin interés de $307.813" },
  { name: "PC Gamer Amd Ryzen 9 7900 12-Core + 32GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCP745", price: "$1.814.434\n$1.969.000\n6 cuotas sin interés de $318.322" },
  { name: "PC Gamer Amd Ryzen 5 9600X 6-Core + 32GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCP746", price: "$1.628.291\n$1.767.000\n6 cuotas sin interés de $285.665" },
  { name: "PC Gamer Amd Ryzen 7 9700X 8-Core + 32GB DDR5 + RX 7600 8GB", brand: "COMPU ELITE | SKU: PCP747", price: "$1.763.751\n$1.914.000\n6 cuotas sin interés de $309.430" },
  { name: "PC Gamer Amd Ryzen 7 7700 8-Core + 32GB DDR5 + RX 9070 XT 16GB", brand: "COMPU ELITE | SKU: PCP871", price: "$2.411.566\n$2.617.000\n6 cuotas sin interés de $423.082" },
  { name: "PC Gamer Amd Ryzen 9 7900 12-Core + 32GB DDR5 + RX 9070 XT 16GB", brand: "COMPU ELITE | SKU: PCP872", price: "$2.471.463\n$2.682.000\n6 cuotas sin interés de $433.590" },
  { name: "PC Gamer Amd Ryzen 5 9600X 6-Core + 32GB DDR5 + RX 9070 XT 16GB", brand: "COMPU ELITE | SKU: PCP873", price: "$2.285.320\n$2.480.000\n6 cuotas sin interés de $400.933" },
  { name: "PC Gamer Amd Ryzen 7 9700X 8-Core + 32GB DDR5 + RX 9070 XT 16GB", brand: "COMPU ELITE | SKU: PCP874", price: "$2.420.781\n$2.627.000\n6 cuotas sin interés de $424.698" },
  { name: "PC Gamer Amd Ryzen 7 7700 8-Core + 32GB DDR5 + RX 9060 XT 8GB", brand: "COMPU ELITE | SKU: PCP1075", price: "$1.866.959\n$2.026.000\n6 cuotas sin interés de $327.537" },
  { name: "PC Gamer Amd Ryzen 9 7900 12-Core + 32GB DDR5 + RX 9060 XT 8GB", brand: "COMPU ELITE | SKU: PCP1076", price: "$1.926.857\n$2.091.000\n6 cuotas sin interés de $338.045" },
  { name: "PC Gamer Amd Ryzen 5 9600X 6-Core + 32GB DDR5 + RX 9060 XT 8GB", brand: "COMPU ELITE | SKU: PCP1077", price: "$1.740.714\n$1.889.000\n6 cuotas sin interés de $305.388" },
  { name: "PC Gamer Amd Ryzen 7 9700X 8-Core + 32GB DDR5 + RX 9060 XT 8GB", brand: "COMPU ELITE | SKU: PCP1078", price: "$1.876.174\n$2.036.000\n6 cuotas sin interés de $329.153" },
];

const rawEliteSeries = [
  { name: "PC ELITE Amd Ryzen 9 9950X3D 16-Core + 64GB DDR5 + RTX 5090 32GB", brand: "COMPU ELITE | SKU: PCE449", price: "$7.631.407\n$8.197.000\n6 cuotas sin interés de $1.338.843", featured: true },
  { name: "PC ELITE Intel Core Ultra 5 245KF 14-Core + 32GB DDR5 + RTX 5070 TI 16GB", brand: "COMPU ELITE | SKU: PCE404", price: "$3.036.200\n$3.400.000\n6 cuotas sin interés de $532.667" },
  { name: "PC ELITE Intel Core Ultra 7 265KF 20-Core + 32GB DDR5 + RTX 5070 TI 16GB", brand: "COMPU ELITE | SKU: PCE405", price: "$3.157.952\n$3.392.000\n6 cuotas sin interés de $554.027" },
  { name: "PC ELITE Intel Core Ultra 9 285KF 24-Core + 32GB DDR5 + RTX 5070 TI 16GB", brand: "COMPU ELITE | SKU: PCE406", price: "$3.578.764\n$3.844.000\n6 cuotas sin interés de $627.853" },
  { name: "PC ELITE Intel Core Ultra 5 245KF 14-Core + 32GB DDR5 + RTX 5070 12GB", brand: "COMPU ELITE | SKU: PCE432", price: "$2.598.630\n$2.910.000\n6 cuotas sin interés de $455.900" },
  { name: "PC ELITE Intel Core Ultra 7 265KF 20-Core + 32GB DDR5 + RTX 5070 12GB", brand: "COMPU ELITE | SKU: PCE433", price: "$2.701.762\n$2.902.000\n6 cuotas sin interés de $473.993" },
  { name: "PC ELITE Intel Core Ultra 9 285KF 24-Core + 32GB DDR5 + RTX 5070 12GB", brand: "COMPU ELITE | SKU: PCE434", price: "$3.121.643\n$3.353.000\n6 cuotas sin interés de $547.657" },
  { name: "PC ELITE Intel Core Ultra 7 265KF 20-Core + 32GB DDR5 + RTX 5080 16GB", brand: "COMPU ELITE | SKU: PCE442", price: "$3.901.821\n$4.191.000\n6 cuotas sin interés de $684.530", featured: true },
  { name: "PC ELITE Intel Core Ultra 9 285KF 24-Core + 32GB DDR5 + RTX 5080 16GB", brand: "COMPU ELITE | SKU: PCE443", price: "$4.321.702\n$4.642.000\n6 cuotas sin interés de $758.193" },
  { name: "PC ELITE Intel Ultra 9 285KF 24-Core + 64GB DDR5 + RTX 5090 32GB", brand: "COMPU ELITE | SKU: PCE292", price: "$7.328.832\n$7.872.000\n6 cuotas sin interés de $1.285.760", featured: true },
  { name: "PC ELITE Intel i7 14700KF 20-core + Z790 WIFI+BT + 32GB DDR5 + RTX 5090 32GB", brand: "COMPU ELITE | SKU: PCE293", price: "$6.307.525\n$6.775.000\n6 cuotas sin interés de $1.106.583" },
  { name: "PC ELITE Intel i9 14900KF 24-Core + Z790 WIFI+BT + 32GB DDR5 + RTX 5090 32GB", brand: "COMPU ELITE | SKU: PCE294", price: "$6.758.129\n$7.259.000\n6 cuotas sin interés de $1.185.637" },
  { name: "PC ELITE Amd Ryzen 7 9700X 8-Core + 32GB DDR5 + RTX 5070 Ti 16GB", brand: "COMPU ELITE | SKU: PCE304", price: "$3.043.344\n$3.408.000\n6 cuotas sin interés de $533.920" },
  { name: "PC ELITE Amd Ryzen 7 9700X 8-Core + 32GB DDR5 + RTX 5080 16GB", brand: "COMPU ELITE | SKU: PCE322", price: "$3.915.786\n$4.206.000\n6 cuotas sin interés de $686.980" },
  { name: "PC ELITE Amd Ryzen 9 9900X 12-Core + 32GB DDR5 + RTX 5070 TI 16GB", brand: "COMPU ELITE | SKU: PCE324", price: "$3.285.499\n$3.529.000\n6 cuotas sin interés de $576.403" },
  { name: "PC ELITE Amd Ryzen 7 9700X 8-Core + 32GB DDR5 + RTX 5070 12GB", brand: "COMPU ELITE | SKU: PCE339", price: "$2.779.966\n$2.986.000\n6 cuotas sin interés de $487.713" },
  { name: "PC ELITE Amd Ryzen 9 9900X 12-Core + 32GB DDR5 + RTX 5070 12GB", brand: "COMPU ELITE | SKU: PCE340", price: "$2.892.617\n$3.107.000\n6 cuotas sin interés de $507.477" },
  { name: "PC ELITE Amd Ryzen 9 9950X 16-Core + 32GB DDR5 + RTX 5070 12GB", brand: "COMPU ELITE | SKU: PCE341", price: "$3.076.024\n$3.304.000\n6 cuotas sin interés de $539.653" },
  { name: "PC ELITE Amd Ryzen 7 9800X3D 8-Core + 32GB DDR5 + RTX 5070 Ti 16GB", brand: "COMPU ELITE | SKU: PCE394", price: "$3.352.531\n$3.601.000\n6 cuotas sin interés de $588.163", featured: true },
  { name: "PC ELITE Amd Ryzen 7 9800X3D 8-Core + 32GB DDR5 + RTX 5070 12GB", brand: "COMPU ELITE | SKU: PCE412", price: "$2.895.410\n$3.110.000\n6 cuotas sin interés de $507.967" },
  { name: "PC ELITE Amd Ryzen 9 9950X3D 16-Core + 32GB DDR5 + RTX 5080 16GB", brand: "COMPU ELITE | SKU: PCE445", price: "$4.492.075\n$4.825.000\n6 cuotas sin interés de $788.083" },
  { name: "PC ELITE Amd Ryzen 9 9950X3D 16-Core + 32GB DDR5 + RTX 5090 32GB", brand: "COMPU ELITE | SKU: PCE448", price: "$7.159.390\n$7.690.000\n6 cuotas sin interés de $1.256.033" },
  { name: "PC ELITE Amd Ryzen 7 9700X 8-Core + 32GB DDR5 + RTX 5060 Ti 16GB", brand: "COMPU ELITE | SKU: PCE489", price: "$2.556.526\n$2.746.000\n6 cuotas sin interés de $448.513" },
  { name: "PC ELITE Amd Ryzen 7 9800X3D 8-Core + 32GB DDR5 + RTX 5060 Ti 16GB", brand: "COMPU ELITE | SKU: PCE490", price: "$2.736.209\n$2.939.000\n6 cuotas sin interés de $480.037" },
];

const rawMonitors = [
  { name: "Monitor Gamer Asus TUF 27\" IPS FullHD VG279QL3A 180Hz/1ms", brand: "ASUS | SKU: MON064", price: "$206.315\n$246.788\n6 cuotas sin interés de $36.196", featured: true },
  { name: "Monitor MSI 27 Full HD IPS 100Hz/1ms PRO MP272L", brand: "MSI | SKU: MON073", price: "$88.280\n$99.920\n6 cuotas sin interés de $15.488" },
  { name: "Monitor Gamer Xiaomi 2K IPS QHD 2560x1440 G27Qi 180Hz/1ms", brand: "XIAOMI | SKU: MON074", price: "$185.862\n$210.370\n6 cuotas sin interés de $32.607", featured: true },
  { name: "Monitor Gamer Xiaomi 34\" 3440x1440 VA WQHD Curvo 180Hz/1ms G34WQi", brand: "XIAOMI | SKU: MON075", price: "$267.612\n$302.900\n6 cuotas sin interés de $46.950" },
  { name: "Monitor Gamer Samsung Odyssey G8 34\" OLED WQHD Curvo 175Hz/0.03ms G85SD", brand: "SAMSUNG | SKU: MON076", price: "$928.559\n$1.051.000\n6 cuotas sin interés de $162.905", featured: true },
  { name: "Monitor Asus 24\" Business Full HD IPS 120Hz/1ms VA249QGS", brand: "ASUS | SKU: MON077", price: "$127.224\n$144.000\n6 cuotas sin interés de $22.320" },
  { name: "Monitor Asus 27\" Business Full HD IPS 120Hz/1ms VA279QGS", brand: "ASUS | SKU: MON078", price: "$151.476\n$171.450\n6 cuotas sin interés de $26.575" },
  { name: "Monitor Gamer Asus ROG Strix 32\" 4K QD-OLED 165Hz/0.03ms XG32UCDS", brand: "ASUS | SKU: MON079", price: "$981.947\n$1.111.428\n6 cuotas sin interés de $172.271", featured: true },
  { name: "Monitor Gamer Viewsonic 27\" Full HD IPS 200Hz/1ms VX2729", brand: "ViewSonic | SKU: MON080", price: "$132.927\n$150.455\n6 cuotas sin interés de $23.321" },
  { name: "Monitor Gamer Samsung Odyssey G5 32\" 2560x1440 VA QHD Curvo 165Hz/1ms", brand: "SAMSUNG | SKU: MON081", price: "$213.379\n$241.515\n6 cuotas sin interés de $37.435" },
  { name: "Monitor Gamer Samsung Odyssey G3 27\" 1920x1080 VA FHD 180Hz/1ms", brand: "SAMSUNG | SKU: MON082", price: "$159.391\n$180.409\n6 cuotas sin interés de $27.963" },
  { name: "Monitor Viewsonic 24\" Full HD IPS 100Hz/1ms VGA/HDMI VA240-H", brand: "ViewSonic | SKU: MON083", price: "$72.880\n$82.490\n6 cuotas sin interés de $12.786" },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Compuelite database...");

  // Categories
  const [catPCGamer, catPCStartSeries, catPCPro, catPCElite, catMonitores, catWorkstation] =
    await Promise.all([
      db.category.upsert({
        where: { slug: "pc-gamer" },
        update: {},
        create: { name: "PC Gamer", slug: "pc-gamer", sortOrder: 1 },
      }),
      db.category.upsert({
        where: { slug: "pc-gamer-start-series" },
        update: {},
        create: { name: "PC Gamer START Series", slug: "pc-gamer-start-series", sortOrder: 2 },
      }),
      db.category.upsert({
        where: { slug: "pc-gamer-pro-series" },
        update: {},
        create: { name: "PC Gamer PRO Series", slug: "pc-gamer-pro-series", sortOrder: 3 },
      }),
      db.category.upsert({
        where: { slug: "pc-elite" },
        update: {},
        create: { name: "PC ELITE®", slug: "pc-elite", sortOrder: 4 },
      }),
      db.category.upsert({
        where: { slug: "monitores" },
        update: {},
        create: { name: "Monitores", slug: "monitores", sortOrder: 5 },
      }),
      db.category.upsert({
        where: { slug: "workstation" },
        update: {},
        create: { name: "PC Workstation", slug: "workstation", sortOrder: 6 },
      }),
    ]);

  console.log("✅ Categories created");

  // Helper to upsert a product
  async function upsertProduct(
    raw: { name: string; brand: string; price: string; featured?: boolean },
    categoryId: string,
    extraSlugSuffix?: string
  ) {
    const sku = parseSku(raw.brand);
    const brand = parseBrand(raw.brand);
    const price = parsePrice(raw.price);
    const compareAtPrice = parseComparePrice(raw.price);
    const baseSlug = slugify(raw.name);
    const slug = extraSlugSuffix ? `${baseSlug}-${extraSlugSuffix}` : baseSlug;

    try {
      return await db.product.upsert({
        where: { sku },
        update: { price, compareAtPrice, status: ProductStatus.ACTIVE },
        create: {
          sku,
          name: raw.name,
          slug,
          brand,
          price,
          compareAtPrice,
          currency: "CLP",
          categoryId,
          productType: ProductType.PREBUILT,
          status: ProductStatus.ACTIVE,
          stock: Math.floor(Math.random() * 8) + 2,
          featured: raw.featured ?? false,
          publishedAt: new Date(),
          shortDescription: raw.name,
          tags: ["pc-armada", brand.toLowerCase().replace(/\s+/g, "-")],
        },
      });
    } catch (e) {
      // Slug conflict — append SKU
      return await db.product.upsert({
        where: { sku },
        update: { price, compareAtPrice, status: ProductStatus.ACTIVE },
        create: {
          sku,
          name: raw.name,
          slug: `${baseSlug}-${sku.toLowerCase()}`,
          brand,
          price,
          compareAtPrice,
          currency: "CLP",
          categoryId,
          productType: ProductType.PREBUILT,
          status: ProductStatus.ACTIVE,
          stock: Math.floor(Math.random() * 8) + 2,
          featured: raw.featured ?? false,
          publishedAt: new Date(),
          shortDescription: raw.name,
          tags: ["pc-armada", brand.toLowerCase().replace(/\s+/g, "-")],
        },
      });
    }
  }

  // Seed all product groups
  let count = 0;

  for (const p of rawStartSeries) {
    await upsertProduct(p, catPCStartSeries.id);
    count++;
  }
  console.log(`✅ START Series: ${rawStartSeries.length} products`);

  for (const p of rawProSeries) {
    await upsertProduct(p, catPCPro.id);
    count++;
  }
  console.log(`✅ PRO Series: ${rawProSeries.length} products`);

  for (const p of rawEliteSeries) {
    await upsertProduct(p, catPCElite.id);
    count++;
  }
  console.log(`✅ ELITE Series: ${rawEliteSeries.length} products`);

  for (const p of rawMonitors) {
    await upsertProduct(p, catMonitores.id);
    count++;
  }
  console.log(`✅ Monitores: ${rawMonitors.length} products`);

  console.log(`\n🎮 Total: ${count} productos cargados en la base de datos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
