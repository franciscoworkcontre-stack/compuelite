"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function CartView() {
  const { items, removeItem, updateQty, totalPrice } = useCartStore();
  const total = totalPrice();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center py-24">
          <p className="text-6xl mb-6 opacity-20">🛒</p>
          <h1
            className="text-2xl font-black text-white uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Carrito vacío
          </h1>
          <p className="text-[#555] mb-8">Aún no has agregado ningún producto.</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/productos"
              className="px-6 py-3 border border-[#333] rounded text-sm text-[#888] hover:border-[#555] hover:text-white transition-all uppercase tracking-wider"
            >
              Ver productos
            </Link>
            <Link
              href="/builder"
              className="px-6 py-3 bg-[#00ff66] text-black rounded text-sm font-black uppercase tracking-wider hover:bg-[#00cc52] transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Armar PC
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <h1
          className="text-xl font-black text-white uppercase tracking-widest mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Carrito
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 bg-[#111] border border-[#1a1a1a] rounded-xl hover:border-[#222] transition-all"
              >
                {/* Image */}
                <div className="w-16 h-16 bg-[#0d0d0d] border border-[#222] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-2xl opacity-20">🖥️</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#555] uppercase tracking-wider">{item.brand}</p>
                  <p className="text-sm font-semibold text-white leading-snug truncate">{item.name}</p>
                  <p className="text-xs font-mono text-[#555] mt-0.5">{item.sku}</p>
                </div>

                {/* Qty + price + remove */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-base font-bold font-mono text-[#00ff66]">
                    {formatCLP(item.price * item.quantity)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-6 h-6 bg-[#1a1a1a] border border-[#333] rounded text-[#888] hover:text-white hover:border-[#555] transition-all text-sm leading-none"
                    >
                      −
                    </button>
                    <span className="text-sm font-mono text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="w-6 h-6 bg-[#1a1a1a] border border-[#333] rounded text-[#888] hover:text-white hover:border-[#555] transition-all text-sm leading-none"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-1 p-1 text-[#444] hover:text-[#ff3333] transition-colors"
                      aria-label="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 sticky top-24">
              <h2
                className="text-xs font-black text-[#00ff66] uppercase tracking-widest mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Resumen
              </h2>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-xs">
                    <span className="text-[#555] truncate max-w-[160px]">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-[#888] font-mono flex-shrink-0 ml-2">
                      {formatCLP(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#222] pt-4 mb-5">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-[#888]">Total</span>
                  <span
                    className="text-2xl font-black font-mono text-[#00ff66]"
                    style={{
                      fontFamily: "var(--font-display)",
                      textShadow: "0 0 16px rgba(0,255,102,0.3)",
                    }}
                  >
                    {formatCLP(total)}
                  </span>
                </div>
                <p className="text-xs text-[#555] mt-1">IVA incluido · Despacho a coordinar</p>
              </div>

              <Link
                href="/checkout"
                className="block w-full py-3 text-center bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Continuar →
              </Link>

              <Link
                href="/productos"
                className="block w-full py-2 text-center text-xs text-[#555] hover:text-[#888] transition-colors mt-3"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
