"use client";

import { trpc } from "@/lib/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";

type Props = {
  productId: string;
  /** "full" = detalle producto (grande), "compact" = carrito/checkout (chico) */
  variant?: "full" | "compact";
};

export function PrebuiltSubstituteWarning({ productId, variant = "full" }: Props) {
  const { data: subs = [], isLoading } = trpc.products.previewBom.useQuery(
    { productId },
    { staleTime: 60_000 }
  );

  if (isLoading || subs.length === 0) return null;

  if (variant === "compact") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-[#fde68a] bg-[#1a1500] px-3 py-2 space-y-1.5"
        >
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24] flex-shrink-0" />
            <p className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-wider">
              Componente{subs.length > 1 ? "s" : ""} reemplazado{subs.length > 1 ? "s" : ""}
            </p>
          </div>
          {subs.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] pl-5">
              <span className="text-[#888] line-through truncate">{s.original.name}</span>
              <ArrowRight className="w-3 h-3 text-[#555] flex-shrink-0" />
              <span className="text-[#fbbf24] font-bold truncate">
                {s.substitute ? s.substitute.name : "Sin sustituto disponible"}
              </span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Full variant — product detail page
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="rounded-xl border border-[#fde68a]/60 bg-[#1a1500] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#fde68a]/20">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 rounded-full bg-[#fbbf24]/15 border border-[#fbbf24]/30 flex items-center justify-center flex-shrink-0"
          >
            <AlertTriangle className="w-4 h-4 text-[#fbbf24]" />
          </motion.div>
          <div>
            <p className="text-sm font-black text-[#fbbf24] uppercase tracking-wider">
              Aviso de configuración
            </p>
            <p className="text-[11px] text-[#a16207] mt-0.5">
              {subs.length === 1
                ? "Un componente de este PC será reemplazado por una alternativa equivalente"
                : `${subs.length} componentes serán reemplazados por alternativas equivalentes`}
            </p>
          </div>
        </div>

        {/* Substitution rows */}
        <div className="px-5 py-4 space-y-3">
          {subs.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="space-y-1.5"
            >
              {s.slotName && (
                <p className="text-[9px] font-black text-[#555] uppercase tracking-widest">
                  {s.slotName.replace(/_\d+$/, "").replace(/_/g, " ")}
                </p>
              )}
              <div className="flex items-center gap-3">
                {/* Original (out of stock) */}
                <div className="flex-1 min-w-0 bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2">
                  <p className="text-[11px] font-bold text-[#555] line-through truncate">{s.original.name}</p>
                  <p className="text-[10px] text-[#333]">{s.original.brand} · {s.original.sku}</p>
                  <p className="text-[9px] text-[#ff4444] font-bold mt-0.5 uppercase tracking-wide">Sin stock</p>
                </div>

                <ArrowRight className="w-5 h-5 text-[#fbbf24] flex-shrink-0" />

                {/* Substitute */}
                {s.substitute ? (
                  <div className="flex-1 min-w-0 bg-[#fbbf24]/8 border border-[#fbbf24]/30 rounded-lg px-3 py-2">
                    <p className="text-[11px] font-bold text-[#fbbf24] truncate">{s.substitute.name}</p>
                    <p className="text-[10px] text-[#a16207]">{s.substitute.brand} · {s.substitute.sku}</p>
                    {s.substitute.notes && (
                      <p className="text-[9px] text-[#78350f] italic mt-0.5">{s.substitute.notes}</p>
                    )}
                    <p className="text-[9px] text-[#4ade80] font-bold mt-0.5 uppercase tracking-wide">Disponible</p>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0 bg-[#1a0000] border border-[#ff4444]/30 rounded-lg px-3 py-2">
                    <p className="text-[11px] font-bold text-[#ff4444]">Sin alternativa disponible</p>
                    <p className="text-[10px] text-[#7f1d1d]">Contáctanos para más información</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 bg-[#111] border-t border-[#1a1a1a]">
          <p className="text-[10px] text-[#555]">
            Las especificaciones son equivalentes. El precio del producto no cambia.
            Si tienes dudas, escríbenos antes de comprar.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
