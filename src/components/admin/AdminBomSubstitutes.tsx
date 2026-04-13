"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, X, ChevronUp, ChevronDown, Search, Package,
  AlertTriangle, CheckCircle2, ArrowLeftRight,
} from "lucide-react";

function formatCLP(n: number | { toNumber?: () => number } | string) {
  const v = typeof n === "object" && n && "toNumber" in n && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v);
}

type SubProduct = {
  id: string; name: string; sku: string; brand: string; stock: number;
  images: { url: string }[];
};

type Substitute = {
  id: string; priority: number; notes: string | null;
  product: SubProduct;
};

type Slot = {
  id: string; slotName: string | null; componentId: string;
  component: SubProduct;
  substitutes: Substitute[];
};

// ─── SUBSTITUTE SEARCH PICKER ────────────────────────────────────────────────

function SubstitutePicker({
  bomItemId,
  existingIds,
  onAdded,
}: {
  bomItemId: string;
  existingIds: string[];
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: results = [], isFetching } = trpc.admin.searchComponents.useQuery(
    { componentType: "MOTHERBOARD" as never, query: debouncedQuery }, // overridden below
    { enabled: false } // we use the products.list endpoint instead
  );
  void results; void isFetching;

  // Use the general product search
  const { data: searchData, isFetching: searching } = trpc.admin.products.useQuery(
    { search: debouncedQuery || undefined, limit: 8 },
    { enabled: open && debouncedQuery.length > 1, staleTime: 10_000 }
  );
  const searchResults = (searchData?.items ?? []).filter(p => !existingIds.includes(p.id));

  const addSub = trpc.admin.addSubstitute.useMutation({
    onSuccess: () => { onAdded(); setOpen(false); setQuery(""); setNotes(""); },
  });

  function handleSearch(v: string) {
    setQuery(v);
    clearTimeout((handleSearch as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleSearch as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => setDebouncedQuery(v), 300);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-[#9ca3af] border border-dashed border-[#d1d5db] rounded-lg hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
      >
        <Plus className="w-3 h-3" /> Agregar sustituto
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="border border-[#2563eb]/20 bg-[#eff6ff] rounded-xl p-3 space-y-2"
    >
      <p className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider">Buscar sustituto</p>
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#e5e7eb] rounded-lg">
        <Search className="w-3.5 h-3.5 text-[#9ca3af]" />
        <input autoFocus value={query} onChange={e => handleSearch(e.target.value)}
          placeholder="Nombre, SKU o marca…"
          className="flex-1 text-[11px] text-[#111827] placeholder-[#9ca3af] bg-transparent focus:outline-none"
        />
        {searching && <div className="w-3 h-3 border border-[#9ca3af] border-t-transparent rounded-full animate-spin" />}
      </div>

      {searchResults.length > 0 && (
        <div className="max-h-44 overflow-y-auto space-y-1">
          {searchResults.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5">
              {p.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0].url} alt="" className="w-7 h-7 object-contain rounded flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 bg-[#f3f4f6] rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#111827] truncate">{p.name}</p>
                <p className="text-[10px] text-[#9ca3af]">{p.brand} · {p.sku} · Stock: {p.stock}</p>
              </div>
              <input value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Nota opcional…"
                className="w-32 text-[10px] px-2 py-1 border border-[#e5e7eb] rounded bg-white focus:outline-none text-[#374151]"
              />
              <button
                onClick={() => addSub.mutate({ bomItemId, productId: p.id, notes: notes || undefined })}
                disabled={addSub.isPending}
                className="px-2.5 py-1 text-[10px] font-bold bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {addSub.isPending ? "…" : "Agregar"}
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setOpen(false)} className="text-[10px] text-[#9ca3af] hover:text-[#4b5563]">
        Cancelar
      </button>
    </motion.div>
  );
}

// ─── SLOT ROW ────────────────────────────────────────────────────────────────

function SlotRow({ slot, refetch }: { slot: Slot; refetch: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const removeSub = trpc.admin.removeSubstitute.useMutation({ onSuccess: refetch });
  const reorder = trpc.admin.reorderSubstitutes.useMutation({ onSuccess: refetch });

  const primaryOk = slot.component.stock > 0;
  const anySubOk = slot.substitutes.some(s => s.product.stock > 0);
  const slotOk = primaryOk || anySubOk;

  function moveSubstitute(index: number, dir: -1 | 1) {
    const subs = [...slot.substitutes].sort((a, b) => a.priority - b.priority);
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= subs.length) return;
    [subs[index], subs[newIndex]] = [subs[newIndex], subs[index]];
    reorder.mutate({ bomItemId: slot.id, orderedIds: subs.map(s => s.id) });
  }

  return (
    <div className={`border rounded-xl overflow-hidden ${slotOk ? "border-[#e5e7eb]" : "border-[#fecaca]"}`}>
      {/* Slot header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#fafafa] transition-colors text-left"
      >
        {/* Primary component */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {slot.component.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slot.component.images[0].url} alt="" className="w-8 h-8 object-contain rounded flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 bg-[#f3f4f6] rounded flex-shrink-0 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#d1d5db]" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold text-[#111827] truncate">{slot.component.name}</p>
              <span className="text-[9px] text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded font-bold flex-shrink-0">PRINCIPAL</span>
            </div>
            <p className="text-[10px] text-[#9ca3af]">{slot.component.brand} · {slot.component.sku}</p>
          </div>
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
            primaryOk ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fef2f2] text-[#dc2626]"
          }`}>
            {primaryOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {slot.component.stock}
          </div>

          {slot.substitutes.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
              <ArrowLeftRight className="w-3 h-3" />
              {slot.substitutes.length} sub
            </div>
          )}

          {expanded ? <ChevronUp className="w-4 h-4 text-[#9ca3af]" /> : <ChevronDown className="w-4 h-4 text-[#9ca3af]" />}
        </div>
      </button>

      {/* Substitutes list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#f3f4f6] bg-[#fafafa] px-4 py-3 space-y-3">
              <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest font-bold">
                Sustitutos — en orden de prioridad
              </p>

              {slot.substitutes.length === 0 && (
                <p className="text-[11px] text-[#9ca3af]">Sin sustitutos definidos. Si {slot.component.name} llega a 0, el PC quedará sin stock.</p>
              )}

              {slot.substitutes
                .sort((a, b) => a.priority - b.priority)
                .map((sub, i) => (
                  <div key={sub.id} className="flex items-center gap-3 bg-white border border-[#e5e7eb] rounded-xl px-3 py-2.5">
                    <span className="text-[10px] font-black text-[#d1d5db] w-4 text-center">{i + 1}</span>

                    {sub.product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sub.product.images[0].url} alt="" className="w-8 h-8 object-contain rounded flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 bg-[#f3f4f6] rounded flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#111827] truncate">{sub.product.name}</p>
                      <p className="text-[10px] text-[#9ca3af]">
                        {sub.product.brand} · {sub.product.sku}
                        {sub.notes && <span className="ml-2 italic">{sub.notes}</span>}
                      </p>
                    </div>

                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 ${
                      sub.product.stock > 0 ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fef2f2] text-[#dc2626]"
                    }`}>
                      {sub.product.stock > 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {sub.product.stock}
                    </div>

                    {/* Reorder */}
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button onClick={() => moveSubstitute(i, -1)} disabled={i === 0}
                        className="p-0.5 text-[#9ca3af] hover:text-[#374151] disabled:opacity-20 transition-colors">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveSubstitute(i, 1)} disabled={i === slot.substitutes.length - 1}
                        className="p-0.5 text-[#9ca3af] hover:text-[#374151] disabled:opacity-20 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button onClick={() => removeSub.mutate({ substituteId: sub.id })}
                      className="p-1 text-[#9ca3af] hover:text-[#dc2626] transition-colors flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

              <SubstitutePicker
                bomItemId={slot.id}
                existingIds={[slot.componentId, ...slot.substitutes.map(s => s.product.id)]}
                onAdded={refetch}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function AdminBomSubstitutes({ productId, productName }: { productId: string; productName: string }) {
  const { data: slots = [], isLoading, refetch } = trpc.admin.bomSubstitutes.useQuery({ parentProductId: productId });

  const criticalSlots = slots.filter(s => {
    const primaryOk = s.component.stock > 0;
    const anySubOk = s.substitutes.some(sub => sub.product.stock > 0);
    return !primaryOk && !anySubOk;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-black text-[#111827] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}>
          Sustitutos — {productName}
        </h2>
        <p className="text-[11px] text-[#9ca3af] mt-0.5">
          Define piezas alternativas por slot. Si el componente principal no tiene stock, se usará el primer sustituto disponible.
        </p>
      </div>

      {criticalSlots.length > 0 && (
        <div className="flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
          <p className="text-[11px] text-[#dc2626]">
            <strong>{criticalSlots.length} slot{criticalSlots.length > 1 ? "s" : ""} sin cobertura</strong>
            {" "}— {criticalSlots.map(s => s.component.name).join(", ")} no tienen stock ni sustitutos disponibles.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#f3f4f6] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="text-[11px] text-[#9ca3af] py-4 text-center">
          Este producto no tiene fórmula de componentes definida.
        </p>
      ) : (
        <div className="space-y-2">
          {slots.map(slot => (
            <SlotRow key={slot.id} slot={slot} refetch={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
