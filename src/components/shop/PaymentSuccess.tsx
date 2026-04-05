"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

const GATEWAY_LABEL: Record<string, string> = {
  webpay: "WebPay Plus",
  mercadopago: "Mercado Pago",
  flow: "Flow",
};

export function PaymentSuccess({ orderId }: { orderId: string }) {
  const { data: order } = trpc.payments.orderPaymentStatus.useQuery({ orderId });

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex items-center">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Checkmark */}
        <div
          className="w-20 h-20 rounded-full bg-[#00ff66]/10 border-2 border-[#00ff66]/40 flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: "0 0 40px rgba(0,255,102,0.2)" }}
        >
          <svg className="w-10 h-10 text-[#00ff66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2"
          style={{ fontFamily: "var(--font-display)" }}>
          ¡Pago exitoso!
        </h1>

        {order && (
          <div className="mt-6 bg-[#111] border border-[#1a1a1a] rounded-2xl p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Orden</span>
              <span className="font-mono text-white">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Total pagado</span>
              <span className="font-mono font-bold text-[#00ff66]">{formatCLP(order.total)}</span>
            </div>
            {order.paymentGateway && (
              <div className="flex justify-between text-sm">
                <span className="text-[#555]">Método</span>
                <span className="text-white">
                  {GATEWAY_LABEL[order.paymentGateway] ?? order.paymentGateway}
                </span>
              </div>
            )}
            {order.paymentId && (
              <div className="flex justify-between text-sm">
                <span className="text-[#555]">Código autorización</span>
                <span className="font-mono text-[#888]">{order.paymentId}</span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-[#555] mb-8">
          Te enviaremos la confirmación a{" "}
          <span className="text-white">{order?.guestEmail}</span>
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/"
            className="px-5 py-2.5 border border-[#333] text-[#888] text-sm rounded-lg hover:border-[#555] hover:text-white transition-all uppercase tracking-wider">
            Inicio
          </Link>
          <Link href="/productos"
            className="px-5 py-2.5 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] transition-all"
            style={{ fontFamily: "var(--font-display)" }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  );
}
