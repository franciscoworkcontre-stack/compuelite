import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
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

  create: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(100).optional(),
        body: z.string().min(10).max(1000),
        authorName: z.string().min(2),
        authorEmail: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check product exists
      const product = await ctx.db.product.findUnique({ where: { id: input.productId } });
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Producto no encontrado" });

      // Guest review — find or create user by email
      let user = await ctx.db.user.findUnique({ where: { email: input.authorEmail } });
      if (!user) {
        user = await ctx.db.user.create({
          data: { email: input.authorEmail, name: input.authorName },
        });
      }

      const review = await ctx.db.review.create({
        data: {
          productId: input.productId,
          userId: user.id,
          rating: input.rating,
          title: input.title,
          body: input.body,
        },
      });

      return review;
    }),
});
