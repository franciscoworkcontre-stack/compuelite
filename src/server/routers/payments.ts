import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";
import { createWebpayTransaction } from "@/lib/payments/webpay";
import { createMercadoPagoPreference } from "@/lib/payments/mercadopago";
import { createFlowPayment } from "@/lib/payments/flow";

export const paymentsRouter = createTRPCRouter({
  initiate: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        method: z.nativeEnum(PaymentMethod),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: { items: { include: { product: { select: { name: true } } } } },
      });

      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido no encontrado" });
      if (order.paymentStatus === PaymentStatus.COMPLETED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este pedido ya fue pagado" });
      }

      const amount = Number(order.total);

      // Update payment method on order
      await ctx.db.order.update({
        where: { id: input.orderId },
        data: { paymentMethod: input.method },
      });

      if (input.method === PaymentMethod.WEBPAY) {
        const tx = await createWebpayTransaction(order.id, amount);
        return {
          method: "WEBPAY" as const,
          redirectUrl: `${tx.url}?token_ws=${tx.token}`,
          token: tx.token,
        };
      }

      if (input.method === PaymentMethod.MERCADOPAGO) {
        const isSandbox = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith("TEST-");
        const pref = await createMercadoPagoPreference(
          order.id,
          order.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            unit_price: Number(i.unitPrice),
          })),
          order.guestEmail ?? "cliente@compuelite.cl"
        );
        return {
          method: "MERCADOPAGO" as const,
          redirectUrl: isSandbox ? pref.sandbox_init_point : pref.init_point,
          preferenceId: pref.id,
        };
      }

      if (input.method === PaymentMethod.FLOW) {
        const payment = await createFlowPayment(
          order.id,
          amount,
          order.guestEmail ?? "cliente@compuelite.cl",
          `Pedido ${order.orderNumber} — Compuelite`
        );
        return {
          method: "FLOW" as const,
          redirectUrl: `${payment.url}?token=${payment.token}`,
          token: payment.token,
        };
      }

      // TRANSFER or CASH_ON_DELIVERY — no redirect needed
      return {
        method: input.method,
        redirectUrl: null,
      };
    }),

  confirmTransfer: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Mark as awaiting transfer confirmation (admin will confirm later)
      return ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          paymentMethod: PaymentMethod.TRANSFER,
          paymentStatus: PaymentStatus.PENDING,
          status: OrderStatus.PENDING,
        },
        select: { id: true, orderNumber: true, status: true },
      });
    }),

  orderPaymentStatus: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          paymentId: true,
          paymentGateway: true,
          total: true,
          guestEmail: true,
        },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      return order;
    }),
});
