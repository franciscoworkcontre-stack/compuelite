"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { OrderStatus } from "@prisma/client";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  PENDING:    { label: "Pendiente",   color: "#ffb800" },
  CONFIRMED:  { label: "Confirmado",  color: "#00ff66" },
  PROCESSING: { label: "Procesando",  color: "#4488ff" },
  SHIPPED:    { label: "Despachado",  color: "#8855ff" },
  DELIVERED:  { label: "Entregado",   color: "#00cc52" },
  CANCELLED:  { label: "Cancelado",   color: "#ff3333" },
  REFUNDED:   { label: "Reembolsado", color: "#888888" },
};

const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.admin.orders.useQuery({
    status: filterStatus,
    limit: 50,
  });

  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const orders = data?.items ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-xl font-black text-white uppercase tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pedidos
          </h1>
          <p className="text-xs text-[#555] mt-1">{orders.length} resultado{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilterStatus(undefined)}
          className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all ${
            !filterStatus
              ? "bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66]"
              : "border border-[#1a1a1a] text-[#555] hover:text-[#888]"
          }`}
        >
          Todos
        </button>
        {(Object.keys(STATUS_META) as OrderStatus[]).map((s) => {
          const meta = STATUS_META[s];
          const active = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(active ? undefined : s)}
              className="px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all border"
              style={{
                borderColor: active ? meta.color + "60" : "#1a1a1a",
                color: active ? meta.color : "#555",
                background: active ? meta.color + "18" : "transparent",
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-xs text-[#555]">No hay pedidos con este filtro</div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const meta = STATUS_META[order.status] ?? { label: order.status, color: "#555" };
            const isExpanded = expandedId === order.id;
            const shippingAddr = order.shippingAddress as Record<string, string>;

            return (
              <div
                key={order.id}
                className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#222] transition-all"
              >
                {/* Row */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-[#444] uppercase tracking-wider mb-0.5">Orden</p>
                      <p className="text-xs font-mono text-[#888]">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#444] uppercase tracking-wider mb-0.5">Cliente</p>
                      <p className="text-xs text-white truncate">{order.guestEmail ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#444] uppercase tracking-wider mb-0.5">Total</p>
                      <p className="text-sm font-black font-mono text-[#00ff66]">{formatCLP(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#444] uppercase tracking-wider mb-0.5">Estado</p>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={{ color: meta.color, background: `${meta.color}18`, border: `1px solid ${meta.color}33` }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[#333] flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-[#1a1a1a] px-5 py-4 bg-[#0d0d0d] space-y-4">
                    {/* Products */}
                    <div>
                      <p className="text-xs text-[#444] uppercase tracking-wider mb-2">Productos</p>
                      <div className="space-y-1.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#111] border border-[#222] rounded overflow-hidden flex-shrink-0">
                              {item.product.images[0]?.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.product.images[0].url} alt="" className="w-full h-full object-contain p-1" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs">🖥️</div>
                              )}
                            </div>
                            <p className="text-xs text-[#888] flex-1 truncate">{item.product.name}</p>
                            <p className="text-xs text-[#555]">×{item.quantity}</p>
                            <p className="text-xs font-mono text-white">{formatCLP(item.totalPrice)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping address */}
                    <div>
                      <p className="text-xs text-[#444] uppercase tracking-wider mb-2">Dirección de envío</p>
                      <p className="text-xs text-[#888]">
                        {shippingAddr.name} — {shippingAddr.line1}
                        {shippingAddr.line2 ? `, ${shippingAddr.line2}` : ""},{" "}
                        {shippingAddr.city}, {shippingAddr.region}
                      </p>
                    </div>

                    {/* Status update */}
                    <div>
                      <p className="text-xs text-[#444] uppercase tracking-wider mb-2">Cambiar estado</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_FLOW.map((s) => {
                          const m = STATUS_META[s];
                          const isCurrent = order.status === s;
                          return (
                            <button
                              key={s}
                              disabled={isCurrent || updateStatus.isPending}
                              onClick={() => updateStatus.mutate({ orderId: order.id, status: s })}
                              className="px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all border disabled:opacity-40 disabled:cursor-default"
                              style={{
                                borderColor: isCurrent ? m.color + "60" : "#222",
                                color: isCurrent ? m.color : "#555",
                                background: isCurrent ? m.color + "18" : "transparent",
                              }}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                        <button
                          disabled={order.status === "CANCELLED" || updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ orderId: order.id, status: "CANCELLED" })}
                          className="px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all border border-[#222] text-[#555] hover:border-[#ff3333]/40 hover:text-[#ff3333] disabled:opacity-40 disabled:cursor-default"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
