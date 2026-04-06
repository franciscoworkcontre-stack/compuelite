"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatM(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return formatCLP(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO DATA — reemplazar con trpc.admin.analytics cuando haya datos reales
// ─────────────────────────────────────────────────────────────────────────────

const REVENUE_DATA = [
  { mes: "Ene", ventas: 18_400_000, costo: 11_040_000, ordenes: 142, visitantes: 4_820 },
  { mes: "Feb", ventas: 21_200_000, costo: 12_720_000, ordenes: 168, visitantes: 5_340 },
  { mes: "Mar", ventas: 19_800_000, costo: 11_880_000, ordenes: 151, visitantes: 4_990 },
  { mes: "Abr", ventas: 24_600_000, costo: 14_760_000, ordenes: 194, visitantes: 6_210 },
  { mes: "May", ventas: 22_100_000, costo: 13_260_000, ordenes: 175, visitantes: 5_580 },
  { mes: "Jun", ventas: 28_400_000, costo: 17_040_000, ordenes: 224, visitantes: 7_100 },
  { mes: "Jul", ventas: 31_800_000, costo: 19_080_000, ordenes: 256, visitantes: 8_020 },
  { mes: "Ago", ventas: 29_200_000, costo: 17_520_000, ordenes: 234, visitantes: 7_380 },
  { mes: "Sep", ventas: 33_600_000, costo: 20_160_000, ordenes: 271, visitantes: 8_490 },
  { mes: "Oct", ventas: 38_200_000, costo: 22_920_000, ordenes: 308, visitantes: 9_640 },
  { mes: "Nov", ventas: 52_400_000, costo: 31_440_000, ordenes: 421, visitantes: 13_210 }, // CyberMonday Chile
  { mes: "Dic", ventas: 47_800_000, costo: 28_680_000, ordenes: 385, visitantes: 12_070 },
];

const CATEGORY_DATA = [
  { name: "GPU",            value: 38, color: "#16a34a" },
  { name: "CPU",            value: 22, color: "#2563eb" },
  { name: "Motherboard",    value: 14, color: "#d97706" },
  { name: "RAM",            value: 10, color: "#7c3aed" },
  { name: "Almacenamiento", value: 8,  color: "#dc2626" },
  { name: "Periféricos",    value: 8,  color: "#0891b2" },
];

const TOP_PRODUCTS = [
  { name: "RTX 4070 Ti Super 16GB",  revenue: 42_800_000, units: 34,  brand: "NVIDIA"  },
  { name: "Ryzen 9 7950X",           revenue: 31_200_000, units: 48,  brand: "AMD"     },
  { name: "RTX 4080 Super 16GB",     revenue: 28_600_000, units: 18,  brand: "NVIDIA"  },
  { name: "Core i9-14900K",          revenue: 22_400_000, units: 41,  brand: "Intel"   },
  { name: "B650E Carbon WiFi",       revenue: 18_900_000, units: 63,  brand: "MSI"     },
  { name: "Vengeance 32GB DDR5",     revenue: 16_200_000, units: 108, brand: "Corsair" },
  { name: "Samsung 990 Pro 2TB",     revenue: 14_800_000, units: 142, brand: "Samsung" },
  { name: "RX 7900 XTX 24GB",       revenue: 13_600_000, units: 11,  brand: "AMD"     },
];

const TOTAL_VENTAS  = REVENUE_DATA.reduce((s, d) => s + d.ventas, 0);
const TOTAL_COSTO   = REVENUE_DATA.reduce((s, d) => s + d.costo, 0);
const TOTAL_ORDENES = REVENUE_DATA.reduce((s, d) => s + d.ordenes, 0);

// ─────────────────────────────────────────────────────────────────────────────
// P&L — estructura real con datos simulados
// ─────────────────────────────────────────────────────────────────────────────

