import { NextRequest, NextResponse } from "next/server";
import { getFlowPaymentStatus } from "@/lib/payments/flow";
import { db } from "@/server/db/client";
import { PaymentStatus, OrderStatus } from "@prisma/client";

// Flow redirects with GET token param
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/pago/error?razon=token_faltante", origin));
  }

  try {
    const payment = await getFlowPaymentStatus(token);
    const orderId = payment.commerceOrder;

    // status: 2 = paid, 3 = rejected, 4 = cancelled
    if (payment.status === 2) {
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
      return NextResponse.redirect(new URL(`/pago/exito/${orderId}`, origin));
    }

    if (payment.status === 4) {
      return NextResponse.redirect(new URL(`/pago/error?razon=cancelado&orden=${orderId}`, origin));
    }

    // rejected
    return NextResponse.redirect(new URL(`/pago/error?razon=rechazado&orden=${orderId}`, origin));
  } catch (err) {
    console.error("[Flow retorno]", err);
    return NextResponse.redirect(new URL("/pago/error?razon=error_interno", origin));
  }
}

// Flow also sends POST to confirmacion URL
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const token = body.get("token") as string;

    const payment = await getFlowPaymentStatus(token);
    const orderId = payment.commerceOrder;

    if (payment.status === 2) {
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paymentId: String(payment.flowOrder),
          paymentGateway: "flow",
          status: OrderStatus.CONFIRMED,
        },
      }).catch(console.error);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[Flow confirmacion]", err);
    return new Response("ERROR", { status: 500 });
  }
}
