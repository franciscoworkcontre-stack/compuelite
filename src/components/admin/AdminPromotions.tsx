"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { PromotionType, PromotionConditionType } from "@prisma/client";
import { CsvUploadZone } from "./CsvUploadZone";

const TYPE_LABELS: Record<PromotionType, string> = {
  PERCENTAGE: "% Descuento",
  FIXED_AMOUNT: "Monto fijo",
  FREE_SHIPPING: "Envío gratis",
  BOGO: "2x1",
};

const CONDITION_LABELS: Record<PromotionConditionType, string> = {
  CART_TOTAL: "Monto de carrito ≥",
  CATEGORY: "Categoría",
  BRAND: "Marca",
  PRODUCT: "Producto",
  QUANTITY: "Cantidad ≥",
};

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

const EMPTY_FORM = {
  name: "",
  description: "",
  type: "PERCENTAGE" as PromotionType,
  value: 10,
  conditionType: "CART_TOTAL" as PromotionConditionType,
  conditionValue: "50000",
  minQty: 1,
  isActive: true,
  stackable: false,
  priority: 0,
  startsAt: "",
  endsAt: "",
  maxUses: undefined as number | undefined,
};

export function AdminPromotions() {
  const utils = trpc.useUtils();
  const { data: rules, isLoading } = trpc.promotions.list.useQuery();
  const [tab, setTab] = useState<"reglas" | "sku_csv">("reglas");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const create = trpc.promotions.create.useMutation({ onSuccess: () => { utils.promotions.list.invalidate(); setShowForm(false); setForm(EMPTY_FORM); } });
  const update = trpc.promotions.update.useMutation({ onSuccess: () => { utils.promotions.list.invalidate(); setShowForm(false); setEditId(null); setForm(EMPTY_FORM); } });
  const toggle = trpc.promotions.toggleActive.useMutation({ onSuccess: () => utils.promotions.list.invalidate() });
  const remove = trpc.promotions.delete.useMutation({ onSuccess: () => utils.promotions.list.invalidate() });

  const handleEdit = (rule: NonNullable<typeof rules>[number]) => {
    setForm({
      name: rule.name,
      description: rule.description ?? "",
      type: rule.type,
      value: Number(rule.value),
      conditionType: rule.conditionType,
      conditionValue: rule.conditionValue ?? "",
      minQty: rule.minQty ?? 1,
      isActive: rule.isActive,
      stackable: rule.stackable,
      priority: rule.priority,
      startsAt: rule.startsAt ? new Date(rule.startsAt).toISOString().slice(0, 16) : "",
      endsAt: rule.endsAt ? new Date(rule.endsAt).toISOString().slice(0, 16) : "",
      maxUses: rule.maxUses ?? undefined,
    });
    setEditId(rule.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    };
    if (editId) {
      update.mutate({ id: editId, ...payload });
    } else {
      create.mutate(payload);
    }
  };

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked
      : e.target.type === "number" ? Number(e.target.value)
      : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wide">Promociones</h1>
          <p className="text-xs text-[#555] mt-1">Reglas automáticas de descuento y precios por SKU</p>
        </div>
        {tab === "reglas" && <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
          className="px-4 py-2 bg-[#00ff66] text-black text-xs font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] transition-colors"
        >
          + Nueva regla
        </button>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a1a1a] mb-6">
        {([["reglas", "Reglas automáticas"], ["sku_csv", "Ofertas por SKU (CSV)"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === id ? "text-[#00ff66] border-[#00ff66]" : "text-[#444] border-transparent hover:text-[#666]"}`}
            style={{ fontFamily: "var(--font-display)" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "sku_csv" && (
        <CsvUploadZone
          endpoint="/api/admin/csv/promotions"
          title="Ofertas por SKU en lote"
          description="Sube precios de oferta por SKU. El sistema actualiza precio y precio original — los productos aparecen automáticamente en la sección de Ofertas del Homepage."
          templateFilename="template-ofertas.csv"
          templateHeaders={["sku", "precio_oferta", "precio_original"]}
          templateExample={["GPU-RTX4090-24G", "2499990", "2899990"]}
          helpRows={[
            { label: "sku",            desc: "SKU exacto del producto." },
            { label: "precio_oferta",  desc: "Nuevo precio de venta (rebajado). Debe ser menor que precio_original." },
            { label: "precio_original",desc: "Precio antes del descuento — se muestra tachado. Debe ser mayor que precio_oferta." },
          ]}
        />
      )}

      {tab === "reglas" && <>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-[#111] border border-[#1a1a1a] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#00ff66] uppercase tracking-wider mb-4">
            {editId ? "Editar regla" : "Nueva regla"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-[#888] mb-1">Nombre *</label>
              <input value={form.name} onChange={f("name")} required className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white" placeholder="Ej: 10% en pedidos sobre $50.000" />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1">Tipo de descuento</label>
              <select value={form.type} onChange={f("type")} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1">
                Valor {form.type === "PERCENTAGE" ? "(%)" : form.type === "FREE_SHIPPING" ? "(no aplica)" : "(CLP)"}
              </label>
              <input type="number" value={form.value} onChange={f("value")} min={0} disabled={form.type === "FREE_SHIPPING"} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white disabled:opacity-40" />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1">Condición</label>
              <select value={form.conditionType} onChange={f("conditionType")} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white">
                {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1">Valor condición</label>
              <input value={form.conditionValue} onChange={f("conditionValue")} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white" placeholder={form.conditionType === "CART_TOTAL" ? "50000" : "ID o nombre"} />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1">Desde</label>
              <input type="datetime-local" value={form.startsAt} onChange={f("startsAt")} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1">Hasta</label>
              <input type="datetime-local" value={form.endsAt} onChange={f("endsAt")} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1">Prioridad</label>
              <input type="number" value={form.priority} onChange={f("priority")} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1">Máx. usos (vacío = ilimitado)</label>
              <input type="number" value={form.maxUses ?? ""} onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value ? Number(e.target.value) : undefined }))} min={1} className="w-full bg-[#0d0d0d] border border-[#222] rounded px-3 py-2 text-sm text-white" />
            </div>
            <div className="col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm text-[#888] cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={f("isActive")} className="accent-[#00ff66]" />
                Activa
              </label>
              <label className="flex items-center gap-2 text-sm text-[#888] cursor-pointer">
                <input type="checkbox" checked={form.stackable} onChange={f("stackable")} className="accent-[#00ff66]" />
                Acumulable con otras
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={create.isPending || update.isPending} className="px-5 py-2 bg-[#00ff66] text-black text-xs font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] disabled:opacity-40 transition-colors">
              {editId ? "Guardar cambios" : "Crear regla"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }} className="px-5 py-2 bg-[#1a1a1a] text-[#888] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#222] transition-colors">
              Cancelar
            </button>
          </div>
          {(create.error || update.error) && (
            <p className="text-xs text-[#ff6666]">{(create.error ?? update.error)?.message}</p>
          )}
        </form>
      )}

      {/* Table */}
      {isLoading ? (
        <p className="text-[#555] text-sm">Cargando...</p>
      ) : !rules?.length ? (
        <div className="text-center py-16 text-[#444]">
          <p className="text-4xl mb-4">🏷️</p>
          <p className="text-sm">No hay reglas de promoción. Crea la primera.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-4 px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{rule.name}</p>
                  {!rule.isActive && <span className="text-[10px] px-1.5 py-0.5 bg-[#222] text-[#555] rounded">inactiva</span>}
                  {rule.stackable && <span className="text-[10px] px-1.5 py-0.5 bg-[#001a08] border border-[#00ff66]/20 text-[#00ff66] rounded">acumulable</span>}
                </div>
                <p className="text-xs text-[#555] mt-0.5">
                  {TYPE_LABELS[rule.type]} — {CONDITION_LABELS[rule.conditionType]} {rule.conditionValue}
                  {rule.endsAt && ` · hasta ${new Date(rule.endsAt).toLocaleDateString("es-CL")}`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-mono font-bold text-[#00ff66]">
                  {rule.type === "PERCENTAGE" ? `${Number(rule.value)}%` : rule.type === "FREE_SHIPPING" ? "Gratis" : formatCLP(Number(rule.value))}
                </p>
                <p className="text-[10px] text-[#444]">{rule.usedCount} usos</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggle.mutate({ id: rule.id })} className="px-3 py-1.5 text-xs text-[#666] bg-[#1a1a1a] rounded hover:bg-[#222] transition-colors">
                  {rule.isActive ? "Desactivar" : "Activar"}
                </button>
                <button onClick={() => handleEdit(rule)} className="px-3 py-1.5 text-xs text-[#888] bg-[#1a1a1a] rounded hover:bg-[#222] transition-colors">
                  Editar
                </button>
                <button onClick={() => remove.mutate({ id: rule.id })} className="px-3 py-1.5 text-xs text-[#ff4444] bg-[#1a0a0a] rounded hover:bg-[#2a0a0a] transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>}
    </div>
  );
}
