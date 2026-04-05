import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { ProductStatus } from "@prisma/client";

export const productsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        componentType: z.string().optional(),
        featured: z.boolean().optional(),
        inStock: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.product.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          status: ProductStatus.ACTIVE,
          ...(input.categorySlug && {
            category: { slug: input.categorySlug },
          }),
          ...(input.componentType && {
            componentType: input.componentType as never,
          }),
          ...(input.featured !== undefined && { featured: input.featured }),
          ...(input.inStock && { stock: { gt: 0 } }),
        },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          category: true,
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { slug: input.slug },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: true,
          reviews: {
            include: { user: { select: { name: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!product) throw new Error("Product not found");
      return product;
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { sortOrder: "asc" },
    });
  }),

  featured: publicProcedure
    .input(z.object({ limit: z.number().default(8) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.product.findMany({
        where: { status: ProductStatus.ACTIVE, featured: true, stock: { gt: 0 } },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
        take: input.limit,
      });
    }),
});
