import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { parseCSV, requireAdmin, unauthorizedResponse } from "@/lib/csvAdmin";
import { randomUUID } from "crypto";
import { ProductType, ProductStatus, ComponentType } from "@prisma/client";

type ProductRow = {
  sku: string;
  name: string;
  brand: string;
  price: string;
  compare_price?: string;
  stock?: string;
  category_slug: string;
  product_type?: string;
  description?: string;
  image_url?: string;
  status?: string;
};

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  const { rows, error } = await parseCSV<ProductRow>(req);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (rows.length === 0) return NextResponse.json({ error: "El CSV está vacío" }, { status: 400 });

  const batchId = randomUUID();
  const results: { sku: string; status: "ok" | "skip" | "error"; message?: string }[] = [];

  // Pre-fetch all categories to avoid N+1
  const categories = await db.category.findMany({ select: { id: true, slug: true } });
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

  for (const row of rows) {
    const sku  = row.sku?.trim();
    const name = row.name?.trim();
    const brand = row.brand?.trim();
    const price = parseFloat(row.price?.trim().replace(/[^0-9.]/g, "") ?? "");
    const comparePrice = row.compare_price ? parseFloat(row.compare_price.trim().replace(/[^0-9.]/g, "")) : undefined;
    const stock = row.stock ? parseInt(row.stock.trim(), 10) : 0;
    const categorySlug = row.category_slug?.trim();
    const categoryId = catMap[categorySlug];

    if (!sku)        { results.push({ sku: sku ?? "?", status: "error", message: "SKU vacío" }); continue; }
    if (!name)       { results.push({ sku, status: "error", message: "Nombre vacío" }); continue; }
    if (!brand)      { results.push({ sku, status: "error", message: "Marca vacía" }); continue; }
    if (isNaN(price) || price <= 0) { results.push({ sku, status: "error", message: "Precio inválido" }); continue; }
    if (!categoryId) { results.push({ sku, status: "error", message: `Categoría '${categorySlug}' no encontrada` }); continue; }

    // Skip if SKU already exists
    const existing = await db.product.findUnique({ where: { sku }, select: { id: true } });
    if (existing) { results.push({ sku, status: "skip", message: "SKU ya existe — omitido" }); continue; }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${sku.toLowerCase()}`;

    const productType = (row.product_type?.trim().toUpperCase() as ProductType | undefined)
      ?? ProductType.STANDALONE;

    const imageUrl = row.image_url?.trim();

    await db.product.create({
      data: {
        sku,
        name,
        slug,
        brand,
        price: price,
        compareAtPrice: comparePrice ?? null,
        stock: isNaN(stock) ? 0 : stock,
        categoryId,
        productType: Object.values(ProductType).includes(productType) ? productType : ProductType.STANDALONE,
        description: row.description?.trim() || null,
        status: ProductStatus.ACTIVE,
        images: imageUrl ? { create: { url: imageUrl, sortOrder: 0 } } : undefined,
      },
    });

    results.push({ sku, status: "ok" });
  }

  const successRows = results.filter(r => r.status === "ok").length;
  const skipRows    = results.filter(r => r.status === "skip").length;
  const errorRows   = results.filter(r => r.status === "error").length;

  await db.csvImportLog.create({
    data: {
      fileName: "products-import.csv",
      totalRows: rows.length,
      successRows,
      errorRows,
      errors: results.filter(r => r.status !== "ok"),
      status: errorRows === 0 ? "COMPLETED" : successRows > 0 ? "COMPLETED_WITH_ERRORS" : "FAILED",
      importedBy: session.user.email ?? session.user.id,
      batchId,
    },
  });

  return NextResponse.json({ batchId, totalRows: rows.length, successRows, skipRows, errorRows, results });
}
