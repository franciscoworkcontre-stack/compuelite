"use client";

import { useBuilderStore, BUILD_STEPS } from "@/stores/builderStore";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_CONFIG = {
  idle:     { icon: "○", label: "Elige tus componentes", color: "#555" },
  checking: { icon: "⟳", label: "Verificando compatibilidad…", color: "#ffb800" },
  ok:       { icon: "✓", label: "Compatible", color: "#00ff66" },
  warning:  { icon: "⚠", label: "Revisa advertencias", color: "#ffb800" },
  error:    { icon: "✕", label: "Incompatibilidades detectadas", color: "#ff3333" },
};

export function BuilderBottomBar() {
  const {
    totalPrice,
    components,
    compatibilityStatus,
    compatibilityMessages,
  } = useBuilderStore();

  const filled = Object.keys(components).length;
  const required = BUILD_STEPS.filter((s) => s !== "EXTRAS").length; // 8
  const allRequired = BUILD_STEPS
    .filter((s) => s !== "EXTRAS" && s !== "CPU_COOLER")
    .every((s) => components[s]);

  const status = STATUS_CONFIG[compatibilityStatus];

  return (
    <div className="h-14 border-t border-[#1a1a1a] bg-[#0a0a0a] flex items-center px-4 gap-4">
      {/* Compatibility status */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-sm font-mono leading-none"
          style={{ color: status.color }}
        >
          {status.icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium" style={{ color: status.color }}>
            {status.label}
          </p>
          {compatibilityMessages.length > 0 && (
            <p className="text-xs text-[#555] truncate max-w-[240px]">
              {compatibilityMessages[0]}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#1a1a1a] flex-shrink-0" />

      {/* Components progress */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {Array.from({ length: required }).map((_, i) => {
          const step = BUILD_STEPS.filter((s) => s !== "EXTRAS")[i];
          const done = Boolean(components[step]);
          return (
            <div
              key={i}
              className={`w-1.5 h-4 rounded-sm transition-all ${
                done ? "bg-[#00ff66]" : "bg-[#222]"
              }`}
            />
          );
        })}
        <span className="text-xs font-mono text-[#555] ml-1">
          {filled}/{required}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Total price */}
      {totalPrice > 0 && (
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-[#555] uppercase tracking-wider leading-none mb-0.5">
            Total
          </p>
          <p
            className="text-lg font-black font-mono text-[#00ff66] leading-none"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 16px rgba(0,255,102,0.35)",
            }}
          >
            {formatCLP(totalPrice)}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={!allRequired}
        className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          fontFamily: "var(--font-display)",
          background: allRequired
            ? "linear-gradient(135deg, #00ff66, #00cc52)"
            : "#1a1a1a",
          color: allRequired ? "#000" : "#555",
          boxShadow: allRequired ? "0 0 20px rgba(0,255,102,0.3)" : "none",
        }}
        onClick={() => {
          // TODO: wire cart / checkout
        }}
      >
        Agregar al Carrito
      </button>
    </div>
  );
}
