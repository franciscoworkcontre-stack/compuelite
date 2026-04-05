import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;

  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference"); // orderId

  if (!externalReference) {
    return NextResponse.redirect(new URL("/pago/error?razon=referencia_faltante", origin));
  }

  if (status === "approved" && paymentId) {
    await db.order.update({
      where: { id: externalReference },
      data: {
        paymentStatus: PaymentStatus.COMPLETED,
        paymentId,
        paymentGateway: "mercadopago",
        status: OrderStatus.CONFIRMED,
        paymentMeta: {
          mpPaymentId: paymentId,
          mpStatus: status,
          collectionStatus: searchParams.get("collection_status"),
        },
      },
    }).catch(console.error);

    return NextResponse.redirect(new URL(`/pago/exito/${externalReference}`, origin));
  }

  if (status === "pending") {
    await db.order.update({
      where: { id: externalReference },
      data: {
        paymentStatus: PaymentStatus.PROCESSING,
        paymentId: paymentId ?? undefined,
        paymentGateway: "mercadopago",
      },
    }).catch(console.error);

    return NextResponse.redirect(
      new URL(`/pago/pendiente/${externalReference}`, origin)
    );
  }

  // failure
  return NextResponse.redirect(
    new URL(`/pago/error?razon=rechazado&orden=${externalReference}`, origin)
  );
}
