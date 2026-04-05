import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { OrderStatus, PaymentMethod } from "@prisma/client";

export const ordersRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        guestName: z.string().min(2),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        shippingAddress: z.object({
          line1: z.string().min(3),
          line2: z.string().optional(),
          city: z.string().min(2),
          region: z.string().min(2),
        }),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().min(1),
            unitPrice: z.number(),
          })
        ),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all products exist and have enough stock
      const products = await ctx.db.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } },
        select: { id: true, name: true, price: true, stock: true, sku: true },
      });

      for (const item of input.items) {
        const p = products.find((p) => p.id === item.productId);
        if (!p) throw new Error(`Producto ${item.productId} no encontrado`);
        if (p.stock < item.quantity)
          throw new Error(`Stock insuficiente para ${p.name}`);
      }

      const subtotal = input.items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0
      );

      const order = await ctx.db.order.create({
        data: {
          orderNumber: `CE-${Date.now()}`,
          status: OrderStatus.PENDING,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          shippingAddress: {
            name: input.guestName,
            ...input.shippingAddress,
          },
          subtotal,
          shippingCost: 0,
          tax: 0,
          total: subtotal,
          paymentMethod: PaymentMethod.TRANSFER,
          notes: input.notes,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock
      await Promise.all(
        input.items.map((item) =>
          ctx.db.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      return order;
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.order.findUnique({
        where: { id: input.id },
        include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
      });
    }),
});
