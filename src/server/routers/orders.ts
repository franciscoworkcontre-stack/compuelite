import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { getShippingOptions, type Carrier } from "@/lib/shipping";
import { CouponType } from "@prisma/client";
import { sendOrderConfirmation, sendLowStockAlert } from "@/lib/email";
import { evaluatePromotions } from "./promotions";

export const ordersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
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
            quantity: z.number().int().min(1).max(99),
          })
        ).min(1),
        shippingCarrier: z.enum(["STARKEN", "CHILEXPRESS", "BLUE_EXPRESS", "PICKUP"]),
        couponCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Fetch canonical prices and stock from DB — never trust client-provided prices
      const products = await ctx.db.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } },
        select: { id: true, name: true, price: true, stock: true, status: true },
      });

      for (const item of input.items) {
        const p = products.find((p) => p.id === item.productId);
        if (!p) throw new TRPCError({ code: "BAD_REQUEST", message: `Producto no encontrado` });
        if (p.status !== "ACTIVE") throw new TRPCError({ code: "BAD_REQUEST", message: `${p.name} ya no está disponible` });
        if (p.stock < item.quantity) throw new TRPCError({ code: "BAD_REQUEST", message: `Stock insuficiente para ${p.name} (disponible: ${p.stock})` });
      }

      const enrichedItems = input.items.map((item) => {
        const p = products.find((p) => p.id === item.productId)!;
        return { ...item, unitPrice: Number(p.price), totalPrice: Number(p.price) * item.quantity };
      });

      const subtotal = enrichedItems.reduce((sum, i) => sum + i.totalPrice, 0);

      // Validate shipping cost server-side — never trust the client
      const shippingOptions = getShippingOptions(input.shippingAddress.region);
      const shippingOption = shippingOptions.find(
        (o) => o.carrier === (input.shippingCarrier as Carrier)
      );
      if (!shippingOption) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Opción de envío inválida para esta región" });
      }
      const shippingCost = shippingOption.price;

      // Evaluate automatic promotions (before coupon — stacks if stackable)
      const promoLines = enrichedItems.map((item) => {
        const p = products.find((p) => p.id === item.productId)!;
        return { productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, categoryId: null as string | null, brand: p.name };
      });
      // We need category/brand — re-fetch with those fields
      const productsWithMeta = await ctx.db.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } },
        select: { id: true, brand: true, categoryId: true },
      });
      const promoLinesWithMeta = enrichedItems.map((item) => {
        const meta = productsWithMeta.find((p) => p.id === item.productId)!;
        return { productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, categoryId: meta?.categoryId ?? null, brand: meta?.brand ?? "" };
      });
      const promoResult = await evaluatePromotions(ctx.db, promoLinesWithMeta, subtotal);
      const promotionDiscount = promoResult.totalDiscount;

      // Validate coupon if provided
      let couponDiscount = 0;
      let appliedCoupon: { id: string; code: string } | null = null;
      if (input.couponCode) {
        const coupon = await ctx.db.coupon.findUnique({
          where: { code: input.couponCode.toUpperCase() },
        });
        if (!coupon || !coupon.active) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cupón inválido" });
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cupón expirado" });
        }
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cupón sin usos disponibles" });
        }
        if (coupon.minOrder !== null && subtotal < Number(coupon.minOrder)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Monto mínimo no alcanzado para este cupón" });
        }
        couponDiscount = coupon.type === CouponType.PERCENT
          ? Math.round((subtotal * Number(coupon.value)) / 100)
          : Math.min(Number(coupon.value), subtotal);
        appliedCoupon = { id: coupon.id, code: coupon.code };
      }

      // Atomic: create order + decrement stock in a single transaction
      const order = await ctx.db.$transaction(async (tx) => {
        // Re-check stock inside transaction to prevent race conditions
        for (const item of enrichedItems) {
          const current = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true, name: true },
          });
          if (!current || current.stock < item.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Stock insuficiente para ${current?.name ?? item.productId}`,
            });
          }
        }

        // IVA 19% applies to net product value after all discounts
        const totalDiscount = couponDiscount + promotionDiscount;
        const taxBase = subtotal - totalDiscount;
        const taxAmount = Math.round(taxBase * 0.19);
        const orderTotal = subtotal + shippingCost - totalDiscount + taxAmount;

        const newOrder = await tx.order.create({
          data: {
            orderNumber: `CE-${Date.now()}`,
            status: OrderStatus.PENDING,
            userId,
            guestEmail: ctx.session.user.email ?? undefined,
            guestPhone: input.guestPhone,
            shippingAddress: {
              name: ctx.session.user.name ?? "",
              ...input.shippingAddress,
            },
            subtotal,
            shippingCost,
            discount: couponDiscount + promotionDiscount,
            promotionDiscount: promotionDiscount > 0 ? promotionDiscount : undefined,
            tax: taxAmount,
            total: orderTotal,
            shippingMethod: `${shippingOption.label} · ${shippingOption.days}`,
            ...(appliedCoupon && {
              couponCode: appliedCoupon.code,
              couponDiscount,
            }),
            paymentMethod: PaymentMethod.TRANSFER,
            notes: input.notes,
            items: {
              create: enrichedItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              })),
            },
          },
          include: { items: true },
        });

        // Decrement stock atomically
        await Promise.all(
          enrichedItems.map((item) =>
            tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          )
        );

        // Increment coupon usage count
        if (appliedCoupon) {
          await tx.coupon.update({
            where: { id: appliedCoupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }

        // Record applied promotions + increment usedCount
        if (promoResult.appliedRules.length > 0) {
          await tx.appliedPromotion.createMany({
            data: promoResult.appliedRules.map((r) => ({
              orderId: newOrder.id,
              promotionRuleId: r.id,
              discountAmount: r.discountAmount,
            })),
          });
          for (const r of promoResult.appliedRules) {
            await tx.promotionRule.update({
              where: { id: r.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }

        return newOrder;
      });

      // Post-transaction: check for low stock and fire alerts
      const updatedProducts = await ctx.db.product.findMany({
        where: { id: { in: enrichedItems.map((i) => i.productId) } },
        select: { name: true, sku: true, stock: true, lowStockThreshold: true },
      });
      for (const p of updatedProducts) {
        if (p.stock <= (p.lowStockThreshold ?? 5)) {
          sendLowStockAlert({
            productName: p.name,
            sku: p.sku,
            currentStock: p.stock,
            threshold: p.lowStockThreshold ?? 5,
          }).catch(console.error);
        }
      }

      // Calculate final totals for email (mirrors what was saved in transaction)
      const totalDiscount = couponDiscount + promotionDiscount;
      const taxAmount = Math.round((subtotal - totalDiscount) * 0.19);
      const orderTotal = subtotal + shippingCost - totalDiscount + taxAmount;

      // Fire confirmation email — non-blocking, failure doesn't affect the order
      sendOrderConfirmation({
        orderNumber: order.orderNumber,
        orderId: order.id,
        toEmail: ctx.session.user.email!,
        toName: ctx.session.user.name ?? "Cliente",
        items: enrichedItems.map((i) => {
          const p = products.find((p) => p.id === i.productId)!;
          return { name: p.name, quantity: i.quantity, unitPrice: i.unitPrice };
        }),
        subtotal,
        shippingCost,
        discount: totalDiscount,
        tax: taxAmount,
        total: orderTotal,
        shippingMethod: `${shippingOption.label} · ${shippingOption.days}`,
        shippingAddress: {
          name: ctx.session.user.name ?? "",
          line1: input.shippingAddress.line1,
          city: input.shippingAddress.city,
          region: input.shippingAddress.region,
        },
      }).catch((err) => console.error("[email] order confirmation failed:", err));

      return order;
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.id },
        include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
      });

      if (!order) throw new TRPCError({ code: "NOT_FOUND" });

      // Only the order owner can view it
      if (order.userId !== ctx.session.user.id && ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return order;
    }),
});
