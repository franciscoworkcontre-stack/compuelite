"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import {
  Plus, X, ChevronUp, ChevronDown, Eye, EyeOff,
  LayoutGrid, Keyboard, Armchair, Headphones, Mouse,
  Package, Square, Monitor, AppWindow, Wrench,
  Cpu, Zap, Shield, Star, Tag, Gamepad2, Laptop,
  HardDrive, MemoryStick, CircuitBoard, Fan, Plug,
  Printer, Camera, Tv, Wifi, Bluetooth,
  Mic, Tablet, Router, Volume2, Box, Thermometer,
  Power, Joystick, Usb, ScanLine, Cable,
  ShoppingBag, Percent, Trophy, BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ICON CATALOG — slugs stored in DB, resolved here
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  // Accesorios
  "layout-grid": LayoutGrid,
  "keyboard":    Keyboard,
  "armchair":    Armchair,
  "headphones":  Headphones,
  "mouse":       Mouse,
  "package":     Package,
  "square":      Square,
  "monitor":     Monitor,
  "app-window":  AppWindow,
  "wrench":      Wrench,
  "mic":         Mic,
  "camera":      Camera,
  "gamepad":     Gamepad2,
  "joystick":    Joystick,
  "volume":      Volume2,
  // Componentes PC
  "cpu":         Cpu,
  "zap":         Zap,
  "circuit":     CircuitBoard,
  "memory":      MemoryStick,
  "hard-drive":  HardDrive,
  "plug":        Plug,
  "power":       Power,
  "box":         Box,
  "fan":         Thermometer,
  "usb":         Usb,
  "cable":       Cable,
  // Portátiles
  "laptop":      Laptop,
  "tablet":      Tablet,
  // Conectividad
  "wifi":        Wifi,
  "bluetooth":   Bluetooth,
  "router":      Router,
  "printer":     Printer,
  "scan":        ScanLine,
  // Hogar / Entretenimiento
  "tv":          Tv,
  // Más
  "shield":      Shield,
  "star":        Star,
  "tag":         Tag,
  "percent":     Percent,
  "bag":         ShoppingBag,
  "trophy":      Trophy,
  "book":        BookOpen,
  "fan-spin":    Fan,
};

const ANIM_OPTIONS = ["pulse", "float", "spin", "bounce", "shake", "wiggle"] as const;
type AnimType = typeof ANIM_OPTIONS[number];

