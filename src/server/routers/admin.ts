import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { OrderStatus, ProductStatus, PaymentStatus, ComponentType, ProductType } from "@prisma/client";
import { syncPrebuiltStock } from "@/lib/syncPrebuiltStock";
import { sendLowStockAlert, sendPaymentConfirmed, sendOrderShipped, sendOrderDelivered } from "@/lib/email";
import { Prisma } from "@prisma/client";

export const adminRouter = createTRPCRouter({
  stats: adminProcedure.query(async ({ ctx }) => {
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

  orders: adminProcedure
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

  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.nativeEnum(OrderStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.update({
        where: { id: input.orderId },
        data: { status: input.status },
        include: { items: { include: { product: { select: { slug: true } } }, take: 1 } },
      });
      // Fire email on DELIVERED
      if (input.status === OrderStatus.DELIVERED && order.guestEmail) {
        sendOrderDelivered({
          toEmail: order.guestEmail,
          toName: String((order.shippingAddress as Record<string, string>)?.name ?? "Cliente"),
          orderNumber: order.orderNumber,
          orderId: order.id,
          productSlug: order.items[0]?.product?.slug,
        }).catch(console.error);
      }
      return order;
    }),

  markShipped: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        carrier: z.string(),
        trackingNumber: z.string(),
        trackingUrl: z.string().optional(),
        estimatedDelivery: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          status: OrderStatus.SHIPPED,
          trackingNumber: input.trackingNumber,
          trackingUrl: input.trackingUrl,
        },
      });
      if (order.guestEmail) {
        sendOrderShipped({
          toEmail: order.guestEmail,
          toName: String((order.shippingAddress as Record<string, string>)?.name ?? "Cliente"),
          orderNumber: order.orderNumber,
          orderId: order.id,
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
          trackingUrl: input.trackingUrl,
          estimatedDelivery: input.estimatedDelivery,
        }).catch(console.error);
      }
      return order;
    }),

  confirmTransferPayment: adminProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paymentGateway: "transfer",
          status: OrderStatus.CONFIRMED,
        },
      });
      if (order.guestEmail) {
        sendPaymentConfirmed({
          toEmail: order.guestEmail,
          toName: String((order.shippingAddress as Record<string, string>)?.name ?? "Cliente"),
          orderNumber: order.orderNumber,
          orderId: order.id,
          amount: Number(order.total),
          paymentMethod: "Transferencia bancaria",
        }).catch(console.error);
      }
      return order;
    }),

  products: adminProcedure
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

  updateStock: adminProcedure
    .input(z.object({ productId: z.string(), stock: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.product.update({
        where: { id: input.productId },
        data: { stock: input.stock },
        select: { name: true, sku: true, stock: true, lowStockThreshold: true },
      });
      // If this product is used as a component in any PREBUILT, sync their virtual stock
      await syncPrebuiltStock(ctx.db, [input.productId]);
      if (updated.stock <= (updated.lowStockThreshold ?? 5)) {
        sendLowStockAlert({
          productName: updated.name,
          sku: updated.sku,
          currentStock: updated.stock,
          threshold: updated.lowStockThreshold ?? 5,
        }).catch(console.error);
      }
      return updated;
    }),

  updateProductStatus: adminProcedure
    .input(z.object({ productId: z.string(), status: z.nativeEnum(ProductStatus) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.update({
        where: { id: input.productId },
        data: { status: input.status },
      });
    }),

  analytics: adminProcedure
    .input(z.object({ period: z.enum(["7d", "30d", "90d", "365d"]).default("30d") }))
    .query(async ({ ctx, input }) => {
      const days = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 }[input.period];
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const confirmedStatuses = [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

      const [revenueByDay, topProductsRaw, revenueByCategoryRaw, aovByDay] = await Promise.all([
        // Revenue per day
        ctx.db.$queryRaw<{ date: Date; revenue: number }[]>`
          SELECT DATE_TRUNC('day', "createdAt") AS date, SUM(total)::float AS revenue
          FROM "Order"
          WHERE "createdAt" >= ${since} AND status = ANY(${Prisma.raw(`ARRAY['CONFIRMED','SHIPPED','DELIVERED']`)})
          GROUP BY 1 ORDER BY 1
        `,
        // Top 10 products by revenue
        ctx.db.orderItem.groupBy({
          by: ["productId"],
          _sum: { quantity: true, totalPrice: true },
          orderBy: { _sum: { totalPrice: "desc" } },
          take: 10,
          where: {
            order: { createdAt: { gte: since }, status: { in: confirmedStatuses } },
          },
        }),
        // Revenue by category
        ctx.db.$queryRaw<{ categoryName: string; revenue: number }[]>`
          SELECT COALESCE(c.name, 'Sin categoría') AS "categoryName", SUM(oi."totalPrice")::float AS revenue
          FROM "OrderItem" oi
          JOIN "Order" o ON oi."orderId" = o.id
          JOIN "Product" p ON oi."productId" = p.id
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          WHERE o."createdAt" >= ${since} AND o.status = ANY(${Prisma.raw(`ARRAY['CONFIRMED','SHIPPED','DELIVERED']`)})
          GROUP BY c.name ORDER BY revenue DESC LIMIT 8
        `,
        // AOV per day
        ctx.db.$queryRaw<{ date: Date; aov: number }[]>`
          SELECT DATE_TRUNC('day', "createdAt") AS date, AVG(total)::float AS aov
          FROM "Order"
          WHERE "createdAt" >= ${since} AND status = ANY(${Prisma.raw(`ARRAY['CONFIRMED','SHIPPED','DELIVERED']`)})
          GROUP BY 1 ORDER BY 1
        `,
      ]);

      // Enrich top products with names
      const productIds = topProductsRaw.map((r) => r.productId);
      const productNames = await ctx.db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      });

      const topProducts = topProductsRaw.map((r) => {
        const p = productNames.find((p) => p.id === r.productId);
        return {
          productId: r.productId,
          name: p?.name ?? r.productId,
          sku: p?.sku ?? "",
          totalSold: r._sum.quantity ?? 0,
          totalRevenue: Number(r._sum.totalPrice ?? 0),
        };
      });

      return {
        revenueByDay: revenueByDay.map((r) => ({ date: r.date.toISOString().slice(0, 10), revenue: r.revenue ?? 0 })),
        topProducts,
        revenueByCategory: revenueByCategoryRaw,
        aovByDay: aovByDay.map((r) => ({ date: r.date.toISOString().slice(0, 10), aov: r.aov ?? 0 })),
      };
    }),

  // Fix admin.stats to respect lowStockThreshold per product
  lowStockProducts: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.$queryRaw<{ id: string; name: string; sku: string; stock: number; threshold: number }[]>`
      SELECT id, name, sku, stock, "lowStockThreshold" AS threshold
      FROM "Product"
      WHERE stock <= "lowStockThreshold" AND status = 'ACTIVE'
      ORDER BY stock ASC
      LIMIT 20
    `;
  }),

  // Stock control — paginated list with filters + inline adjustment
  stockControl: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      filter: z.enum(["all", "low", "out", "ok"]).default("all"),
      productType: z.enum(["all", "STANDALONE", "COMPONENT", "PREBUILT", "PERIPHERAL", "ACCESSORY"]).default("all"),
      limit: z.number().default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        status: { not: "ARCHIVED" },
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" } },
            { sku: { contains: input.search, mode: "insensitive" } },
            { brand: { contains: input.search, mode: "insensitive" } },
          ],
        }),
        ...(input.productType !== "all" && { productType: input.productType }),
        ...(input.filter === "out" && { stock: 0 }),
        ...(input.filter === "low" && { stock: { gt: 0 } }), // refined below
        ...(input.filter === "ok" && { stock: { gt: 0 } }),
      };

      const items = await ctx.db.product.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where,
        orderBy: [{ stock: "asc" }, { name: "asc" }],
        select: {
          id: true, name: true, sku: true, brand: true, stock: true,
          lowStockThreshold: true, productType: true, status: true,
          category: { select: { name: true } },
          images: { take: 1, select: { url: true } },
        },
      });

      // Apply low/ok filtering in memory (needs per-product threshold)
      const filtered = input.filter === "low"
        ? items.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold)
        : input.filter === "ok"
        ? items.filter(p => p.stock > p.lowStockThreshold)
        : items;

      let nextCursor: string | undefined;
      const result = filtered.slice(0, input.limit);
      if (filtered.length > input.limit) nextCursor = filtered[input.limit]?.id;

      // Summary counts (no pagination, fast)
      const [total, outCount, lowCount] = await Promise.all([
        ctx.db.product.count({ where: { status: { not: "ARCHIVED" } } }),
        ctx.db.product.count({ where: { status: { not: "ARCHIVED" }, stock: 0 } }),
        ctx.db.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*)::bigint FROM "Product"
          WHERE status != 'ARCHIVED' AND stock > 0 AND stock <= "lowStockThreshold"
        `,
      ]);

      return {
        items: result,
        nextCursor,
        summary: {
          total,
          out: outCount,
          low: Number(lowCount[0]?.count ?? 0),
          ok: total - outCount - Number(lowCount[0]?.count ?? 0),
        },
      };
    }),

  // Stock movement history for a product
  stockHistory: adminProcedure
    .input(z.object({ productId: z.string(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.stockMovement.findMany({
        where: { productId: input.productId },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        select: {
          id: true, type: true, quantity: true,
          previousStock: true, newStock: true,
          reference: true, createdAt: true,
        },
      });
    }),

  // Search products by componentType for PC Builder
  searchComponents: adminProcedure
    .input(z.object({
      componentType: z.nativeEnum(ComponentType),
      query: z.string().default(""),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.product.findMany({
        where: {
          componentType: input.componentType,
          status: ProductStatus.ACTIVE,
          ...(input.query.trim() && {
            OR: [
              { name: { contains: input.query, mode: "insensitive" } },
              { brand: { contains: input.query, mode: "insensitive" } },
              { sku: { contains: input.query, mode: "insensitive" } },
            ],
          }),
        },
        select: { id: true, name: true, brand: true, sku: true, price: true, stock: true,
          images: { take: 1, select: { url: true } } },
        orderBy: { name: "asc" },
        take: 10,
      });
    }),

  // Create a PREBUILT product with PC formula components
  createPrebuilt: adminProcedure
    .input(z.object({
      sku: z.string().min(1),
      name: z.string().min(1),
      brand: z.string().min(1),
      price: z.number().positive(),
      compareAtPrice: z.number().optional(),
      stock: z.number().int().min(0).default(1),
      categoryId: z.string().min(1),
      description: z.string().default(""),
      imageUrl: z.string().default(""),
      components: z.array(z.object({
        productId: z.string(),
        componentType: z.nativeEnum(ComponentType),
        slotIndex: z.number().int().min(0).default(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { components, price, compareAtPrice, ...rest } = input;

      // Create the product
      const product = await ctx.db.product.create({
        data: {
          ...rest,
          price,
          compareAtPrice: compareAtPrice ?? null,
          productType: ProductType.PREBUILT,
          status: ProductStatus.ACTIVE,
          slug: rest.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
      });

      // Create BomItems (formula) for each component
      if (components.length > 0) {
        await ctx.db.bomItem.createMany({
          data: components.map((c, i) => ({
            parentProductId: product.id,
            componentId: c.productId,
            slotName: `${c.componentType}_${c.slotIndex}`,
            isOptional: c.slotIndex > 0, // ventilacion 2, etc. = optional
            sortOrder: i,
          })),
          skipDuplicates: true,
        });

        // Set the PREBUILT's own stock = min(required component stocks)
        await syncPrebuiltStock(ctx.db, components.map(c => c.productId));
      }

      return product;
    }),
});
