import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { PaymentStatus, OrderStatus } from "@prisma/client";

// MercadoPago sends async webhook notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type?: string; data?: { id?: string }; action?: string };

    // Only handle payment notifications
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data.id;

    // Fetch payment details from MP API
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });

    if (!res.ok) return NextResponse.json({ error: "MP API error" }, { status: 400 });

    const payment = await res.json() as { status: string; external_reference: string; id: number };

    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    if (payment.status === "approved") {
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paymentId: String(payment.id),
          paymentGateway: "mercadopago",
          status: OrderStatus.CONFIRMED,
        },
      });
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[MP webhook]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
