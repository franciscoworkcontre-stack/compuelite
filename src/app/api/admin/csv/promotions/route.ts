import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { parseCSV, requireAdmin, unauthorizedResponse } from "@/lib/csvAdmin";
import { randomUUID } from "crypto";

type PromoRow = {
  sku: string;
  precio_oferta: string;
  precio_original: string;
};

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  const { rows, error } = await parseCSV<PromoRow>(req);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (rows.length === 0) return NextResponse.json({ error: "El CSV está vacío" }, { status: 400 });

  const batchId = randomUUID();
  const results: { sku: string; status: "ok" | "error"; message?: string }[] = [];

  for (const row of rows) {
    const sku          = row.sku?.trim();
    const salePrice    = parseFloat(row.precio_oferta?.trim().replace(/[^0-9.]/g, "") ?? "");
    const origPrice    = parseFloat(row.precio_original?.trim().replace(/[^0-9.]/g, "") ?? "");

    if (!sku)                  { results.push({ sku: sku ?? "?", status: "error", message: "SKU vacío" }); continue; }
    if (isNaN(salePrice) || salePrice <= 0) { results.push({ sku, status: "error", message: "precio_oferta inválido" }); continue; }
    if (isNaN(origPrice) || origPrice <= salePrice) { results.push({ sku, status: "error", message: "precio_original debe ser mayor que precio_oferta" }); continue; }

    const product = await db.product.findUnique({ where: { sku }, select: { id: true } });
    if (!product) { results.push({ sku, status: "error", message: "SKU no encontrado" }); continue; }

    await db.product.update({
      where: { sku },
      data: {
        price: salePrice,
        compareAtPrice: origPrice,
      },
    });

    results.push({ sku, status: "ok" });
  }

  const successRows = results.filter(r => r.status === "ok").length;
  const errorRows   = results.filter(r => r.status === "error").length;

  await db.csvImportLog.create({
    data: {
      fileName: "promotions-upload.csv",
      totalRows: rows.length,
      successRows,
      errorRows,
      errors: results.filter(r => r.status === "error"),
      status: errorRows === 0 ? "COMPLETED" : successRows > 0 ? "COMPLETED_WITH_ERRORS" : "FAILED",
      importedBy: session.user.email ?? session.user.id,
      batchId,
    },
  });

  return NextResponse.json({ batchId, totalRows: rows.length, successRows, errorRows, results });
}
