"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, FileText, AlertTriangle, Info,
  Calendar, ChevronDown, ChevronUp, TrendingUp,
} from "lucide-react";

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
// P&L — datos simulados, estructura real
// Reemplazar con datos reales de trpc.admin.financials cuando estén disponibles
// ─────────────────────────────────────────────────────────────────────────────

const REVENUE_DATA = [
  { mes: "Ene", ventas: 18_400_000, costo: 11_040_000 },
  { mes: "Feb", ventas: 21_200_000, costo: 12_720_000 },
  { mes: "Mar", ventas: 19_800_000, costo: 11_880_000 },
  { mes: "Abr", ventas: 24_600_000, costo: 14_760_000 },
  { mes: "May", ventas: 22_100_000, costo: 13_260_000 },
  { mes: "Jun", ventas: 28_400_000, costo: 17_040_000 },
  { mes: "Jul", ventas: 31_800_000, costo: 19_080_000 },
  { mes: "Ago", ventas: 29_200_000, costo: 17_520_000 },
  { mes: "Sep", ventas: 33_600_000, costo: 20_160_000 },
  { mes: "Oct", ventas: 38_200_000, costo: 22_920_000 },
  { mes: "Nov", ventas: 52_400_000, costo: 31_440_000 },
  { mes: "Dic", ventas: 47_800_000, costo: 28_680_000 },
];

const TOTAL_VENTAS = REVENUE_DATA.reduce((s, d) => s + d.ventas, 0);
const TOTAL_COSTO  = REVENUE_DATA.reduce((s, d) => s + d.costo,  0);

