"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(val);
}

export function PaymentPending({ orderId }: { orderId: string }) {
  const { data: order } = trpc.payments.orderPaymentStatus.useQuery({ orderId });

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex items-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#ffb800]/10 border-2 border-[#ffb800]/40 flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: "0 0 40px rgba(255,184,0,0.15)" }}>
          <svg className="w-10 h-10 text-[#ffb800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2"
          style={{ fontFamily: "var(--font-display)" }}>
          Pago en proceso
        </h1>
        <p className="text-sm text-[#555] mb-6">
          Tu pago está siendo procesado por Mercado Pago. Te notificaremos cuando sea confirmado.
        </p>

        {order && (
          <div className="mb-8 bg-[#111] border border-[#1a1a1a] rounded-2xl p-5 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Orden</span>
              <span className="font-mono text-white">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Total</span>
              <span className="font-mono font-bold text-[#ffb800]">{formatCLP(order.total)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link href="/"
            className="px-5 py-2.5 border border-[#333] text-[#888] text-sm rounded-lg hover:border-[#555] hover:text-white transition-all uppercase tracking-wider">
            Inicio
          </Link>
          <Link href="/cuenta"
            className="px-5 py-2.5 bg-[#ffb800]/10 border border-[#ffb800]/30 text-[#ffb800] text-sm rounded-lg hover:bg-[#ffb800]/20 transition-all uppercase tracking-wider">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </main>
  );
}
