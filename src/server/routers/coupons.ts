import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { CouponType } from "@prisma/client";

export const couponsRouter = createTRPCRouter({
  // Validate a coupon code against a subtotal — public so checkout can call it
  validate: publicProcedure
    .input(z.object({
      code: z.string().min(1).max(50),
      subtotal: z.number().min(0),
    }))
    .query(async ({ ctx, input }) => {
      const coupon = await ctx.db.coupon.findUnique({
        where: { code: input.code.toUpperCase() },
      });

      if (!coupon || !coupon.active) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cupón inválido o inactivo" });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este cupón ha expirado" });
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este cupón ya alcanzó su límite de usos" });
      }
      if (coupon.minOrder !== null && input.subtotal < Number(coupon.minOrder)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Monto mínimo para este cupón: ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(coupon.minOrder))}`,
        });
      }

      const discount = coupon.type === CouponType.PERCENT
        ? Math.round((input.subtotal * Number(coupon.value)) / 100)
        : Math.min(Number(coupon.value), input.subtotal);

      return {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        discount,
      };
    }),

  // Admin: list all coupons
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  }),

  // Admin: create a coupon
  create: adminProcedure
    .input(z.object({
      code: z.string().min(3).max(30).regex(/^[A-Z0-9_-]+$/, "Solo mayúsculas, números, guion y guión bajo"),
      type: z.nativeEnum(CouponType),
      value: z.number().min(1),
      minOrder: z.number().optional(),
      maxUses: z.number().int().optional(),
      expiresAt: z.string().datetime().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.coupon.findUnique({ where: { code: input.code } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Ya existe un cupón con ese código" });

      return ctx.db.coupon.create({
        data: {
          code: input.code,
          type: input.type,
          value: input.value,
          minOrder: input.minOrder,
          maxUses: input.maxUses,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        },
      });
    }),

  // Admin: toggle active/inactive
  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const coupon = await ctx.db.coupon.findUnique({ where: { id: input.id } });
      if (!coupon) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.coupon.update({
        where: { id: input.id },
        data: { active: !coupon.active },
      });
    }),
});
