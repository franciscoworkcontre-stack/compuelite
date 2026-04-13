"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, AlertTriangle, XCircle, CheckCircle2, Package,
  ChevronDown, ChevronUp, History, Pencil, Check, X, ArrowLeftRight,
} from "lucide-react";
import { AdminBomSubstitutes } from "./AdminBomSubstitutes";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type FilterKey = "all" | "low" | "out" | "ok";
type ProductTypeFilter = "all" | "STANDALONE" | "COMPONENT" | "PREBUILT" | "PERIPHERAL" | "ACCESSORY";

type StockProduct = {
  id: string; name: string; sku: string; brand: string;
  stock: number; lowStockThreshold: number;
  productType: string; status: string;
  category: { name: string } | null;
  images: { url: string }[];
};

type Movement = {
  id: string; type: string; quantity: number;
  previousStock: number; newStock: number;
  reference: string | null; createdAt: string | Date;
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function stockStatus(stock: number, threshold: number): "out" | "low" | "ok" {
  if (stock === 0) return "out";
  if (stock <= threshold) return "low";
  return "ok";
}

const STATUS_CONFIG = {
  out: { label: "Sin stock",   bg: "bg-[#fef2f2]", text: "text-[#dc2626]", border: "border-[#fecaca]", dot: "bg-[#dc2626]" },
  low: { label: "Stock bajo",  bg: "bg-[#fffbeb]", text: "text-[#d97706]", border: "border-[#fde68a]", dot: "bg-[#f59e0b]" },
  ok:  { label: "OK",          bg: "bg-[#f0fdf4]", text: "text-[#16a34a]", border: "border-[#86efac]", dot: "bg-[#16a34a]" },
};

const TYPE_LABELS: Record<string, string> = {
  STANDALONE: "Standalone", COMPONENT: "Componente", PREBUILT: "PC Armado",
  PERIPHERAL: "Periférico", ACCESSORY: "Accesorio",
};

const MOVEMENT_LABELS: Record<string, string> = {
  PURCHASE: "Compra", SALE: "Venta", ADJUSTMENT: "Ajuste",
  RETURN: "Devolución", CSV_IMPORT: "CSV", TRANSFER: "Traslado",
  RESERVED: "Reservado", RELEASED: "Liberado",
};

// ─── INLINE STOCK EDITOR ─────────────────────────────────────────────────────

function InlineStockEdit({ product, onDone }: { product: StockProduct; onDone: () => void }) {
  const [value, setValue] = useState(String(product.stock));
  const updateStock = trpc.admin.updateStock.useMutation({ onSuccess: onDone });

  function save() {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0) return;
    updateStock.mutate({ productId: product.id, stock: n });
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number" min="0" value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") onDone(); }}
        autoFocus
        className="w-20 px-2 py-1 text-xs bg-white border border-[#2563eb]/40 rounded-lg focus:outline-none text-[#111827] text-center"
      />
      <button onClick={save} disabled={updateStock.isPending}
        className="p-1 text-[#16a34a] hover:bg-[#f0fdf4] rounded transition-colors">
        <Check className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDone} className="p-1 text-[#9ca3af] hover:bg-[#f3f4f6] rounded transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── STOCK HISTORY PANEL ─────────────────────────────────────────────────────