const PNL = {
  ingresos:            TOTAL_VENTAS,
  costoVentas:         TOTAL_COSTO,        // ~60% gross margin
  gastosOperacionales: 24_800_000,         // sueldos, oficina, hosting, etc.
  gastosMarketing:      8_400_000,
  depreciacion:         2_100_000,
  gastosFinancieros:    1_200_000,
};

const PNL_DERIVED = {
  utilidadBruta:        PNL.ingresos - PNL.costoVentas,
  utilidadOperacional:  PNL.ingresos - PNL.costoVentas - PNL.gastosOperacionales - PNL.gastosMarketing - PNL.depreciacion,
  utilidadAnteImpuesto: PNL.ingresos - PNL.costoVentas - PNL.gastosOperacionales - PNL.gastosMarketing - PNL.depreciacion - PNL.gastosFinancieros,
};

// ─────────────────────────────────────────────────────────────────────────────
// IMPUESTOS CHILE
//
// Fuentes utilizadas:
//   [LIR]  DL 824 — Ley sobre Impuesto a la Renta
//   [IVA]  DL 825 — Ley sobre Impuesto a las Ventas y Servicios
//   [MOD]  Ley 21.210 (2020) — Modernización Tributaria (modifica art. 14 LIR)
//   [SII]  www.sii.cl — Calendario tributario oficial y formularios
//   [MUN]  Ley 3.063 — Ley de Rentas Municipales (patente municipal)
//
// Régimen General 14A:  27% — SpA/SA ingresos > UF 75.000/año  [LIR art. 14A]
// Régimen Pro PyME 14D: 25% — ingresos ≤ UF 75.000/año         [LIR art. 14D]
// IVA: 19% tasa vigente sobre valor neto de ventas              [IVA art. 14]
// PPM: pago provisional mensual ≈ 2-4% ingresos brutos          [LIR art. 84]
// ─────────────────────────────────────────────────────────────────────────────

// UF aproximada 2025 — actualizar mensualmente desde www.sii.cl/valores/uf/
const UF_HOY = 38_100;
const UF_LIMITE_PYME = 75_000;                  // art. 14D LIR [MOD]
const LIMITE_PYME_CLP = UF_LIMITE_PYME * UF_HOY;

const esPyme = PNL.ingresos < LIMITE_PYME_CLP;
const TASA_PRIMERA_CATEGORIA = esPyme ? 0.25 : 0.27; // art. 14A / 14D LIR [LIR][MOD]

// IVA — art. 14 DL 825 — tasa 19%
// Débito fiscal = IVA sobre ventas; Crédito fiscal = IVA soportado en compras
const TASA_IVA = 0.19;
const IVA_DEBITO  = Math.round((PNL.ingresos / 1.19) * TASA_IVA);
const IVA_CREDITO = Math.round((PNL.costoVentas / 1.19) * TASA_IVA * 0.7); // ~70% de compras con factura
const IVA_NETO_ANUAL = IVA_DEBITO - IVA_CREDITO;

// Impuesto de Primera Categoría — art. 20 LIR
const IMPUESTO_PRIMERA_CATEGORIA = Math.max(
  0,
  Math.round(PNL_DERIVED.utilidadAnteImpuesto * TASA_PRIMERA_CATEGORIA)
);

// PPM (Pagos Provisionales Mensuales) — art. 84 LIR
// Estimado en ~2,5% ingresos brutos mensuales; se descuenta del F22 anual
const TASA_PPM = 0.025;
const PPM_ANUAL = Math.round(PNL.ingresos * TASA_PPM);

const UTILIDAD_NETA = PNL_DERIVED.utilidadAnteImpuesto - IMPUESTO_PRIMERA_CATEGORIA;

// ─────────────────────────────────────────────────────────────────────────────
// OBLIGACIONES TRIBUTARIAS — Calendario [SII]
// ─────────────────────────────────────────────────────────────────────────────

