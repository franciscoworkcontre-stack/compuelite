import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { ComponentType, ProductStatus } from "@prisma/client";

export const builderRouter = createTRPCRouter({
  createBuild: publicProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        userId: z.string().optional(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.build.create({
        data: {
          sessionId: input.sessionId,
          userId: input.userId,
          name: input.name ?? "Mi PC",
        },
        include: { components: { include: { product: true } } },
      });
    }),

  getBuild: publicProcedure
    .input(z.object({ buildId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.build.findUnique({
        where: { id: input.buildId },
        include: {
          components: {
            include: {
              product: {
                include: { images: { take: 1 } },
              },
            },
          },
        },
      });
    }),

  addComponent: publicProcedure
    .input(
      z.object({
        buildId: z.string(),
        productId: z.string(),
        componentType: z.nativeEnum(ComponentType),
        slotIndex: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert: replace existing component in that slot
      await ctx.db.buildComponent.deleteMany({
        where: {
          buildId: input.buildId,
          componentType: input.componentType,
          slotIndex: input.slotIndex,
        },
      });

      const component = await ctx.db.buildComponent.create({
        data: {
          buildId: input.buildId,
          productId: input.productId,
          componentType: input.componentType,
          slotIndex: input.slotIndex,
        },
        include: { product: { include: { images: { take: 1 } } } },
      });

      // Recalculate total price
      const allComponents = await ctx.db.buildComponent.findMany({
        where: { buildId: input.buildId },
        include: { product: true },
      });

      const totalPrice = allComponents.reduce(
        (sum, c) => sum + Number(c.product.price) * c.quantity,
        0
      );

      await ctx.db.build.update({
        where: { id: input.buildId },
        data: { totalPrice },
      });

      return component;
    }),

  removeComponent: publicProcedure
    .input(
      z.object({
        buildId: z.string(),
        componentType: z.nativeEnum(ComponentType),
        slotIndex: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.buildComponent.deleteMany({
        where: {
          buildId: input.buildId,
          componentType: input.componentType,
          slotIndex: input.slotIndex,
        },
      });

      const allComponents = await ctx.db.buildComponent.findMany({
        where: { buildId: input.buildId },
        include: { product: true },
      });

      const totalPrice = allComponents.reduce(
        (sum, c) => sum + Number(c.product.price) * c.quantity,
        0
      );

      await ctx.db.build.update({
        where: { id: input.buildId },
        data: { totalPrice },
      });

      return { success: true };
    }),

  getCompatibleProducts: publicProcedure
    .input(
      z.object({
        buildId: z.string(),
        componentType: z.nativeEnum(ComponentType),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        brand: z.string().optional(),
        limit: z.number().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.product.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          status: ProductStatus.ACTIVE,
          componentType: input.componentType,
          stock: { gt: 0 },
          ...(input.brand && { brand: input.brand }),
          ...(input.priceMin !== undefined && { price: { gte: input.priceMin } }),
          ...(input.priceMax !== undefined && { price: { lte: input.priceMax } }),
        },
        include: { images: { take: 1 } },
        orderBy: { price: "asc" },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        nextCursor = items.pop()?.id;
      }

      return { items, nextCursor };
    }),

  productsByType: publicProcedure
    .input(
      z.object({
        componentType: z.nativeEnum(ComponentType),
        onlyInStock: z.boolean().default(false),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.product.findMany({
        take: input.limit,
        where: {
          status: ProductStatus.ACTIVE,
          componentType: input.componentType,
          ...(input.onlyInStock && { stock: { gt: 0 } }),
        },
        include: { images: { take: 1 } },
        orderBy: { price: "asc" },
      });
    }),
});
