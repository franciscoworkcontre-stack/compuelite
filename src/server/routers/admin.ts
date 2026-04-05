import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { OrderStatus, ProductStatus, PaymentStatus } from "@prisma/client";

export const adminRouter = createTRPCRouter({
  stats: publicProcedure.query(async ({ ctx }) => {
    const [
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalProducts,
      lowStock,
      recentOrders,
    ] = await Promise.all([
      ctx.db.order.count(),
      ctx.db.order.count({ where: { status: OrderStatus.PENDING } }),
      ctx.db.order.aggregate({
        where: { status: { in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } },
        _sum: { total: true },
      }),
      ctx.db.product.count({ where: { status: ProductStatus.ACTIVE } }),
      ctx.db.product.count({ where: { stock: { lte: 3 }, status: ProductStatus.ACTIVE } }),
      ctx.db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: { select: { name: true } } } } },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: Number(totalRevenue._sum.total ?? 0),
      totalProducts,
      lowStock,
      recentOrders,
    };
  }),

  orders: publicProcedure
    .input(
      z.object({
        status: z.nativeEnum(OrderStatus).optional(),
        limit: z.number().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.order.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: input.status ? { status: input.status } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: { select: { name: true, images: { take: 1 } } } },
          },
        },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        nextCursor = items.pop()?.id;
      }

      return { items, nextCursor };
    }),

  updateOrderStatus: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.nativeEnum(OrderStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.update({
        where: { id: input.orderId },
        data: { status: input.status },
      });
    }),

  confirmTransferPayment: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paymentGateway: "transfer",
          status: OrderStatus.CONFIRMED,
        },
      });
    }),

  products: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().default(30),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.product.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: input.search
          ? {
              OR: [
                { name: { contains: input.search, mode: "insensitive" } },
                { sku: { contains: input.search, mode: "insensitive" } },
                { brand: { contains: input.search, mode: "insensitive" } },
              ],
            }
          : undefined,
        orderBy: { updatedAt: "desc" },
        include: { images: { take: 1 }, category: { select: { name: true } } },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        nextCursor = items.pop()?.id;
      }

      return { items, nextCursor };
    }),

  updateStock: publicProcedure
    .input(z.object({ productId: z.string(), stock: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.update({
        where: { id: input.productId },
        data: { stock: input.stock },
      });
    }),

  updateProductStatus: publicProcedure
    .input(z.object({ productId: z.string(), status: z.nativeEnum(ProductStatus) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.update({
        where: { id: input.productId },
        data: { status: input.status },
      });
    }),
});
