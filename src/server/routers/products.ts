import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { ComponentType, ProductStatus } from "@prisma/client";

export const productsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        brand: z.string().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        inStock: z.boolean().optional(),
        featured: z.boolean().optional(),
        componentType: z.nativeEnum(ComponentType).optional(),
        search: z.string().optional(),
        sort: z.enum(["price_asc", "price_desc", "newest", "featured"]).default("newest"),
        limit: z.number().min(1).max(100).default(24),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const orderBy =
        input.sort === "price_asc"
          ? { price: "asc" as const }
          : input.sort === "price_desc"
          ? { price: "desc" as const }
          : input.sort === "featured"
          ? { featured: "desc" as const }
          : { createdAt: "desc" as const };

      const items = await ctx.db.product.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          status: ProductStatus.ACTIVE,
          ...(input.categorySlug && { category: { slug: input.categorySlug } }),
          ...(input.brand && { brand: { contains: input.brand, mode: "insensitive" } }),
          ...(input.inStock && { stock: { gt: 0 } }),
          ...(input.featured !== undefined && { featured: input.featured }),
          ...(input.componentType && { componentType: input.componentType }),
          ...(input.priceMin !== undefined && { price: { gte: input.priceMin } }),
          ...(input.priceMax !== undefined && { price: { lte: input.priceMax } }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { brand: { contains: input.search, mode: "insensitive" } },
              { sku: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          category: { select: { name: true, slug: true } },
        },
        orderBy,
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }

      return { items, nextCursor };
    }),

  count: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        brand: z.string().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        inStock: z.boolean().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.product.count({
        where: {
          status: ProductStatus.ACTIVE,
          ...(input.categorySlug && { category: { slug: input.categorySlug } }),
          ...(input.brand && { brand: { contains: input.brand, mode: "insensitive" } }),
          ...(input.inStock && { stock: { gt: 0 } }),
          ...(input.priceMin !== undefined && { price: { gte: input.priceMin } }),
          ...(input.priceMax !== undefined && { price: { lte: input.priceMax } }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { brand: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        },
      });
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
      if (!product) return null;
      return product;
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    const cats = await ctx.db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { status: ProductStatus.ACTIVE } } } },
      },
    });
    return cats;
  }),

  brands: publicProcedure
    .input(z.object({ categorySlug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const brands = await ctx.db.product.groupBy({
        by: ["brand"],
        where: {
          status: ProductStatus.ACTIVE,
          ...(input.categorySlug && { category: { slug: input.categorySlug } }),
        },
        _count: { brand: true },
        orderBy: { _count: { brand: "desc" } },
      });
      return brands.map((b) => ({ brand: b.brand, count: b._count.brand }));
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

  priceRange: publicProcedure
    .input(z.object({ categorySlug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const agg = await ctx.db.product.aggregate({
        where: {
          status: ProductStatus.ACTIVE,
          ...(input.categorySlug && { category: { slug: input.categorySlug } }),
        },
        _min: { price: true },
        _max: { price: true },
      });
      return {
        min: Number(agg._min.price ?? 0),
        max: Number(agg._max.price ?? 10000000),
      };
    }),
});
