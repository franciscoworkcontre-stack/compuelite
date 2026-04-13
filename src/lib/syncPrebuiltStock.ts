import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

// Accepts either the full PrismaClient or a transaction client
type AnyDB = PrismaClient | Prisma.TransactionClient;

/**
 * After a component's stock changes, recalculate the `stock` field of every
 * PREBUILT product that uses it as a required BomItem component.
 *
 * A PREBUILT is available only when ALL required components are in stock.
 * Its effective stock = min(required component stocks).
 *
 * Call this inside or outside a transaction whenever a component's stock is
 * written (order decrement, CSV update, admin stock edit, etc.).
 */
export async function syncPrebuiltStock(db: AnyDB, componentIds: string[]): Promise<void> {
  if (componentIds.length === 0) return;

  // Find all PREBUILT parents that reference any of these components (required only)
  const bomLinks = await db.bomItem.findMany({
    where: { componentId: { in: componentIds }, isOptional: false },
    select: { parentProductId: true },
    distinct: ["parentProductId"],
  });

  if (bomLinks.length === 0) return;

  const parentIds = bomLinks.map((b) => b.parentProductId);

  // For each parent, recalculate min(required component stocks)
  for (const parentId of parentIds) {
    const requiredComponents = await db.bomItem.findMany({
      where: { parentProductId: parentId, isOptional: false },
      select: { component: { select: { stock: true } } },
    });

    const minStock = requiredComponents.reduce(
      (min, b) => Math.min(min, b.component.stock),
      Infinity
    );

    await db.product.update({
      where: { id: parentId },
      data: { stock: minStock === Infinity ? 0 : minStock },
    });
  }
}
