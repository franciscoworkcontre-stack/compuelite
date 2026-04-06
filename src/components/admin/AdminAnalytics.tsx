"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

type Period = "7d" | "30d" | "90d" | "365d";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function SparkBar({ value, max, color = "#16a34a" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");
  const { data, isLoading } = trpc.admin.analytics.useQuery({ period });

  const totalRevenue = data?.revenueByDay.reduce((s, d) => s + d.revenue, 0) ?? 0;
  const maxRevDay = Math.max(...(data?.revenueByDay.map((d) => d.revenue) ?? [0]));
  const maxCatRevenue = Math.max(...(data?.revenueByCategory.map((c) => c.revenue) ?? [0]));

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black text-[#111827] uppercase tracking-wide">Analytics</h1>
          <p className="text-xs text-[#6b7280] mt-1">Métricas de ventas e inventario</p>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d", "365d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${period === p ? "bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20" : "bg-[#f3f4f6] text-[#6b7280] hover:text-[#374151]"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-[#6b7280] text-sm">Cargando datos...</p>
      ) : (
        <div className="space-y-8">
          {/* Summary card */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl p-5">
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">Revenue total</p>
              <p className="text-2xl font-black font-mono text-[#16a34a]">{formatCLP(totalRevenue)}</p>
            </div>
            <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl p-5">
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">AOV promedio</p>
              <p className="text-2xl font-black font-mono text-[#111827]">
                {data?.aovByDay.length
                  ? formatCLP(data.aovByDay.reduce((s, d) => s + d.aov, 0) / data.aovByDay.length)
                  : "$0"}
              </p>
            </div>
            <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl p-5">
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">Días con ventas</p>
              <p className="text-2xl font-black font-mono text-[#111827]">{data?.revenueByDay.filter((d) => d.revenue > 0).length ?? 0}</p>
            </div>
          </div>

          {/* Revenue by day sparkline */}
          <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl p-5">
            <h2 className="text-xs font-black text-[#16a34a] uppercase tracking-wider mb-4">Revenue diario</h2>
            {data?.revenueByDay.length ? (
              <div className="flex items-end gap-0.5 h-24">
                {data.revenueByDay.map((d) => {
                  const pct = maxRevDay > 0 ? (d.revenue / maxRevDay) * 100 : 0;
                  return (
                    <div key={d.date} title={`${d.date}: ${formatCLP(d.revenue)}`} className="flex-1 bg-[#16a34a]/20 hover:bg-[#16a34a]/40 transition-colors rounded-sm" style={{ height: `${Math.max(2, pct)}%` }} />
                  );
                })}
              </div>
            ) : (
              <p className="text-[#9ca3af] text-sm text-center py-8">Sin ventas en el período</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Top products */}
            <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl p-5">
              <h2 className="text-xs font-black text-[#16a34a] uppercase tracking-wider mb-4">Top 10 productos</h2>
              {data?.topProducts.length ? (
                <div className="space-y-3">
                  {data.topProducts.map((p, i) => (
                    <div key={p.productId}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#374151] truncate flex-1">{i + 1}. {p.name}</span>
                        <span className="text-[#111827] font-mono ml-2 flex-shrink-0">{formatCLP(p.totalRevenue)}</span>
                      </div>
                      <SparkBar value={p.totalRevenue} max={data.topProducts[0]?.totalRevenue ?? 1} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#9ca3af] text-sm text-center py-4">Sin datos</p>
              )}
            </div>

            {/* Revenue by category */}
            <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl p-5">
              <h2 className="text-xs font-black text-[#16a34a] uppercase tracking-wider mb-4">Revenue por categoría</h2>
              {data?.revenueByCategory.length ? (
                <div className="space-y-3">
                  {data.revenueByCategory.map((c) => (
                    <div key={c.categoryName}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#374151] truncate flex-1">{c.categoryName}</span>
                        <span className="text-[#111827] font-mono ml-2 flex-shrink-0">{formatCLP(c.revenue)}</span>
                      </div>
                      <SparkBar value={c.revenue} max={maxCatRevenue} color="#6366f1" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#9ca3af] text-sm text-center py-4">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
