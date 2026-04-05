"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { PaymentMethod } from "@prisma/client";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

const PAYMENT_OPTIONS: {
  method: PaymentMethod;
  label: string;
  description: string;
  logo: string;
  badge?: string;
  color: string;
}[] = [
  {
    method: PaymentMethod.WEBPAY,
    label: "WebPay Plus",
    description: "Tarjetas de crédito y débito nacionales. Procesado por Transbank.",
    logo: "🏦",
    badge: "Más usado",
    color: "#e30613",
  },
  {
    method: PaymentMethod.MERCADOPAGO,
    label: "Mercado Pago",
    description: "Paga con tu cuenta MercadoPago, tarjetas o efectivo.",
    logo: "💳",
    badge: "Internacional",
    color: "#009ee3",
  },
  {
    method: PaymentMethod.FLOW,
    label: "Flow",
    description: "Todos los medios: WebPay, débito, crédito, prepago.",
    logo: "⚡",
    color: "#00b6ff",
  },
  {
    method: PaymentMethod.TRANSFER,
    label: "Transferencia bancaria",
    description: "Banco Estado · Cuenta corriente · Transferencia manual.",
    logo: "🏛️",
    color: "#00ff66",
  },
  {
    method: PaymentMethod.CASH_ON_DELIVERY,
    label: "Pago contra entrega",
    description: "Paga en efectivo al recibir tu pedido (solo RM).",
    logo: "💵",
    color: "#ffb800",
  },
];

const TRANSFER_INFO = {
  bank: "Banco Estado",
  type: "Cuenta Corriente",
  rut: "76.123.456-7",
  holder: "Compuelite SpA",
  email: "pagos@compuelite.cl",
};

export function PaymentSelector({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: order } = trpc.payments.orderPaymentStatus.useQuery({ orderId });
  const initiate = trpc.payments.initiate.useMutation();
  const confirmTransfer = trpc.payments.confirmTransfer.useMutation();

  const handlePay = async () => {
    if (!selected) return;
    setError("");
    setLoading(true);

    try {
      if (selected === PaymentMethod.TRANSFER) {
        await confirmTransfer.mutateAsync({ orderId });
        router.push(`/pedido/${orderId}`);
        return;
      }

      if (selected === PaymentMethod.CASH_ON_DELIVERY) {
        await confirmTransfer.mutateAsync({ orderId });
        router.push(`/pedido/${orderId}`);
        return;
      }

      const result = await initiate.mutateAsync({ orderId, method: selected });
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar el pago");
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00ff66] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#555] mb-8">
          <span>{order.orderNumber}</span>
          <span>›</span>
          <span className="text-white">Método de pago</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Payment methods */}
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5">
            <h1 className="text-sm font-black text-[#00ff66] uppercase tracking-widest mb-1"
              style={{ fontFamily: "var(--font-display)" }}>
              Selecciona cómo pagar
            </h1>
            <p className="text-xs text-[#555] mb-5">
              Total:{" "}
              <span className="text-white font-mono font-bold">
                {formatCLP(order.total)}
              </span>
            </p>

            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = selected === opt.method;
                return (
                  <button
                    key={opt.method}
                    onClick={() => setSelected(opt.method)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-[#00ff66]/50 bg-[#00ff66]/5"
                        : "border-[#1a1a1a] hover:border-[#333] hover:bg-[#0d0d0d]"
                    }`}
                  >
                    {/* Radio */}
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? "border-[#00ff66]" : "border-[#444]"
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#00ff66]" />
                      )}
                    </div>

                    {/* Logo */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border"
                      style={{
                        background: `${opt.color}15`,
                        borderColor: `${opt.color}30`,
                      }}
                    >
                      {opt.logo}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{opt.label}</p>
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#00ff66]/10 border border-[#00ff66]/20 text-[#00ff66] rounded">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#555] mt-0.5 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transfer info (shown when TRANSFER is selected) */}
          {selected === PaymentMethod.TRANSFER && (
            <div className="bg-[#0d1a0d] border border-[#00ff66]/20 rounded-2xl p-5">
              <h2 className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                style={{ fontFamily: "var(--font-display)" }}>
                Datos de transferencia
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Banco", TRANSFER_INFO.bank],
                  ["Tipo", TRANSFER_INFO.type],
                  ["RUT", TRANSFER_INFO.rut],
                  ["Titular", TRANSFER_INFO.holder],
                  ["Email", TRANSFER_INFO.email],
                  ["Monto exacto", formatCLP(order.total)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#0a0a0a] rounded-lg p-3">
                    <p className="text-xs text-[#555] mb-0.5">{label}</p>
                    <p className="text-sm text-white font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#555] mt-3">
                Envía el comprobante a{" "}
                <span className="text-[#00ff66]">{TRANSFER_INFO.email}</span> indicando
                el número de orden <span className="text-white font-mono">{order.orderNumber}</span>.
              </p>
            </div>
          )}

          {/* Cash on delivery notice */}
          {selected === PaymentMethod.CASH_ON_DELIVERY && (
            <div className="bg-[#1a1200] border border-[#ffb800]/20 rounded-2xl p-5">
              <h2 className="text-xs font-black text-[#ffb800] uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-display)" }}>
                Pago contra entrega
              </h2>
              <p className="text-sm text-[#888] leading-relaxed">
                Disponible solo para la Región Metropolitana. Pagas en efectivo o
                con tarjeta al recibir tu pedido. Se coordinará el despacho por WhatsApp.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-[#ff3333]/10 border border-[#ff3333]/30 rounded-xl text-sm text-[#ff6666]">
              {error}
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={!selected || loading}
            className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              fontFamily: "var(--font-display)",
              background: selected && !loading
                ? "linear-gradient(135deg, #00ff66, #00cc52)"
                : "#1a1a1a",
              color: selected && !loading ? "#000" : "#555",
              boxShadow: selected && !loading ? "0 0 24px rgba(0,255,102,0.25)" : "none",
            }}
          >
            {loading
              ? "Redirigiendo al pago…"
              : selected
              ? selected === PaymentMethod.TRANSFER || selected === PaymentMethod.CASH_ON_DELIVERY
                ? "Confirmar pedido →"
                : "Ir a pagar →"
              : "Selecciona un método de pago"}
          </button>
        </div>
      </div>
    </main>
  );
}
