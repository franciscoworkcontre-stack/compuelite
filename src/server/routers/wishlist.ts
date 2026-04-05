import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const wishlistRouter = createTRPCRouter({
  toggle: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await ctx.db.wishlistItem.findUnique({
        where: { userId_productId: { userId, productId: input.productId } },
      });
      if (existing) {
        await ctx.db.wishlistItem.delete({ where: { id: existing.id } });
        return { inWishlist: false };
      } else {
        await ctx.db.wishlistItem.create({ data: { userId, productId: input.productId } });
        return { inWishlist: true };
      }
    }),

  isInList: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.wishlistItem.findUnique({
        where: { userId_productId: { userId: ctx.session.user.id, productId: input.productId } },
      });
      return { inWishlist: !!item };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.wishlistItem.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: "asc" } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });
  }),

  remove: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.wishlistItem.deleteMany({
        where: { userId: ctx.session.user.id, productId: input.productId },
      });
      return { removed: true };
    }),
});
