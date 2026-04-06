"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} días`;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pendiente",  color: "#ffb800" },
  CONFIRMED:  { label: "Confirmado", color: "#16a34a" },
  PROCESSING: { label: "Procesando", color: "#4488ff" },
  SHIPPED:    { label: "Despachado", color: "#8855ff" },
  DELIVERED:  { label: "Entregado",  color: "#15803d" },
  CANCELLED:  { label: "Cancelado",  color: "#ff3333" },
};

export function AdminDashboard() {
  const { data, isLoading } = trpc.admin.stats.useQuery();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Pedidos totales",
      value: data?.totalOrders ?? 0,
      sub: `${data?.pendingOrders ?? 0} pendientes`,
      subColor: data?.pendingOrders ? "#ffb800" : "#555",
      icon: "📋",
    },
    {
      label: "Ingresos confirmados",
      value: formatCLP(data?.totalRevenue ?? 0),
      sub: "órdenes confirmadas",
      subColor: "#555",
      icon: "💰",
    },
    {
      label: "Productos activos",
      value: data?.totalProducts ?? 0,
      sub: `${data?.lowStock ?? 0} con stock bajo`,
      subColor: data?.lowStock ? "#ff3333" : "#555",
      icon: "📦",
    },
    {
      label: "Por atender",
      value: data?.pendingOrders ?? 0,
      sub: "requieren acción",
      subColor: data?.pendingOrders ? "#ffb800" : "#555",
      icon: "⚡",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-xl font-black text-[#111827] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard
        </h1>
        <p className="text-xs text-[#6b7280] mt-1">Vista general del negocio</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl p-5 hover:border-[#d1d5db] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-[#6b7280] uppercase tracking-wider leading-tight">{stat.label}</p>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p
              className="text-2xl font-black text-[#111827] font-mono mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: stat.subColor }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <Link
          href="/admin/pedidos"
          className="flex items-center gap-3 p-4 bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl hover:border-[#16a34a]/30 hover:bg-[#f0fdf4] transition-all group"
        >
          <div className="w-10 h-10 bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-lg flex items-center justify-center text-lg">
            📋
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827] group-hover:text-[#16a34a] transition-colors">
              Ver pedidos pendientes
            </p>
            <p className="text-xs text-[#6b7280]">{data?.pendingOrders ?? 0} requieren atención</p>
          </div>
          <svg className="w-4 h-4 text-[#9ca3af] group-hover:text-[#16a34a] ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/admin/productos"
          className="flex items-center gap-3 p-4 bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl hover:border-[#16a34a]/30 hover:bg-[#f0fdf4] transition-all group"
        >
          <div className="w-10 h-10 bg-[#ff3333]/10 border border-[#ff3333]/20 rounded-lg flex items-center justify-center text-lg">
            📦
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827] group-hover:text-[#16a34a] transition-colors">
              Gestionar stock
            </p>
            <p className="text-xs text-[#6b7280]">{data?.lowStock ?? 0} productos con stock bajo</p>
          </div>
          <svg className="w-4 h-4 text-[#9ca3af] group-hover:text-[#16a34a] ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-black text-[#6b7280] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Últimos pedidos
          </h2>
          <Link href="/admin/pedidos" className="text-xs text-[#16a34a] hover:underline">
            Ver todos →
          </Link>
        </div>

        <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl overflow-hidden">
          {data?.recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6b7280]">
              Aún no hay pedidos
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  {["Orden", "Email", "Items", "Total", "Estado", "Hace"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-[#9ca3af] uppercase tracking-wider font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders.map((order) => {
                  const st = STATUS_LABEL[order.status] ?? { label: order.status, color: "#555" };
                  return (
                    <tr key={order.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#374151]">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-xs text-[#374151]">{order.guestEmail ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-[#6b7280]">{order.items.length} producto{order.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#16a34a] text-xs">{formatCLP(Number(order.total))}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}33` }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9ca3af]">{timeAgo(order.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
