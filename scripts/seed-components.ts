/**
 * Seeds individual PC components for the builder configurator.
 * Run: npx tsx scripts/seed-components.ts
 */
import { db } from "../src/server/db/client";
import { ProductStatus, ComponentType } from "@prisma/client";

const components = [
  // ── TARJETAS DE VIDEO ────────────────────────────────────────────────────
  { name: "Gigabyte GeForce RTX 4060 OC 8GB GDDR6", brand: "Gigabyte", sku: "GV-N4060OC-8GD", price: 359990, stock: 8, componentType: ComponentType.GPU,
    specs: { vram: "8GB GDDR6", cores: 3072, tdp: 115, boost_clock: "2535 MHz", pcie: "4.0 x8" } },
  { name: "MSI GeForce RTX 4060 Ti Gaming X 8GB GDDR6", brand: "MSI", sku: "RTX4060TI-GX-8G", price: 489990, stock: 5, componentType: ComponentType.GPU,
    specs: { vram: "8GB GDDR6", cores: 4352, tdp: 160, boost_clock: "2625 MHz", pcie: "4.0 x8" } },
  { name: "Asus GeForce RTX 4070 SUPER OC 12GB GDDR6X", brand: "Asus", sku: "RTX4070S-O12G-EVO", price: 679990, stock: 4, componentType: ComponentType.GPU,
    specs: { vram: "12GB GDDR6X", cores: 7168, tdp: 220, boost_clock: "2610 MHz", pcie: "4.0 x16" } },
  { name: "Gigabyte GeForce RTX 4070 Ti SUPER OC 16GB GDDR6X", brand: "Gigabyte", sku: "GV-N407TSAORUS-16GD", price: 929990, stock: 3, componentType: ComponentType.GPU,
    specs: { vram: "16GB GDDR6X", cores: 8448, tdp: 285, boost_clock: "2670 MHz", pcie: "4.0 x16" } },
  { name: "MSI GeForce RTX 4080 SUPER Gaming X Slim 16GB", brand: "MSI", sku: "RTX4080S-GAMINGX-16G", price: 1299990, stock: 2, componentType: ComponentType.GPU,
    specs: { vram: "16GB GDDR6X", cores: 10240, tdp: 320, boost_clock: "2610 MHz", pcie: "4.0 x16" } },
  { name: "Asus GeForce RTX 5070 ProArt OC 12GB GDDR7", brand: "Asus", sku: "PROART-RTX5070-O12G", price: 949990, stock: 6, componentType: ComponentType.GPU,
    specs: { vram: "12GB GDDR7", cores: 6144, tdp: 200, boost_clock: "2775 MHz", pcie: "5.0 x16" } },
  { name: "MSI GeForce RTX 5070 Ti Gaming X 16GB GDDR7", brand: "MSI", sku: "RTX5070TI-GX-16G", price: 1249990, stock: 4, componentType: ComponentType.GPU,
    specs: { vram: "16GB GDDR7", cores: 8960, tdp: 300, boost_clock: "2887 MHz", pcie: "5.0 x16" } },
  { name: "Gigabyte GeForce RTX 5080 AORUS Master 16GB GDDR7", brand: "Gigabyte", sku: "GV-N5080AORUS-16GD", price: 1649990, stock: 2, componentType: ComponentType.GPU,
    specs: { vram: "16GB GDDR7", cores: 10752, tdp: 360, boost_clock: "2987 MHz", pcie: "5.0 x16" } },

  // ── PROCESADORES ─────────────────────────────────────────────────────────
  { name: "AMD Ryzen 5 7600X 6-Core 4.7GHz AM5", brand: "AMD", sku: "100-100000593WOF", price: 239990, stock: 10, componentType: ComponentType.CPU,
    specs: { cores: 6, threads: 12, base_clock: "4.7 GHz", boost_clock: "5.3 GHz", tdp: 105, socket: "AM5", ddr: "DDR5" } },
  { name: "AMD Ryzen 5 9600X 6-Core 3.9GHz AM5", brand: "AMD", sku: "100-100001405WOF", price: 279990, stock: 8, componentType: ComponentType.CPU,
    specs: { cores: 6, threads: 12, base_clock: "3.9 GHz", boost_clock: "5.4 GHz", tdp: 65, socket: "AM5", ddr: "DDR5" } },
  { name: "AMD Ryzen 7 7700X 8-Core 4.5GHz AM5", brand: "AMD", sku: "100-100000591WOF", price: 309990, stock: 6, componentType: ComponentType.CPU,
    specs: { cores: 8, threads: 16, base_clock: "4.5 GHz", boost_clock: "5.4 GHz", tdp: 105, socket: "AM5", ddr: "DDR5" } },
  { name: "AMD Ryzen 7 9700X 8-Core 3.8GHz AM5", brand: "AMD", sku: "100-100001404WOF", price: 359990, stock: 7, componentType: ComponentType.CPU,
    specs: { cores: 8, threads: 16, base_clock: "3.8 GHz", boost_clock: "5.5 GHz", tdp: 65, socket: "AM5", ddr: "DDR5" } },
  { name: "AMD Ryzen 7 9800X3D 8-Core 4.7GHz AM5 3D V-Cache", brand: "AMD", sku: "100-100001314WOF", price: 489990, stock: 5, componentType: ComponentType.CPU,
    specs: { cores: 8, threads: 16, base_clock: "4.7 GHz", boost_clock: "5.2 GHz", tdp: 120, socket: "AM5", ddr: "DDR5", vcache: "96MB L3" } },
  { name: "Intel Core i5-14600K 14-Core 3.5GHz LGA1700", brand: "Intel", sku: "BX8071514600K", price: 299990, stock: 9, componentType: ComponentType.CPU,
    specs: { cores: 14, threads: 20, base_clock: "3.5 GHz", boost_clock: "5.3 GHz", tdp: 125, socket: "LGA1700", ddr: "DDR4/DDR5" } },
  { name: "Intel Core i7-14700K 20-Core 3.4GHz LGA1700", brand: "Intel", sku: "BX8071514700K", price: 419990, stock: 4, componentType: ComponentType.CPU,
    specs: { cores: 20, threads: 28, base_clock: "3.4 GHz", boost_clock: "5.6 GHz", tdp: 125, socket: "LGA1700", ddr: "DDR4/DDR5" } },

  // ── PLACAS MADRE ─────────────────────────────────────────────────────────
  { name: "MSI B650M Pro-A WiFi DDR5 AM5 Micro-ATX", brand: "MSI", sku: "7E26-001R", price: 149990, stock: 8, componentType: ComponentType.MOTHERBOARD,
    specs: { socket: "AM5", chipset: "B650", form_factor: "mATX", ddr: "DDR5", slots_ram: 4, pcie: "5.0 x16", m2: 2, wifi: true } },
  { name: "Asus ROG Strix B650-F Gaming WiFi DDR5 AM5 ATX", brand: "Asus", sku: "90MB1BN0-M0EAY0", price: 289990, stock: 5, componentType: ComponentType.MOTHERBOARD,
    specs: { socket: "AM5", chipset: "B650", form_factor: "ATX", ddr: "DDR5", slots_ram: 4, pcie: "5.0 x16", m2: 4, wifi: true } },
  { name: "Gigabyte X670E Aorus Pro X DDR5 AM5 ATX", brand: "Gigabyte", sku: "X670E-AORUS-PRO-X", price: 489990, stock: 3, componentType: ComponentType.MOTHERBOARD,
    specs: { socket: "AM5", chipset: "X670E", form_factor: "ATX", ddr: "DDR5", slots_ram: 4, pcie: "5.0 x16", m2: 5, wifi: true } },
  { name: "MSI PRO B760M-A WiFi DDR5 LGA1700 Micro-ATX", brand: "MSI", sku: "7E03-001R", price: 139990, stock: 9, componentType: ComponentType.MOTHERBOARD,
    specs: { socket: "LGA1700", chipset: "B760", form_factor: "mATX", ddr: "DDR4/DDR5", slots_ram: 4, pcie: "5.0 x16", m2: 2, wifi: true } },
  { name: "Asus PRIME Z790-P WiFi DDR5 LGA1700 ATX", brand: "Asus", sku: "90MB1CK0-M0EAY0", price: 229990, stock: 6, componentType: ComponentType.MOTHERBOARD,
    specs: { socket: "LGA1700", chipset: "Z790", form_factor: "ATX", ddr: "DDR4/DDR5", slots_ram: 4, pcie: "5.0 x16", m2: 3, wifi: true } },

  // ── MEMORIA RAM ──────────────────────────────────────────────────────────
  { name: "Kingston Fury Beast 16GB DDR5 5600MHz (2x8GB)", brand: "Kingston", sku: "KF556C40BBK2-16", price: 69990, stock: 12, componentType: ComponentType.RAM,
    specs: { capacity: "16GB", type: "DDR5", speed: "5600 MHz", modules: "2x8GB", cl: "CL40", rgb: false } },
  { name: "Kingston Fury Beast 32GB DDR5 6000MHz RGB (2x16GB)", brand: "Kingston", sku: "KF560C40BBAK2-32", price: 109990, stock: 10, componentType: ComponentType.RAM,
    specs: { capacity: "32GB", type: "DDR5", speed: "6000 MHz", modules: "2x16GB", cl: "CL40", rgb: true } },
  { name: "Corsair Vengeance 64GB DDR5 6000MHz (2x32GB)", brand: "Corsair", sku: "CMK64GX5M2E6000C36", price: 199990, stock: 5, componentType: ComponentType.RAM,
    specs: { capacity: "64GB", type: "DDR5", speed: "6000 MHz", modules: "2x32GB", cl: "CL36", rgb: false } },
  { name: "G.Skill Ripjaws S5 32GB DDR5 6400MHz (2x16GB)", brand: "G.Skill", sku: "F5-6400J3239G16GX2-RS5K", price: 129990, stock: 7, componentType: ComponentType.RAM,
    specs: { capacity: "32GB", type: "DDR5", speed: "6400 MHz", modules: "2x16GB", cl: "CL32", rgb: false } },

  // ── ALMACENAMIENTO (SSD) ─────────────────────────────────────────────────
  { name: "Samsung 970 EVO Plus 500GB NVMe Gen3 M.2", brand: "Samsung", sku: "MZ-V7S500B/AM", price: 59990, stock: 15, componentType: ComponentType.STORAGE_SSD,
    specs: { capacity: "500GB", interface: "NVMe PCIe 3.0 x4", read: "3500 MB/s", write: "3200 MB/s", form_factor: "M.2 2280" } },
  { name: "Samsung 990 Pro 1TB NVMe Gen4 M.2", brand: "Samsung", sku: "MZ-V9P1T0B/AM", price: 109990, stock: 12, componentType: ComponentType.STORAGE_SSD,
    specs: { capacity: "1TB", interface: "NVMe PCIe 4.0 x4", read: "7450 MB/s", write: "6900 MB/s", form_factor: "M.2 2280" } },
  { name: "Samsung 990 Pro 2TB NVMe Gen4 M.2", brand: "Samsung", sku: "MZ-V9P2T0B/AM", price: 179990, stock: 8, componentType: ComponentType.STORAGE_SSD,
    specs: { capacity: "2TB", interface: "NVMe PCIe 4.0 x4", read: "7450 MB/s", write: "6900 MB/s", form_factor: "M.2 2280" } },
  { name: "Kingston NV3 1TB NVMe Gen4 M.2", brand: "Kingston", sku: "SNV3S/1000G", price: 79990, stock: 14, componentType: ComponentType.STORAGE_SSD,
    specs: { capacity: "1TB", interface: "NVMe PCIe 4.0 x4", read: "6000 MB/s", write: "4000 MB/s", form_factor: "M.2 2280" } },
  { name: "WD Black SN850X 1TB NVMe Gen4 M.2", brand: "WD", sku: "WDS100T2X0E", price: 119990, stock: 9, componentType: ComponentType.STORAGE_SSD,
    specs: { capacity: "1TB", interface: "NVMe PCIe 4.0 x4", read: "7300 MB/s", write: "6600 MB/s", form_factor: "M.2 2280" } },

  // ── REFRIGERACIÓN ────────────────────────────────────────────────────────
  { name: "DeepCool AK400 CPU Air Cooler 120mm", brand: "DeepCool", sku: "R-AK400-BKNNMN-G-1", price: 39990, stock: 12, componentType: ComponentType.CPU_COOLER,
    specs: { type: "Air", fan_size: "120mm", tdp: 220, height: "155mm", sockets: "AM5/AM4/LGA1700" } },
  { name: "Noctua NH-D15 CPU Air Cooler Dual Tower", brand: "Noctua", sku: "NH-D15", price: 129990, stock: 5, componentType: ComponentType.CPU_COOLER,
    specs: { type: "Air", fan_size: "2x140mm", tdp: 300, height: "165mm", sockets: "AM5/AM4/LGA1700" } },
  { name: "DeepCool LE360 V2 AIO 360mm ARGB", brand: "DeepCool", sku: "R-LE360-BKAMND-G-1", price: 99990, stock: 8, componentType: ComponentType.CPU_COOLER,
    specs: { type: "AIO", radiator: "360mm", fan_size: "3x120mm", tdp: 350, sockets: "AM5/AM4/LGA1700" } },
  { name: "Corsair iCUE H150i ELITE AIO 360mm LCD", brand: "Corsair", sku: "CW-9060077-WW", price: 179990, stock: 4, componentType: ComponentType.CPU_COOLER,
    specs: { type: "AIO", radiator: "360mm", fan_size: "3x120mm", tdp: 400, sockets: "AM5/AM4/LGA1700", display: "LCD" } },

  // ── FUENTES DE PODER ─────────────────────────────────────────────────────
  { name: "Corsair CV550 550W 80 Plus Bronze ATX", brand: "Corsair", sku: "CP-9020210-NA", price: 59990, stock: 10, componentType: ComponentType.PSU,
    specs: { wattage: 550, efficiency: "80+ Bronze", modular: false, atx: "24+8-pin" } },
  { name: "Seasonic Focus GX-750 750W 80 Plus Gold Full Modular", brand: "Seasonic", sku: "SSR-750FX", price: 139990, stock: 8, componentType: ComponentType.PSU,
    specs: { wattage: 750, efficiency: "80+ Gold", modular: "Full", atx: "24+8-pin" } },
  { name: "Corsair RM850x 850W 80 Plus Gold Full Modular", brand: "Corsair", sku: "CP-9020200-NA", price: 159990, stock: 6, componentType: ComponentType.PSU,
    specs: { wattage: 850, efficiency: "80+ Gold", modular: "Full", atx: "24+8-pin" } },
  { name: "be quiet! Dark Power 13 1000W 80 Plus Titanium", brand: "be quiet!", sku: "BN339", price: 269990, stock: 3, componentType: ComponentType.PSU,
    specs: { wattage: 1000, efficiency: "80+ Titanium", modular: "Full", atx: "24+8-pin" } },

  // ── GABINETES ─────────────────────────────────────────────────────────────
  { name: "NZXT H5 Flow Mid-Tower Vidrio Templado Blanco", brand: "NZXT", sku: "CC-H51FW-01", price: 129990, stock: 6, componentType: ComponentType.CASE,
    specs: { form_factor: "Mid-Tower", mb_support: "ATX/mATX/ITX", fans_included: "2x120mm", max_gpu_length: "365mm", max_cooler_height: "165mm" } },
  { name: "Fractal Design Meshify 2 ATX Negro Malla", brand: "Fractal Design", sku: "FD-C-MES2A-01", price: 179990, stock: 5, componentType: ComponentType.CASE,
    specs: { form_factor: "Mid-Tower", mb_support: "E-ATX/ATX/mATX/ITX", fans_included: "3x140mm", max_gpu_length: "467mm", max_cooler_height: "185mm" } },
  { name: "Lian Li Lancool 216 RGB Mid-Tower Vidrio Templado", brand: "Lian Li", sku: "G99.OL216RX.00", price: 149990, stock: 7, componentType: ComponentType.CASE,
    specs: { form_factor: "Mid-Tower", mb_support: "ATX/mATX/ITX", fans_included: "2x160mm", max_gpu_length: "435mm", max_cooler_height: "176mm" } },
  { name: "Corsair 4000D Airflow Mid-Tower Negro Vidrio Templado", brand: "Corsair", sku: "CC-9011200-WW", price: 119990, stock: 9, componentType: ComponentType.CASE,
    specs: { form_factor: "Mid-Tower", mb_support: "ATX/mATX/ITX", fans_included: "2x120mm", max_gpu_length: "360mm", max_cooler_height: "170mm" } },
];

async function main() {
  console.log(`Seeding ${components.length} component products...`);

  // Ensure a "Componentes" category exists
  const cat = await db.category.upsert({
    where: { slug: "componentes" },
    create: { name: "Componentes", slug: "componentes", description: "Componentes individuales para armar tu PC" },
    update: {},
  });
  console.log(`Category: ${cat.name} (${cat.id})`);

  for (const comp of components) {
    const { specs, ...data } = comp;
    await db.product.upsert({
      where: { sku: data.sku },
      create: {
        ...data,
        categoryId: cat.id,
        status: ProductStatus.ACTIVE,
        specs: JSON.parse(JSON.stringify(specs)),
        slug: data.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: `${data.name} — Componente de alta calidad para tu PC gamer o workstation.`,
      },
      update: {
        price: data.price,
        stock: data.stock,
        status: ProductStatus.ACTIVE,
        componentType: data.componentType,
      },
    });
    process.stdout.write(".");
  }

  console.log(`\nDone! Seeded ${components.length} components.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
