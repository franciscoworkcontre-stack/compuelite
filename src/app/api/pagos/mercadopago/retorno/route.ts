import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;

  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference"); // orderId
  const status = searchParams.get("status");

  if (!externalReference) {
    return NextResponse.redirect(new URL("/pago/error?razon=referencia_faltante", origin));
  }

  // User cancelled / rejected without a payment_id
  if (!paymentId || status === "null" || status === "failure") {
    return NextResponse.redirect(
      new URL(`/pago/error?razon=rechazado&orden=${externalReference}`, origin)
    );
  }

  try {
    // Always verify against the MP API — never trust redirect query params
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });

    if (!res.ok) {
      console.error("[MP retorno] API error", res.status);
      return NextResponse.redirect(new URL("/pago/error?razon=verificacion_fallida", origin));
    }

    const payment = await res.json() as {
      status: string;
      external_reference: string;
      id: number;
      status_detail?: string;
    };

    // Ensure the payment belongs to this order
    if (payment.external_reference !== externalReference) {
      console.error("[MP retorno] external_reference mismatch");
      return NextResponse.redirect(new URL("/pago/error?razon=referencia_invalida", origin));
    }

    if (payment.status === "approved") {
      await db.order.update({
        where: { id: externalReference },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paymentId: String(payment.id),
          paymentGateway: "mercadopago",
          status: OrderStatus.CONFIRMED,
          paymentMeta: {
            mpPaymentId: payment.id,
            mpStatus: payment.status,
            mpStatusDetail: payment.status_detail,
          },
        },
      });
      return NextResponse.redirect(new URL(`/pago/exito/${externalReference}`, origin));
    }

    if (payment.status === "pending" || payment.status === "in_process") {
      await db.order.update({
        where: { id: externalReference },
        data: {
          paymentStatus: PaymentStatus.PROCESSING,
          paymentId: String(payment.id),
          paymentGateway: "mercadopago",
        },
      }).catch(console.error);
      return NextResponse.redirect(new URL(`/pago/pendiente/${externalReference}`, origin));
    }

    // rejected, cancelled, etc.
    return NextResponse.redirect(
      new URL(`/pago/error?razon=rechazado&orden=${externalReference}`, origin)
    );
  } catch (err) {
    console.error("[MP retorno]", err);
    return NextResponse.redirect(new URL("/pago/error?razon=error_interno", origin));
  }
}
