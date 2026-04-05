import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { ReturnReason, ReturnStatus, OrderStatus, PaymentStatus } from "@prisma/client";

export const returnsRouter = createTRPCRouter({
  // Customer: request a return
  request: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: z.nativeEnum(ReturnReason),
        description: z.string().optional(),
        items: z.array(
          z.object({ orderItemId: z.string(), quantity: z.number().int().min(1), reason: z.string().nullish() })
        ).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        select: { userId: true, status: true },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.userId !== ctx.session.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (order.status !== OrderStatus.DELIVERED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Solo se pueden devolver pedidos entregados" });
      }

      return ctx.db.returnOrder.create({
        data: {
          orderId: input.orderId,
          requestedById: ctx.session.user.id,
          reason: input.reason,
          description: input.description,
          items: {
            create: input.items.map((i) => ({
              orderItemId: i.orderItemId,
              quantity: i.quantity,
              reason: i.reason ?? null,
            })),
          },
        },
        include: { items: true },
      });
    }),

  // Customer: list own returns
  myReturns: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.returnOrder.findMany({
      where: { requestedById: ctx.session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Admin: list all returns
  adminList: adminProcedure
    .input(z.object({ status: z.nativeEnum(ReturnStatus).optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.returnOrder.findMany({
        where: input.status ? { status: input.status } : undefined,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Admin: approve
  approve: adminProcedure
    .input(z.object({ returnId: z.string(), refundAmount: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.returnOrder.update({
        where: { id: input.returnId },
        data: { status: ReturnStatus.APPROVED, refundAmount: input.refundAmount },
      });
    }),

  // Admin: reject
  reject: adminProcedure
    .input(z.object({ returnId: z.string(), adminNotes: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.returnOrder.update({
        where: { id: input.returnId },
        data: { status: ReturnStatus.REJECTED, adminNotes: input.adminNotes },
      });
    }),

  // Admin: issue refund (marks as refunded, gateway integration pending)
  issueRefund: adminProcedure
    .input(z.object({ returnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const returnOrder = await ctx.db.returnOrder.findUnique({
        where: { id: input.returnId },
        include: { order: { select: { id: true, paymentGateway: true } } },
      });
      if (!returnOrder) throw new TRPCError({ code: "NOT_FOUND" });
      if (returnOrder.status !== ReturnStatus.APPROVED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "La devolución debe estar aprobada primero" });
      }

      // Update return status
      const updated = await ctx.db.returnOrder.update({
        where: { id: input.returnId },
        data: { status: ReturnStatus.REFUND_ISSUED },
      });

      // Update order payment status
      await ctx.db.order.update({
        where: { id: returnOrder.orderId },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
          status: OrderStatus.REFUNDED,
        },
      });

      return updated;
    }),
});
