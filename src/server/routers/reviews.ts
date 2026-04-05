import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const reviewsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.db.review.findMany({
        where: { productId: input.productId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
      });

      const agg = await ctx.db.review.aggregate({
        where: { productId: input.productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return {
        reviews,
        avgRating: agg._avg.rating ?? 0,
        count: agg._count.rating,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(100).optional(),
        body: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({ where: { id: input.productId } });
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Producto no encontrado" });

      // One review per user per product
      const existing = await ctx.db.review.findFirst({
        where: { productId: input.productId, userId: ctx.session.user.id },
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Ya enviaste una reseña para este producto" });

      return ctx.db.review.create({
        data: {
          productId: input.productId,
          userId: ctx.session.user.id,
          rating: input.rating,
          title: input.title,
          body: input.body,
        },
      });
    }),
});