const PNL = {
  ingresos:            TOTAL_VENTAS,
  costoVentas:         TOTAL_COSTO,
  gastosOperacionales: 24_800_000,
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
// Régimen General 14A:  27% — ingresos > UF 75.000/año    [LIR art. 14A + MOD]
// Régimen Pro PyME 14D: 25% — ingresos ≤ UF 75.000/año   [LIR art. 14D + MOD]
// IVA: 19% tasa vigente sobre valor neto de ventas         [IVA art. 14]
// PPM: pago provisional mensual ≈ 2-4% ingresos brutos    [LIR art. 84]
// ─────────────────────────────────────────────────────────────────────────────

// UF aproximada 2025 — actualizar mensualmente desde www.sii.cl/valores/uf/
const UF_HOY = 38_100;
const UF_LIMITE_PYME = 75_000;
const LIMITE_PYME_CLP = UF_LIMITE_PYME * UF_HOY;

const esPyme = PNL.ingresos < LIMITE_PYME_CLP;
const TASA_PRIMERA_CATEGORIA = esPyme ? 0.25 : 0.27;

const TASA_IVA = 0.19;
const IVA_DEBITO  = Math.round((PNL.ingresos / 1.19) * TASA_IVA);
const IVA_CREDITO = Math.round((PNL.costoVentas / 1.19) * TASA_IVA * 0.7);
const IVA_NETO_ANUAL = IVA_DEBITO - IVA_CREDITO;

const IMPUESTO_PRIMERA_CATEGORIA = Math.max(
  0,
  Math.round(PNL_DERIVED.utilidadAnteImpuesto * TASA_PRIMERA_CATEGORIA),
);

const TASA_PPM = 0.025;
const PPM_ANUAL = Math.round(PNL.ingresos * TASA_PPM);

const UTILIDAD_NETA = PNL_DERIVED.utilidadAnteImpuesto - IMPUESTO_PRIMERA_CATEGORIA;

// ─────────────────────────────────────────────────────────────────────────────
// OBLIGACIONES — Calendario [SII]
// ─────────────────────────────────────────────────────────────────────────────

const OBLIGACIONES = [
  {
    nombre: "F29 — IVA + PPM mensual",
    descripcion: "Declaración del IVA neto (débito fiscal − crédito fiscal) más el Pago Provisional Mensual (PPM). Se presenta aunque el resultado sea cero. Grandes Empresas: día 12; resto: día 20.",
    frecuencia: "Mensual",
    vencimiento: "Día 20 del mes siguiente (GE: día 12)",
    formulario: "F29",
    color: "#2563eb",
    ley: "Art. 64 DL 825 (IVA) · Art. 84 LIR (PPM)",
    monto: Math.round(IVA_NETO_ANUAL / 12),
    urgente: false,
  },
  {
    nombre: "F22 — Declaración Anual de Renta",
    descripcion: "Impuesto de Primera Categoría sobre la utilidad del ejercicio anterior. Se descuenta el PPM pagado durante el año. Si el PPM supera el impuesto, el SII devuelve la diferencia.",
    frecuencia: "Anual",
    vencimiento: "Abril — fecha exacta en www.sii.cl cada año",
    formulario: "F22",
    color: "#1d4ed8",
    ley: `Art. 20 LIR · Régimen ${esPyme ? "14D Pro PyME (25%)" : "14A General (27%)"}`,
    monto: IMPUESTO_PRIMERA_CATEGORIA,
    urgente: true,
  },
  {
    nombre: "F50 — Retenciones laborales",
    descripcion: "Retención del Impuesto Único de Segunda Categoría (trabajadores dependientes) y cotizaciones previsionales. Solo aplica si hay trabajadores con contrato.",
    frecuencia: "Mensual",
    vencimiento: "Día 10 del mes siguiente",
    formulario: "F50",
    color: "#3b82f6",
    ley: "Art. 74 N°1 LIR — Retención trabajadores dependientes",
    monto: null,
    urgente: false,
  },
  {
    nombre: "Patente Municipal",
    descripcion: "Derecho por ejercicio de actividades comerciales. Base: capital propio tributario (entre 0,25‰ y 5‰ según municipio). Se paga en 2 cuotas iguales.",
    frecuencia: "Semestral",
    vencimiento: "Cuota 1: Enero · Cuota 2: Julio",
    formulario: "Municipalidad correspondiente",
    color: "#64748b",
    ley: "Ley 3.063 Rentas Municipales · art. 23 y ss.",
    monto: Math.round(UTILIDAD_NETA * 0.005),
    urgente: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipPayload { value: number; name: string; color: string; }

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
  const color = positive === undefined ? "#111827" : value >= 0 ? "#16a34a" : "#dc2626";
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

export function AdminFinanzas() {
  const [activeObl, setActiveObl] = useState<number | null>(null);

  const margenBruto = ((PNL_DERIVED.utilidadBruta / PNL.ingresos) * 100).toFixed(1);
  const margenNeto  = ((UTILIDAD_NETA / PNL.ingresos) * 100).toFixed(1);


  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-[#111827] uppercase tracking-wide">Finanzas</h1>
        <p className="text-xs text-[#9ca3af] mt-1">
          P&amp;L · impuestos · obligaciones tributarias Chile ·{" "}
          <span className="italic">datos simulados — conectar con contabilidad real</span>
        </p>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos anuales",  value: formatM(PNL.ingresos),                sub: "Año 2024 (sim.)",       color: "#2563eb" },
          { label: "Utilidad bruta",    value: formatM(PNL_DERIVED.utilidadBruta),   sub: `Margen ${margenBruto}%`, color: "#1d4ed8" },
          { label: "Utilidad neta",     value: formatM(UTILIDAD_NETA),               sub: `Margen ${margenNeto}%`,  color: "#1e40af" },
          { label: "Carga tributaria",  value: `${(((IVA_NETO_ANUAL + IMPUESTO_PRIMERA_CATEGORIA) / PNL.ingresos) * 100).toFixed(1)}%`, sub: "IVA + 1ª Categoría", color: "#64748b" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-[#e5e7eb] rounded-xl p-5"
          >
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-2">{k.label}</p>
            <p className="text-2xl font-black font-mono" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[10px] text-[#9ca3af] mt-1">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── P&L ──────────────────────────────────────────────────────────────── */}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f3f4f6]">
          <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#2563eb]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#111827] uppercase tracking-wide">Estado de Resultados (P&amp;L)</h2>
            <p className="text-[10px] text-[#9ca3af]">Año calendario 2024 · Datos simulados</p>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Tabla P&L */}
            <div>
              <PnlRow label="(+) Ingresos por ventas"          value={PNL.ingresos}                         bold />
              <PnlRow label="(−) Costo de ventas"              value={-PNL.costoVentas}                     indent />
              <PnlRow label="Utilidad Bruta"                    value={PNL_DERIVED.utilidadBruta}            bold border positive />
              <PnlRow label="(−) Gastos operacionales"         value={-PNL.gastosOperacionales}              indent />
              <PnlRow label="(−) Gastos de marketing"          value={-PNL.gastosMarketing}                  indent />
              <PnlRow label="(−) Depreciación"                 value={-PNL.depreciacion}                     indent />
              <PnlRow label="Utilidad Operacional (EBIT)"      value={PNL_DERIVED.utilidadOperacional}      bold border positive />
              <PnlRow label="(−) Gastos financieros"           value={-PNL.gastosFinancieros}                indent />
              <PnlRow label="Utilidad antes de impuesto (EBT)" value={PNL_DERIVED.utilidadAnteImpuesto}     bold border positive />
              <PnlRow label="(−) Impuesto Primera Categoría"   value={-IMPUESTO_PRIMERA_CATEGORIA}           indent />
              <PnlRow label="UTILIDAD NETA"                    value={UTILIDAD_NETA}                        bold border positive />
            </div>

            {/* Gráfico composición + barras mensuales */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-3">Composición del ingreso</p>
                {(() => {
                  const total = PNL.ingresos;
                  const gastosTotales = PNL.gastosOperacionales + PNL.gastosMarketing + PNL.depreciacion + PNL.gastosFinancieros;
                  const segments = [
                    { label: "Costo ventas",  value: PNL.costoVentas,            color: "#93c5fd" },
                    { label: "Gastos",        value: gastosTotales,              color: "#3b82f6" },
                    { label: "Impuesto",      value: IMPUESTO_PRIMERA_CATEGORIA, color: "#1d4ed8" },
                    { label: "Utilidad neta", value: UTILIDAD_NETA,              color: "#1e40af" },
                  ];
                  return (
                    <div className="space-y-4">
                      <div className="flex h-9 rounded-xl overflow-hidden gap-px">
                        {segments.map((s) => (
                          <motion.div
                            key={s.label}
                            initial={{ flex: 0 }}
                            animate={{ flex: s.value / total }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className="h-full"
                            style={{ backgroundColor: s.color }}
                          />
                        ))}
                      </div>
                      <div className="space-y-2">
                        {segments.map((s) => (
                          <div key={s.label} className="flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                            <span className="text-[11px] text-[#6b7280] flex-1">{s.label}</span>
                            <span className="text-[11px] font-mono font-bold text-[#374151]">{formatM(s.value)}</span>
                            <span className="text-[11px] text-[#9ca3af] w-10 text-right">{((s.value / total) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Margen mensual */}
              <div>
                <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-3">Utilidad bruta mensual</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={REVENUE_DATA.map(d => ({ mes: d.mes, utilidad: d.ventas - d.costo }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="mes" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v: number) => formatM(v)} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="utilidad" name="Utilidad bruta" fill="#2563eb" radius={[2, 2, 0, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── IMPUESTOS CHILE ──────────────────────────────────────────────────── */}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f3f4f6]">
          <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#475569]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#111827] uppercase tracking-wide">Obligaciones Tributarias — Chile</h2>
            <p className="text-[10px] text-[#9ca3af]">
              {esPyme ? "Régimen Pro PyME 14D — 25%" : "Régimen General 14A — 27%"}
              {" · "}DL 824 LIR · DL 825 IVA · Ley 21.210 · SII.cl
            </p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">

          {/* KPIs impuestos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "IVA neto anual",      value: formatCLP(IVA_NETO_ANUAL),                sub: "19% débito − crédito",            color: "#2563eb", note: "DL 825 art. 14" },
              { label: "PPM anual estimado",  value: formatCLP(PPM_ANUAL),                     sub: "~2,5% ingresos · abona F22",      color: "#1d4ed8", note: "LIR art. 84"    },
              { label: "Primera Categoría",   value: formatCLP(IMPUESTO_PRIMERA_CATEGORIA),    sub: `${(TASA_PRIMERA_CATEGORIA * 100).toFixed(0)}% utilidad · F22 abril`, color: "#1e40af", note: "LIR art. 20" },
              { label: "IVA promedio mensual",value: formatCLP(Math.round(IVA_NETO_ANUAL / 12)), sub: "a pagar en F29 mensual",         color: "#64748b", note: "F29 día 20"     },
            ].map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="bg-[#f9fafb] border border-[#f3f4f6] rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider leading-tight">{k.label}</p>
                  <span className="text-[8px] bg-[#e5e7eb] text-[#9ca3af] px-1 rounded font-mono">{k.note}</span>
                </div>
                <p className="text-base font-black font-mono" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[10px] text-[#9ca3af] mt-1">{k.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Aviso régimen */}
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-[#2563eb] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#1e3a8a] space-y-1.5">
              <p className="font-bold">
                {esPyme ? "Régimen Pro PyME — art. 14D LIR" : "Régimen General — art. 14A LIR"}
              </p>
              <p>
                {esPyme
                  ? `Ingresos ${formatCLP(PNL.ingresos)} — bajo el límite de UF ${UF_LIMITE_PYME.toLocaleString("es-CL")} (≈ ${formatCLP(LIMITE_PYME_CLP)}). Tasa reducida 25%.`
                  : `Ingresos ${formatCLP(PNL.ingresos)} — sobre UF ${UF_LIMITE_PYME.toLocaleString("es-CL")} (≈ ${formatCLP(LIMITE_PYME_CLP)}). Tasa general 27%.`}
                {" "}El PPM ({formatCLP(PPM_ANUAL)} estimado anual) se abona a cuenta del impuesto del F22 de abril.
              </p>
              <p className="text-[10px] text-[#1d4ed8]">
                Fuente: art. 14 letra {esPyme ? "D" : "A"} DL 824 LIR · Ley 21.210 (2020) ·
                UF usada: ${UF_HOY.toLocaleString("es-CL")} — actualizar en{" "}
                <strong>www.sii.cl/valores/uf/</strong>
              </p>
            </div>
          </div>

          {/* Calendario obligaciones */}
          <div>
            <p className="text-[10px] font-black text-[#9ca3af] uppercase tracking-wider mb-3">Cuándo y cuánto pagar</p>
            <div className="space-y-2">
              {OBLIGACIONES.map((obl, i) => (
                <motion.div
                  key={obl.nombre}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  className="border border-[#e5e7eb] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveObl(activeObl === i ? null : i)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#f9fafb] transition-colors text-left"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: obl.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#111827]">{obl.nombre}</p>
                        <span className="text-[9px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded font-mono">
                          {obl.frecuencia}
                        </span>
                        {obl.urgente && (
                          <span className="text-[9px] bg-[#fef2f2] text-[#dc2626] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Declarar en abril
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#9ca3af] mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {obl.vencimiento}
                      </p>
                    </div>
                    {obl.monto !== null && (
                      <p className="text-sm font-mono font-black flex-shrink-0" style={{ color: obl.color }}>
                        {formatCLP(obl.monto)}
                        {obl.frecuencia === "Mensual" && (
                          <span className="text-[10px] text-[#9ca3af] font-normal">/mes</span>
                        )}
                      </p>
                    )}
                    {activeObl === i
                      ? <ChevronUp className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />}
                  </button>

                  <AnimatePresence>
                    {activeObl === i && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-[#f3f4f6]">
                          <p className="text-xs text-[#374151]">{obl.descripcion}</p>
                          <p className="text-[10px] text-[#9ca3af] font-mono">📋 Formulario: <strong>{obl.formulario}</strong></p>
                          <p className="text-[10px] text-[#9ca3af]">⚖️ Base legal: {obl.ley}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-[#9ca3af] flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#9ca3af] leading-relaxed">
              <strong className="text-[#6b7280]">Nota legal:</strong> Montos estimados sobre datos simulados.
              Las obligaciones reales dependen de la estructura societaria, gastos deducibles verificados y resoluciones del SII.
              Consultar con contador certificado antes de tomar decisiones tributarias.
              <strong> DL 824 (LIR) · DL 825 (IVA) · Ley 21.210 · www.sii.cl</strong>
            </p>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
