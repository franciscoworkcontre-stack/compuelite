"use client";

import { useSession, signOut } from "next-auth/react";
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

function timeAgo(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pendiente",   color: "#ffb800" },
  CONFIRMED:  { label: "Confirmado",  color: "#00ff66" },
  PROCESSING: { label: "Procesando",  color: "#4488ff" },
  SHIPPED:    { label: "Despachado",  color: "#8855ff" },
  DELIVERED:  { label: "Entregado",   color: "#00cc52" },
  CANCELLED:  { label: "Cancelado",   color: "#ff3333" },
  REFUNDED:   { label: "Reembolsado", color: "#888888" },
};

export function AccountView() {
  const { data: session } = useSession();
  const userId = session?.user.id ?? "";

  const { data, isLoading } = trpc.auth.me.useQuery(
    { userId },
    { enabled: Boolean(userId) }
  );

  if (!session) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#555] mb-4 text-sm">Debes iniciar sesión para ver tu cuenta.</p>
          <Link href="/login" className="text-[#00ff66] hover:underline text-sm">
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}>
              Mi cuenta
            </h1>
            <p className="text-xs text-[#555] mt-1">{session.user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-[#444] hover:text-[#888] transition-colors border border-[#1a1a1a] px-3 py-1.5 rounded"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center text-xl font-black text-[#00ff66]"
                  style={{ fontFamily: "var(--font-display)" }}>
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{session.user.name ?? "Usuario"}</p>
                  <p className="text-xs text-[#555]">{session.user.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#555]">Pedidos</span>
                  <span className="text-white font-medium">{data?.orders.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Miembro desde</span>
                  <span className="text-white font-medium">
                    {data ? timeAgo(data.createdAt) : "—"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1a1a1a] space-y-2">
                <Link
                  href="/productos"
                  className="flex items-center gap-2 text-xs text-[#555] hover:text-[#00ff66] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Ver catálogo
                </Link>
                <Link
                  href="/builder"
                  className="flex items-center gap-2 text-xs text-[#555] hover:text-[#00ff66] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  PC Builder 3D
                </Link>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-black text-[#444] uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-display)" }}>
              Mis pedidos
            </h2>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ) : !data?.orders.length ? (
              <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-8 text-center">
                <p className="text-3xl mb-3 opacity-20">📦</p>
                <p className="text-sm text-[#555]">Aún no has realizado pedidos.</p>
                <Link href="/productos" className="inline-block mt-4 text-xs text-[#00ff66] hover:underline">
                  Ver productos →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.orders.map((order) => {
                  const st = STATUS_META[order.status] ?? { label: order.status, color: "#555" };
                  return (
                    <div key={order.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#222] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs font-mono text-[#888]">{order.orderNumber}</p>
                          <p className="text-xs text-[#444] mt-0.5">{timeAgo(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black font-mono text-[#00ff66]">
                            {formatCLP(order.total)}
                          </p>
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
                            style={{ color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}33` }}
                          >
                            {st.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {order.items.map((item) => (
                          <Link
                            key={item.id}
                            href={`/productos/${item.product.slug}`}
                            className="flex items-center gap-2 px-2 py-1 bg-[#0d0d0d] border border-[#1a1a1a] rounded hover:border-[#333] transition-colors"
                          >
                            {item.product.images[0]?.url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.product.images[0].url} alt="" className="w-6 h-6 object-contain" />
                            )}
                            <span className="text-xs text-[#666] truncate max-w-[140px]">
                              {item.product.name}
                            </span>
                            <span className="text-xs text-[#444]">×{item.quantity}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
