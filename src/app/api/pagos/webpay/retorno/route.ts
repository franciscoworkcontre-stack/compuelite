import { NextRequest, NextResponse } from "next/server";
import { confirmWebpayTransaction } from "@/lib/payments/webpay";
import { db } from "@/server/db/client";
import { PaymentStatus, OrderStatus } from "@prisma/client";

// WebPay redirects back with POST (token_ws in body) or GET (error)
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const token = body.get("token_ws") as string | null;

    if (!token) {
      return NextResponse.redirect(new URL("/pago/error?razon=token_missing", req.nextUrl.origin));
    }

    // session_id is embedded in the token — peek before committing for idempotency
    // We commit first, then check; Transbank only allows one commit per token anyway
    const result = await confirmWebpayTransaction(token);

    // response_code 0 = success
    if (result.response_code !== 0 || result.status !== "AUTHORIZED") {
      return NextResponse.redirect(
        new URL(`/pago/error?razon=rechazado&codigo=${result.response_code}`, req.nextUrl.origin)
      );
    }

    const orderId = result.session_id;

    // Idempotency: if order is already CONFIRMED (e.g. user refreshed), skip DB update
    const existing = await db.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (existing?.status !== OrderStatus.CONFIRMED) {
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paymentId: result.authorization_code,
          paymentGateway: "webpay",
          status: OrderStatus.CONFIRMED,
          paymentMeta: {
            authorizationCode: result.authorization_code,
            cardLast4: result.card_detail?.card_number,
            paymentType: result.payment_type_code,
            installments: result.installments_number,
            transactionDate: result.transaction_date,
            amount: result.amount,
          },
        },
      });
    }

    return NextResponse.redirect(new URL(`/pago/exito/${orderId}`, req.nextUrl.origin));
  } catch (err) {
    console.error("[WebPay retorno]", err);
    return NextResponse.redirect(new URL("/pago/error?razon=error_interno", req.nextUrl.origin));
  }
}

// WebPay also sends GET when user cancels
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tbkOrdenCompra = searchParams.get("TBK_ORDEN_COMPRA");

  if (tbkOrdenCompra) {
    return NextResponse.redirect(new URL(`/pago/error?razon=cancelado`, req.nextUrl.origin));
  }

  return NextResponse.redirect(new URL("/pago/error?razon=desconocido", req.nextUrl.origin));
}
