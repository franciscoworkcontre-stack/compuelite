import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { PromotionType, PromotionConditionType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

// ─── Engine ─────────────────────────────────────────────────────────────────

interface CartLineForPromo {
  productId: string;
  quantity: number;
  unitPrice: number;
  categoryId: string | null;
  brand: string;
}

export interface PromoResult {
  totalDiscount: number;
  freeShipping: boolean;
  appliedRules: { id: string; name: string; discountAmount: number }[];
}

export async function evaluatePromotions(
  db: PrismaClient,
  lines: CartLineForPromo[],
  subtotal: number
): Promise<PromoResult> {
  const now = new Date();
  const rules = await db.promotionRule.findMany({
    where: {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { priority: "desc" },
  });

  let totalDiscount = 0;
  let freeShipping = false;
  const appliedRules: PromoResult["appliedRules"] = [];
  let stopStacking = false;

  for (const rule of rules) {
    if (stopStacking) break;
    if (rule.maxUses !== null && rule.usedCount >= rule.maxUses) continue;

    // Check condition
    let conditionMet = false;
    const condVal = rule.conditionValue ?? "";

    switch (rule.conditionType) {
      case PromotionConditionType.CART_TOTAL:
        conditionMet = subtotal >= Number(condVal);
        break;
      case PromotionConditionType.CATEGORY:
        conditionMet = lines.some((l) => l.categoryId === condVal);
        break;
      case PromotionConditionType.BRAND:
        conditionMet = lines.some((l) => l.brand.toLowerCase() === condVal.toLowerCase());
        break;
      case PromotionConditionType.PRODUCT:
        conditionMet = lines.some((l) => l.productId === condVal);
        break;
      case PromotionConditionType.QUANTITY:
        conditionMet = lines.some((l) => l.quantity >= (rule.minQty ?? 1));
        break;
    }

    if (!conditionMet) continue;

    // Calculate discount
    let discountAmount = 0;
    switch (rule.type) {
      case PromotionType.PERCENTAGE:
        discountAmount = Math.round(subtotal * (Number(rule.value) / 100));
        break;
      case PromotionType.FIXED_AMOUNT:
        discountAmount = Math.min(Number(rule.value), subtotal);
        break;
      case PromotionType.FREE_SHIPPING:
        freeShipping = true;
        break;
      case PromotionType.BOGO: {
        // Find cheapest unit of matching product and give it free
        const matchLine = rule.conditionType === PromotionConditionType.PRODUCT
          ? lines.find((l) => l.productId === condVal)
          : lines.reduce((min, l) => (!min || l.unitPrice < min.unitPrice ? l : min), null as CartLineForPromo | null);
        if (matchLine) discountAmount = matchLine.unitPrice;
        break;
      }
    }

    if (discountAmount > 0 || rule.type === PromotionType.FREE_SHIPPING) {
      appliedRules.push({ id: rule.id, name: rule.name, discountAmount });
      totalDiscount += discountAmount;
      if (!rule.stackable) stopStacking = true;
    }
  }

  return { totalDiscount, freeShipping, appliedRules };
}

// ─── Router ──────────────────────────────────────────────────────────────────

const ruleInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(PromotionType),
  value: z.number().min(0),
  conditionType: z.nativeEnum(PromotionConditionType),
  conditionValue: z.string().optional(),
  minQty: z.number().int().min(1).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  stackable: z.boolean().default(false),
  priority: z.number().int().default(0),
  maxUses: z.number().int().min(1).optional(),
});

export const promotionsRouter = createTRPCRouter({
  // Public: preview promotions for current cart (used in checkout)
  preview: publicProcedure
    .input(
      z.object({
        items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })),
        subtotal: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.items.length === 0) return { totalDiscount: 0, freeShipping: false, appliedRules: [] };

      const products = await ctx.db.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } },
        select: { id: true, brand: true, price: true, categoryId: true },
      });

      const lines: CartLineForPromo[] = input.items.map((item) => {
        const p = products.find((p) => p.id === item.productId)!;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(p?.price ?? 0),
          categoryId: p?.categoryId ?? null,
          brand: p?.brand ?? "",
        };
      });

      return evaluatePromotions(ctx.db, lines, input.subtotal);
    }),

  // Admin CRUD
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.promotionRule.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });
  }),

  create: adminProcedure.input(ruleInput).mutation(async ({ ctx, input }) => {
    return ctx.db.promotionRule.create({
      data: {
        ...input,
        value: input.value,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
      },
    });
  }),

  update: adminProcedure
    .input(ruleInput.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.promotionRule.update({
        where: { id },
        data: {
          ...data,
          startsAt: data.startsAt ? new Date(data.startsAt) : null,
          endsAt: data.endsAt ? new Date(data.endsAt) : null,
        },
      });
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const rule = await ctx.db.promotionRule.findUnique({ where: { id: input.id } });
      if (!rule) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.promotionRule.update({
        where: { id: input.id },
        data: { isActive: !rule.isActive },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.promotionRule.delete({ where: { id: input.id } });
    }),
});