const OBLIGACIONES = [
  {
    nombre: "F29 — IVA + PPM mensual",
    descripcion: "Declaración del IVA neto (débito fiscal − crédito fiscal) más el Pago Provisional Mensual (PPM) que se abona a cuenta del Impuesto Anual. Se presenta aunque el resultado sea cero. Las Grandes Empresas tienen vencimiento el día 12; el resto el día 20.",
    frecuencia: "Mensual",
    vencimiento: "Día 20 del mes siguiente (Grandes Empresas: día 12)",
    formulario: "F29",
    color: "#2563eb",
    ley: "Art. 64 DL 825 (IVA) · Art. 84 LIR (PPM)",
    monto: Math.round(IVA_NETO_ANUAL / 12),
    urgente: false,
  },
  {
    nombre: "F22 — Declaración Anual de Renta",
    descripcion: "Declaración del Impuesto de Primera Categoría sobre la utilidad del ejercicio anterior. Del monto calculado se descuenta el PPM pagado durante el año. Si el PPM supera el impuesto, el SII devuelve la diferencia. Vence en abril de cada año según el calendario que publica el SII.",
    frecuencia: "Anual",
    vencimiento: "Abril — fecha exacta publicada en www.sii.cl cada año",
    formulario: "F22",
    color: "#16a34a",
    ley: `Art. 20 LIR · Régimen ${esPyme ? "14D Pro PyME (25%)" : "14A General (27%)"}`,
    monto: IMPUESTO_PRIMERA_CATEGORIA,
    urgente: true,
  },
  {
    nombre: "F50 — Retenciones laborales",
    descripcion: "Retención y entero del Impuesto Único de Segunda Categoría (trabajadores dependientes) y declaración de cotizaciones provisionales (AFP, Fonasa/Isapre). Aplica solo si la empresa tiene trabajadores con contrato.",
    frecuencia: "Mensual",
    vencimiento: "Día 10 del mes siguiente",
    formulario: "F50",
    color: "#d97706",
    ley: "Art. 74 N°1 LIR — Retención trabajadores dependientes",
    monto: null,
    urgente: false,
  },
  {
    nombre: "Patente Municipal",
    descripcion: "Derecho por ejercicio de actividades comerciales, industriales o de servicios dentro del territorio de la municipalidad. La base de cálculo es el capital propio tributario declarado en el F22 (entre 0,25‰ y 5‰ según el municipio). Se paga en 2 cuotas iguales.",
    frecuencia: "Semestral",
    vencimiento: "Cuota 1: Enero · Cuota 2: Julio",
    formulario: "Municipalidad correspondiente",
    color: "#7c3aed",
    ley: "Ley 3.063 Rentas Municipales · art. 23 y ss.",
    monto: Math.round(UTILIDAD_NETA * 0.005),
    urgente: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

type Period = "6m" | "12m";

function KpiCard({
  label, value, sub, trend, color = "#16a34a", delay = 0,
}: {
  label: string; value: string; sub?: string; trend?: number; color?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-[#e5e7eb] rounded-xl p-5"
    >
      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-black font-mono" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-[#9ca3af] mt-1">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-[10px] font-semibold ${trend >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% vs año anterior
        </div>
      )}
    </motion.div>
  );
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-[#374151] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#6b7280]">{p.name}:</span>
          <span className="font-mono font-bold text-[#111827]">{formatM(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PnlRow({
  label, value, indent = false, bold = false, border = false, positive,
}: {
  label: string; value: number; indent?: boolean; bold?: boolean; border?: boolean; positive?: boolean;
}) {
  const color = positive === undefined
    ? "#111827"
    : value >= 0 ? "#16a34a" : "#dc2626";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between py-2.5 ${border ? "border-t-2 border-[#e5e7eb] mt-1" : "border-t border-[#f3f4f6]"} ${indent ? "pl-5" : ""}`}
    >
      <span className={`text-sm ${bold ? "font-black text-[#111827]" : "text-[#374151]"}`}>{label}</span>
      <span className={`text-sm font-mono ${bold ? "font-black" : "font-medium"}`} style={{ color }}>
        {value < 0 ? `(${formatCLP(Math.abs(value))})` : formatCLP(value)}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>("12m");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const chartData = period === "6m" ? REVENUE_DATA.slice(6) : REVENUE_DATA;

  const margenBruto = ((PNL_DERIVED.utilidadBruta / PNL.ingresos) * 100).toFixed(1);
  const margenNeto  = ((UTILIDAD_NETA / PNL.ingresos) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#111827] uppercase tracking-wide">Analytics</h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Datos simulados — conectar con <code className="bg-[#f3f4f6] px-1 rounded">trpc.admin.analytics</code> para datos reales
          </p>
        </div>
        <div className="flex gap-1">
          {(["6m", "12m"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${period === p ? "bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20" : "bg-[#f3f4f6] text-[#6b7280] hover:text-[#374151]"}`}
            >
              {p === "6m" ? "6 meses" : "12 meses"}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ingresos totales"  value={formatM(TOTAL_VENTAS)}              sub={`${TOTAL_ORDENES} órdenes`}       trend={23}  color="#16a34a"  delay={0}    />
        <KpiCard label="Utilidad bruta"    value={formatM(PNL_DERIVED.utilidadBruta)} sub={`Margen ${margenBruto}%`}         trend={8}   color="#2563eb"  delay={0.06} />
        <KpiCard label="Utilidad neta"     value={formatM(UTILIDAD_NETA)}             sub={`Margen neto ${margenNeto}%`}     trend={11}  color="#7c3aed"  delay={0.12} />
        <KpiCard label="AOV promedio"      value={formatM(Math.round(TOTAL_VENTAS / TOTAL_ORDENES))} sub="por orden"         trend={5}   color="#d97706"  delay={0.18} />
      </div>

      {/* Revenue area chart */}
      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="bg-white border border-[#e5e7eb] rounded-xl p-6"
        >
          <h2 className="text-xs font-black text-[#374151] uppercase tracking-wider mb-5">
            Ventas vs. costo — {period === "6m" ? "últimos 6 meses" : "año completo"}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCosto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => formatM(v)} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={64} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ventas" name="Ventas"       stroke="#16a34a" strokeWidth={2} fill="url(#gradVentas)" dot={false} animationDuration={1200} />
              <Area type="monotone" dataKey="costo"  name="Costo ventas" stroke="#dc2626" strokeWidth={2} fill="url(#gradCosto)"  dot={false} animationDuration={1400} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Orders bar + category pie */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="bg-white border border-[#e5e7eb] rounded-xl p-6"
          >
            <h2 className="text-xs font-black text-[#374151] uppercase tracking-wider mb-5">Órdenes por mes</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ordenes" name="Órdenes" fill="#2563eb" radius={[3, 3, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.5 }}
            className="bg-white border border-[#e5e7eb] rounded-xl p-6"
          >
            <h2 className="text-xs font-black text-[#374151] uppercase tracking-wider mb-5">Mix de ventas por categoría</h2>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {CATEGORY_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {CATEGORY_DATA.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-[11px] text-[#374151] flex-1 truncate">{c.name}</span>
                    <span className="text-[11px] font-mono font-bold text-[#111827]">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top products */}
      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.5 }}
          className="bg-white border border-[#e5e7eb] rounded-xl p-6"
        >
          <h2 className="text-xs font-black text-[#374151] uppercase tracking-wider mb-5">Top productos por revenue</h2>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((p, i) => {
              const pct = (p.revenue / TOP_PRODUCTS[0]!.revenue) * 100;
              return (
                <div key={p.name} className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-[#d1d5db] w-4 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#374151] truncate">{p.name}</span>
                      <span className="text-xs font-mono font-bold text-[#111827] ml-2 flex-shrink-0">{formatM(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.04, duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-[#16a34a]"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#9ca3af] flex-shrink-0 w-20 text-right">{p.units} uds · {p.brand}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}
