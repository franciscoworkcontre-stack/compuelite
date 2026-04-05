"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const REASONS: Record<string, string> = {
  rechazado: "El pago fue rechazado por el banco o la pasarela.",
  cancelado: "El pago fue cancelado.",
  token_missing: "No se recibió el token de pago.",
  token_faltante: "No se recibió el token de Flow.",
  error_interno: "Ocurrió un error interno. Intenta nuevamente.",
  referencia_faltante: "No se encontró la referencia del pedido.",
  desconocido: "Error desconocido.",
};

export function PaymentError() {
  const params = useSearchParams();
  const razon = params.get("razon") ?? "desconocido";
  const orderId = params.get("orden");
  const message = REASONS[razon] ?? "Hubo un problema con el pago.";

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex items-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#ff3333]/10 border-2 border-[#ff3333]/40 flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: "0 0 40px rgba(255,51,51,0.15)" }}>
          <svg className="w-10 h-10 text-[#ff3333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2"
          style={{ fontFamily: "var(--font-display)" }}>
          Pago no completado
        </h1>
        <p className="text-sm text-[#555] mb-8 leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-center flex-wrap">
          {orderId && (
            <Link href={`/pago/${orderId}`}
              className="px-5 py-2.5 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] transition-all"
              style={{ fontFamily: "var(--font-display)" }}>
              Reintentar pago
            </Link>
          )}
          <Link href="/carrito"
            className="px-5 py-2.5 border border-[#333] text-[#888] text-sm rounded-lg hover:border-[#555] hover:text-white transition-all uppercase tracking-wider">
            Volver al carrito
          </Link>
          <Link href="/"
            className="px-5 py-2.5 border border-[#222] text-[#555] text-sm rounded-lg hover:text-[#888] transition-all">
            Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
