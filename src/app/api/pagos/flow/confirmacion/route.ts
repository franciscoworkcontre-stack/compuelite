import { NextRequest, NextResponse } from "next/server";
import { getFlowPaymentStatus } from "@/lib/payments/flow";
import { db } from "@/server/db/client";
import { PaymentStatus, OrderStatus } from "@prisma/client";

// Flow calls this URL with POST to confirm a payment asynchronously
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const token = body.get("token") as string;

    if (!token) return new Response("Missing token", { status: 400 });

    const payment = await getFlowPaymentStatus(token);
    const orderId = payment.commerceOrder;

    if (payment.status === 2) {
      // Idempotency: skip if already confirmed
      const existing = await db.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });
      if (existing?.status !== OrderStatus.CONFIRMED) {
        await db.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            paymentId: String(payment.flowOrder),
            paymentGateway: "flow",
            status: OrderStatus.CONFIRMED,
            paymentMeta: JSON.parse(JSON.stringify({
              flowOrder: payment.flowOrder,
              payer: payment.payer,
              paymentData: payment.paymentData,
            })),
          },
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[Flow confirmacion]", err);
    return new Response("ERROR", { status: 500 });
  }
}
