import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

type AnyDB = PrismaClient | Prisma.TransactionClient;

/**
 * Recalculate the `stock` field for every PREBUILT product that uses any of
 * the given componentIds as a primary or substitute component.
 *
 * A slot is fillable if the primary component OR any substitute has stock.
 * The slot's available quantity = max(primary.stock, max(substitute.stocks)).
 * PREBUILT effective stock = min across all required slots.
 */
export async function syncPrebuiltStock(db: AnyDB, componentIds: string[]): Promise<void> {
  if (componentIds.length === 0) return;

  // Find parents via primary BomItem
  const primaryLinks = await db.bomItem.findMany({
    where: { componentId: { in: componentIds }, isOptional: false },
    select: { parentProductId: true },
    distinct: ["parentProductId"],
  });

  // Find parents via substitute
  const subLinks = await db.bomSubstitute.findMany({
    where: { productId: { in: componentIds } },
    select: { bomItem: { select: { parentProductId: true, isOptional: true } } },
  });
  const subParents = subLinks
    .filter(s => !s.bomItem.isOptional)
    .map(s => s.bomItem.parentProductId);

  const parentIds = [...new Set([
    ...primaryLinks.map(b => b.parentProductId),
    ...subParents,
  ])];

  if (parentIds.length === 0) return;

  for (const parentId of parentIds) {
    const requiredSlots = await db.bomItem.findMany({
      where: { parentProductId: parentId, isOptional: false },
      select: {
        id: true,
        component: { select: { stock: true } },
        substitutes: {
          orderBy: { priority: "asc" },
          select: { product: { select: { stock: true } } },
        },
      },
    });

    if (requiredSlots.length === 0) {
      await db.product.update({ where: { id: parentId }, data: { stock: 0 } });
      continue;
    }

    // Each slot's capacity = primary stock + substitute stocks (any one can fill it)
    const slotCapacities = requiredSlots.map(slot => {
      const primaryStock = slot.component.stock;
      const substituteMax = slot.substitutes.reduce(
        (max, s) => Math.max(max, s.product.stock), 0
      );
      return Math.max(primaryStock, substituteMax);
    });

    const minStock = Math.min(...slotCapacities);
    await db.product.update({
      where: { id: parentId },
      data: { stock: minStock },
    });
  }
}

/**
 * For a given PREBUILT product, resolve the exact components to use for one build.
 * For each required slot: use primary if in stock, else first substitute with stock.
 * Returns the resolved list or throws if any slot can't be filled.
 */
export type ResolvedComponent = {
  bomItemId: string;
  slotName: string | null;
  componentId: string;
  componentName: string;
  sku: string;
  isSubstitute: boolean;
  substituteNote: string | null;
};

export async function resolveBom(
  db: AnyDB,
  parentProductId: string,
  quantity: number = 1,
): Promise<ResolvedComponent[]> {
  const slots = await db.bomItem.findMany({
    where: { parentProductId, isOptional: false },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slotName: true,
      component: { select: { id: true, name: true, sku: true, stock: true } },
      substitutes: {
        orderBy: { priority: "asc" },
        select: {
          notes: true,
          product: { select: { id: true, name: true, sku: true, stock: true } },
        },
      },
    },
  });

  const resolved: ResolvedComponent[] = [];

  for (const slot of slots) {
    if (slot.component.stock >= quantity) {
      resolved.push({
        bomItemId: slot.id,
        slotName: slot.slotName,
        componentId: slot.component.id,
        componentName: slot.component.name,
        sku: slot.component.sku,
        isSubstitute: false,
        substituteNote: null,
      });
      continue;
    }

    // Primary out of stock — try substitutes in priority order
    const sub = slot.substitutes.find(s => s.product.stock >= quantity);
    if (sub) {
      resolved.push({
        bomItemId: slot.id,
        slotName: slot.slotName,
        componentId: sub.product.id,
        componentName: sub.product.name,
        sku: sub.product.sku,
        isSubstitute: true,
        substituteNote: sub.notes,
      });
      continue;
    }

    // Neither primary nor any substitute has enough stock
    throw new Error(
      `Sin stock para slot "${slot.slotName ?? slot.id}": ` +
      `${slot.component.name} (${slot.component.stock} uds) y sus sustitutos no tienen suficiente stock`
    );
  }

  return resolved;
}