function StockHistoryPanel({ productId, onClose }: { productId: string; onClose: () => void }) {
  const { data = [], isLoading } = trpc.admin.stockHistory.useQuery({ productId });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="border-t border-[#f3f4f6] bg-[#fafafa] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">Historial de movimientos</p>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#4b5563]">
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-4 h-4 border border-[#9ca3af] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-[11px] text-[#9ca3af] text-center py-3">Sin movimientos registrados</p>
        ) : (
          <div className="space-y-1">
            {data.map(m => {
              const delta = m.quantity;
              const isPos = delta > 0;
              return (
                <div key={m.id} className="flex items-center gap-3 py-1.5 text-[11px]">
                  <span className="w-20 text-[#9ca3af] flex-shrink-0">
                    {new Date(m.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="w-20 text-[#374151] font-medium flex-shrink-0">
                    {MOVEMENT_LABELS[m.type] ?? m.type}
                  </span>
                  <span className={`w-14 font-black flex-shrink-0 ${isPos ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                    {isPos ? "+" : ""}{delta}
                  </span>
                  <span className="text-[#6b7280] flex-shrink-0">
                    {m.previousStock} → {m.newStock}
                  </span>
                  {m.reference && (
                    <span className="text-[#9ca3af] truncate">{m.reference}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── PRODUCT ROW ─────────────────────────────────────────────────────────────

function ProductRow({ product, refetch }: { product: StockProduct; refetch: () => void }) {
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const st = stockStatus(product.stock, product.lowStockThreshold);
  const cfg = STATUS_CONFIG[st];

  return (
    <div className={`border rounded-xl overflow-hidden transition-shadow ${st !== "ok" ? cfg.border : "border-[#e5e7eb]"}`}>
      <div className="flex items-center gap-4 px-4 py-3 bg-white">
        {/* Thumbnail */}
        <div className="w-9 h-9 flex-shrink-0 rounded-lg overflow-hidden bg-[#f3f4f6] flex items-center justify-center">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0].url} alt="" className="w-full h-full object-contain" />
          ) : (
            <Package className="w-4 h-4 text-[#d1d5db]" />
          )}
        </div>

        {/* Name / SKU */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-[#111827] truncate">{product.name}</p>
          <p className="text-[10px] text-[#9ca3af]">
            {product.sku} · {product.brand} · {product.category?.name ?? "—"}
          </p>
        </div>

        {/* Type badge */}
        <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-[#9ca3af] bg-[#f3f4f6] px-2 py-0.5 rounded-full flex-shrink-0">
          {TYPE_LABELS[product.productType] ?? product.productType}
        </span>

        {/* Threshold */}
        <div className="hidden md:block text-center flex-shrink-0 w-16">
          <p className="text-[10px] text-[#9ca3af]">Mínimo</p>
          <p className="text-[11px] font-bold text-[#374151]">{product.lowStockThreshold}</p>
        </div>

        {/* Stock — editable */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-[110px] justify-end">
          {editing ? (
            <InlineStockEdit product={product} onDone={() => { setEditing(false); refetch(); }} />
          ) : (
            <>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className={`text-sm font-black ${cfg.text}`}>{product.stock}</span>
                </div>
                <p className={`text-[9px] font-bold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 text-[#9ca3af] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-colors flex-shrink-0"
                title="Editar stock"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Substitutes toggle — only for PREBUILT */}
        {product.productType === "PREBUILT" && (
          <button
            onClick={() => { setShowSubstitutes(v => !v); setShowHistory(false); }}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${showSubstitutes ? "text-[#7c3aed] bg-[#f5f3ff]" : "text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6]"}`}
            title="Gestionar sustitutos"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* History toggle */}
        <button
          onClick={() => { setShowHistory(v => !v); setShowSubstitutes(false); }}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${showHistory ? "text-[#2563eb] bg-[#eff6ff]" : "text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6]"}`}
          title="Ver historial"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {showHistory && (
          <StockHistoryPanel productId={product.id} onClose={() => setShowHistory(false)} />
        )}
        {showSubstitutes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#f3f4f6] bg-[#fafafa] px-4 py-4">
              <AdminBomSubstitutes productId={product.id} productName={product.name} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function AdminStock() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [typeFilter, setTypeFilter] = useState<ProductTypeFilter>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((handleSearch as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleSearch as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => setDebouncedSearch(v), 300);
  };

  const { data, isLoading, refetch } = trpc.admin.stockControl.useQuery({
    search: debouncedSearch || undefined,
    filter,
    productType: typeFilter,
    limit: 60,
  });

  const items = data?.items ?? [];
  const summary = data?.summary;

  const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "all", label: "Todos",      icon: <Package className="w-3.5 h-3.5" />,       count: summary?.total },
    { key: "out", label: "Sin stock",  icon: <XCircle className="w-3.5 h-3.5" />,        count: summary?.out },
    { key: "low", label: "Stock bajo", icon: <AlertTriangle className="w-3.5 h-3.5" />,  count: summary?.low },
    { key: "ok",  label: "OK",         icon: <CheckCircle2 className="w-3.5 h-3.5" />,  count: summary?.ok },
  ];

  const FILTER_COLORS: Record<FilterKey, string> = {
    all: "text-[#2563eb] border-[#2563eb]/20 bg-[#eff6ff]",
    out: "text-[#dc2626] border-[#fecaca] bg-[#fef2f2]",
    low: "text-[#d97706] border-[#fde68a] bg-[#fffbeb]",
    ok:  "text-[#16a34a] border-[#86efac] bg-[#f0fdf4]",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black text-[#111827] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}>
          Control de Stock
        </h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">Revisa y ajusta el inventario de todos los productos</p>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-4 gap-3">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                filter === f.key ? FILTER_COLORS[f.key] + " border" : "bg-white border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db]"
              }`}>
              {f.icon}
              <span className="text-lg font-black">{f.count ?? "—"}</span>
              <span className="text-[9px] uppercase tracking-widest font-bold">{f.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg">
          <Search className="w-3.5 h-3.5 text-[#9ca3af] flex-shrink-0" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o marca…"
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none"
          />
          {search && (
            <button onClick={() => { setSearch(""); setDebouncedSearch(""); }}>
              <X className="w-3.5 h-3.5 text-[#9ca3af]" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as ProductTypeFilter)}
          className="px-3 py-2 text-xs bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-[#374151] focus:outline-none"
        >
          <option value="all">Todos los tipos</option>
          <option value="STANDALONE">Standalone</option>
          <option value="COMPONENT">Componente</option>
          <option value="PREBUILT">PC Armado</option>
          <option value="PERIPHERAL">Periférico</option>
          <option value="ACCESSORY">Accesorio</option>
        </select>
      </div>

      {/* Product list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#f3f4f6] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-[#9ca3af]">
          <Package className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No se encontraron productos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[1fr_80px_110px_40px] gap-4 px-4 pb-1">
            <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest font-bold">Producto</p>
            <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest font-bold text-center">Mínimo</p>
            <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest font-bold text-right">Stock actual</p>
            <div />
          </div>

          <AnimatePresence mode="popLayout">
            {items.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: i * 0.02 }}
              >
                <ProductRow product={product} refetch={refetch} />
              </motion.div>
            ))}
          </AnimatePresence>

          {data?.nextCursor && (
            <p className="text-center text-[11px] text-[#9ca3af] pt-2">
              Mostrando {items.length} productos · hay más — refina la búsqueda para verlos
            </p>
          )}
        </div>
      )}
    </div>
  );
}
