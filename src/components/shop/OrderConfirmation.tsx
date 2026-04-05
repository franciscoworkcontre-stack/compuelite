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

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = trpc.orders.byId.useQuery({ id: orderId });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00ff66] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#555] mb-4">Pedido no encontrado.</p>
          <Link href="/" className="text-[#00ff66] hover:underline text-sm">Inicio</Link>
        </div>
      </main>
    );
  }

  const shippingAddr = order.shippingAddress as Record<string, string>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success header */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center mx-auto mb-4"
            style={{}}
          >
            <svg className="w-8 h-8 text-[#00ff66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1
            className="text-2xl font-black text-white uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ¡Pedido recibido!
          </h1>
          <p className="text-[#555] text-sm">
            Orden{" "}
            <span className="font-mono text-[#888]">{order.orderNumber}</span>
          </p>
        </div>

        {/* Payment instructions */}
        <div className="bg-[#0d1a0d] border border-[#00ff66]/20 rounded-xl p-5 mb-4">
          <h2
            className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Siguiente paso: Transferencia bancaria
          </h2>
          <p className="text-sm text-[#888] mb-3">
            Enviaremos los datos de pago a{" "}
            <span className="text-white font-medium">{order.guestEmail}</span>.
            Tu pedido se procesa al confirmar el pago.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0a0a0a] rounded-lg p-3">
              <p className="text-[#555] mb-1">Banco</p>
              <p className="text-white font-medium">Banco Estado</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-3">
              <p className="text-[#555] mb-1">Titular</p>
              <p className="text-white font-medium">Compuelite SpA</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-3">
              <p className="text-[#555] mb-1">Tipo de cuenta</p>
              <p className="text-white font-medium">Cuenta Corriente</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-3">
              <p className="text-[#555] mb-1">Monto a transferir</p>
              <p className="text-[#00ff66] font-black font-mono">{formatCLP(order.total)}</p>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <h2
            className="text-xs font-black text-[#555] uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Detalle del pedido
          </h2>
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#888]">
                  {item.quantity}× {item.product.name}
                </span>
                <span className="font-mono text-white">{formatCLP(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#222] pt-3 flex justify-between items-baseline">
            <span className="text-sm text-[#888]">Total</span>
            <span className="text-xl font-black font-mono text-[#00ff66]">
              {formatCLP(order.total)}
            </span>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-8">
          <h2
            className="text-xs font-black text-[#555] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Envío a
          </h2>
          <p className="text-sm text-white">{shippingAddr.name}</p>
          <p className="text-sm text-[#888]">{shippingAddr.line1}</p>
          {shippingAddr.line2 && <p className="text-sm text-[#888]">{shippingAddr.line2}</p>}
          <p className="text-sm text-[#888]">
            {shippingAddr.city}, {shippingAddr.region}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/productos"
            className="px-6 py-3 border border-[#333] rounded text-sm text-[#888] hover:border-[#555] hover:text-white transition-all uppercase tracking-wider"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded text-sm text-[#00ff66] hover:bg-[#00ff66]/20 transition-all uppercase tracking-wider"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
