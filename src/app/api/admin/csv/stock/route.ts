import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { parseCSV, requireAdmin, unauthorizedResponse } from "@/lib/csvAdmin";
import { MovementType } from "@prisma/client";
import { randomUUID } from "crypto";
import { syncPrebuiltStock } from "@/lib/syncPrebuiltStock";

type StockRow = { sku: string; stock: string; notas?: string };

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  const { rows, error } = await parseCSV<StockRow>(req);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (rows.length === 0) return NextResponse.json({ error: "El CSV está vacío" }, { status: 400 });

  const batchId = randomUUID();
  const results: { sku: string; status: "ok" | "error"; message?: string; old?: number; new?: number }[] = [];

  for (const row of rows) {
    const sku   = row.sku?.trim();
    const stock = parseInt(row.stock?.trim() ?? "", 10);

    if (!sku)          { results.push({ sku: sku ?? "?", status: "error", message: "SKU vacío" }); continue; }
    if (isNaN(stock) || stock < 0) { results.push({ sku, status: "error", message: "Stock inválido" }); continue; }

    const product = await db.product.findUnique({ where: { sku }, select: { id: true, stock: true } });
    if (!product) { results.push({ sku, status: "error", message: "SKU no encontrado" }); continue; }

    const diff = stock - product.stock;
    await db.$transaction([
      db.product.update({ where: { sku }, data: { stock } }),
      db.stockMovement.create({
        data: {
          productId: product.id,
          type: MovementType.CSV_IMPORT,
          quantity: diff,
          previousStock: product.stock,
          newStock: stock,
          reference: row.notas?.trim() || `CSV batch ${batchId}`,
          batchId,
        },
      }),
    ]);

    results.push({ sku, status: "ok", old: product.stock, new: stock });
  }

  // Sync any PREBUILT products whose components were updated
  const updatedIds = results.filter(r => r.status === "ok").map(r => {
    const p = rows.find(row => row.sku?.trim() === r.sku);
    return p ? r.sku : null;
  }).filter(Boolean) as string[];
  if (updatedIds.length > 0) {
    const products = await db.product.findMany({ where: { sku: { in: updatedIds } }, select: { id: true } });
    await syncPrebuiltStock(db, products.map(p => p.id));
  }

  const successRows = results.filter(r => r.status === "ok").length;
  const errorRows   = results.filter(r => r.status === "error").length;

  await db.csvImportLog.create({
    data: {
      fileName: "stock-update.csv",
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