const ANIM_LABELS: Record<AnimType, string> = {
  pulse:  "Pulso",
  float:  "Flotar",
  spin:   "Girar",
  bounce: "Saltar",
  shake:  "Temblar",
  wiggle: "Ondular",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function IconPreview({ slug }: { slug: string | null | undefined }) {
  if (!slug) return <div className="w-5 h-5 rounded bg-[#f3f4f6]" />;
  const Icon = ICON_MAP[slug];
  if (!Icon) return <div className="w-5 h-5 rounded bg-[#f3f4f6] text-[8px] flex items-center justify-center text-[#9ca3af]">?</div>;
  return <Icon className="w-4 h-4 text-[#374151]" />;
}

type SidebarItem = {
  id: string;
  type: string;
  label: string | null;
  href: string | null;
  icon: string | null;
  anim: string | null;
  visible: boolean;
  order: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// ITEM ROW
// ─────────────────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRefetch,
}: {
  item: SidebarItem;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRefetch: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label ?? "");
  const [href, setHref]   = useState(item.href ?? "");
  const [icon, setIcon]   = useState(item.icon ?? "");
  const [anim, setAnim]   = useState<AnimType>((item.anim as AnimType) ?? "pulse");

  const update = trpc.navigation.updateSidebarItem.useMutation({ onSuccess: () => { setEditing(false); onRefetch(); } });
  const del    = trpc.navigation.deleteSidebarItem.useMutation({ onSuccess: onRefetch });
  const toggle = trpc.navigation.updateSidebarItem.useMutation({ onSuccess: onRefetch });

  function handleSave() {
    update.mutate({ id: item.id, label: label || null, href: href || null, icon: icon || null, anim });
  }

  if (item.type === "divider") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl">
        <div className="flex-1 h-px bg-[#e5e7eb]" />
        <span className="text-[9px] text-[#d1d5db] uppercase tracking-wider">divisor</span>
        <div className="flex-1 h-px bg-[#e5e7eb]" />
        <div className="flex items-center gap-1 ml-2">
          <button disabled={index === 0} onClick={onMoveUp} className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-30 transition-colors">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button disabled={index === total - 1} onClick={onMoveDown} className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-30 transition-colors">
            <ChevronDown className="w-3 h-3" />
          </button>
          <button onClick={() => { if (confirm("¿Eliminar divisor?")) del.mutate({ id: item.id }); }} className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  if (item.type === "heading") {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl">
        <span className="text-[9px] font-black text-[#9ca3af] uppercase tracking-widest flex-1">{item.label ?? "—"}</span>
        {editing ? (
          <input
            autoFocus
            value={label}
            onChange={e => setLabel(e.target.value)}
            onBlur={() => update.mutate({ id: item.id, label })}
            onKeyDown={e => e.key === "Enter" && update.mutate({ id: item.id, label })}
            className="text-xs border border-[#e5e7eb] rounded px-2 py-0.5 w-32 focus:outline-none focus:border-[#2563eb]/50"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-[10px] text-[#9ca3af] hover:text-[#374151] transition-colors">editar</button>
        )}
        <div className="flex items-center gap-1">
          <button disabled={index === 0} onClick={onMoveUp} className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-30 transition-colors">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button disabled={index === total - 1} onClick={onMoveDown} className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-30 transition-colors">
            <ChevronDown className="w-3 h-3" />
          </button>
          <button onClick={() => { if (confirm(`¿Eliminar "${item.label}"?`)) del.mutate({ id: item.id }); }} className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // type === "link"
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${item.visible ? "border-[#e5e7eb] bg-white" : "border-[#f3f4f6] bg-[#fafafa] opacity-60"}`}>
      {/* Summary row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center flex-shrink-0">
          <IconPreview slug={item.icon} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate">{item.label ?? "—"}</p>
          <p className="text-[10px] text-[#9ca3af] truncate font-mono">{item.href ?? "—"}</p>
        </div>

        {item.anim && (
          <span className="text-[9px] bg-[#f3f4f6] text-[#9ca3af] px-1.5 py-0.5 rounded font-mono hidden sm:block">
            {item.anim}
          </span>
        )}

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Visible toggle */}
          <button
            onClick={() => toggle.mutate({ id: item.id, visible: !item.visible })}
            title={item.visible ? "Ocultar" : "Mostrar"}
            className="w-6 h-6 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors"
          >
            {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          {/* Edit toggle */}
          <button
            onClick={() => setEditing(v => !v)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-all ${editing ? "border-[#2563eb]/30 text-[#2563eb] bg-[#eff6ff]" : "border-[#e5e7eb] text-[#6b7280] hover:text-[#374151]"}`}
          >
            {editing ? "Cerrar" : "Editar"}
          </button>
          {/* Move up/down */}
          <button disabled={index === 0} onClick={onMoveUp} className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-30 transition-colors">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button disabled={index === total - 1} onClick={onMoveDown} className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-30 transition-colors">
            <ChevronDown className="w-3 h-3" />
          </button>
          {/* Delete */}
          <button
            onClick={() => { if (confirm(`¿Eliminar "${item.label}"?`)) del.mutate({ id: item.id }); }}
            className="w-5 h-5 flex items-center justify-center rounded text-[#d1d5db] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Edit panel */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#f3f4f6] px-3 py-3 bg-[#fafafa] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">Etiqueta</label>
                  <input
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#2563eb]/50"
                    placeholder="Ej: Monitores"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">URL</label>
                  <input
                    value={href}
                    onChange={e => setHref(e.target.value)}
                    className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#2563eb]/50 font-mono"
                    placeholder="/productos?categoria=monitors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">Ícono</label>
                  <select
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#2563eb]/50"
                  >
                    <option value="">Sin ícono</option>
                    {Object.keys(ICON_MAP).map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  {icon && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <IconPreview slug={icon} />
                      <span className="text-[10px] text-[#9ca3af]">preview</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">Animación del ícono</label>
                  <select
                    value={anim}
                    onChange={e => setAnim(e.target.value as AnimType)}
                    className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#2563eb]/50"
                  >
                    {ANIM_OPTIONS.map(a => (
                      <option key={a} value={a}>{ANIM_LABELS[a]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs text-[#6b7280] hover:text-[#374151] transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={update.isPending}
                  className="px-4 py-1.5 text-xs font-bold bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                >
                  {update.isPending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD FORM
// ─────────────────────────────────────────────────────────────────────────────

function AddItemForm({ onSuccess }: { onSuccess: () => void }) {
  const [type, setType]   = useState<"link" | "divider" | "heading">("link");
  const [label, setLabel] = useState("");
  const [href, setHref]   = useState("");
  const [icon, setIcon]   = useState("");
  const [anim, setAnim]   = useState<AnimType>("pulse");

  const create = trpc.navigation.createSidebarItem.useMutation({
    onSuccess: () => { setLabel(""); setHref(""); setIcon(""); onSuccess(); },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      type,
      label: label || undefined,
      href:  href  || undefined,
      icon:  icon  || undefined,
      anim,
      visible: true,
      order: 9999, // will go to the bottom; reorder from there
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#e5e7eb] rounded-xl p-4 bg-white space-y-3">
      <p className="text-xs font-bold text-[#111827]">Agregar ítem</p>

      <div className="flex gap-2">
        {(["link", "heading", "divider"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${type === t ? "bg-[#2563eb] text-white border-[#2563eb]" : "border-[#e5e7eb] text-[#6b7280] hover:text-[#374151]"}`}
          >
            {t === "link" ? "Enlace" : t === "heading" ? "Título" : "Divisor"}
          </button>
        ))}
      </div>

      {type !== "divider" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">
              {type === "heading" ? "Título de sección" : "Etiqueta"}
            </label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              required
              className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2563eb]/50"
              placeholder={type === "heading" ? "Ej: Componentes" : "Ej: Monitores"}
            />
          </div>
          {type === "link" && (
            <div>
              <label className="block text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">URL</label>
              <input
                value={href}
                onChange={e => setHref(e.target.value)}
                required
                className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-[#2563eb]/50"
                placeholder="/productos?categoria=gpu"
              />
            </div>
          )}
        </div>
      )}

      {type === "link" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">Ícono</label>
            <select
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2563eb]/50"
            >
              <option value="">Sin ícono</option>
              {Object.keys(ICON_MAP).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">Animación</label>
            <select
              value={anim}
              onChange={e => setAnim(e.target.value as AnimType)}
              className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2563eb]/50"
            >
              {ANIM_OPTIONS.map(a => (
                <option key={a} value={a}>{ANIM_LABELS[a]}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={create.isPending}
        className="w-full py-2 text-xs font-bold bg-[#111827] text-white rounded-lg hover:bg-[#374151] transition-colors disabled:opacity-50"
      >
        {create.isPending ? "Agregando…" : "+ Agregar ítem"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function AdminNavigation() {
  const [showAdd, setShowAdd] = useState(false);
  const { data: items = [], refetch } = trpc.navigation.sidebarItemsAdmin.useQuery();
  const reorder = trpc.navigation.reorderSidebarItems.useMutation({ onSuccess: () => refetch() });

  function moveItem(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    const payload = next.map((item, i) => ({ id: item.id, order: i * 10 }));
    reorder.mutate(payload);
  }

  const visible   = items.filter(i => i.visible).length;
  const hidden    = items.filter(i => !i.visible).length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-[#111827] uppercase tracking-wide">Sidebar de la tienda</h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            {items.length} ítems · {visible} visibles · {hidden} ocultos
          </p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            showAdd
              ? "border-[#ef4444]/30 text-[#ef4444] bg-[#fef2f2]"
              : "border-[#e5e7eb] text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]"
          }`}
        >
          {showAdd ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Plus className="w-3.5 h-3.5" /> Agregar</>}
        </button>
      </div>

      {/* Info box */}
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-xs text-[#64748b] space-y-1.5">
        <p className="font-bold text-[#334155]">Cómo funciona</p>
        <p>Los ítems visibles aparecen en la barra lateral izquierda de la tienda. Reordénalos con las flechas, edita el texto y la URL inline, o ocúltalos temporalmente sin borrarlos.</p>
        <p className="text-[10px] text-[#94a3b8]">Los cambios se aplican inmediatamente — no hay que publicar.</p>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <AddItemForm onSuccess={() => { setShowAdd(false); refetch(); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items list */}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <ItemRow
              item={item}
              index={i}
              total={items.length}
              onMoveUp={() => moveItem(i, -1)}
              onMoveDown={() => moveItem(i, 1)}
              onRefetch={refetch}
            />
          </motion.div>
        ))}
      </div>

      {/* Preview note */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl">
        <div className="w-1 h-8 rounded-full bg-[#2563eb]/30 flex-shrink-0" />
        <p className="text-xs text-[#6b7280]">
          Para previsualizar, abre la tienda en otra pestaña —
          el sidebar se actualiza en tiempo real desde la base de datos.
        </p>
      </div>
    </div>
  );
}
