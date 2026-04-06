"use client";

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Eye, EyeOff, Settings, Save, X, GripVertical,
  Plus, Trash2, Pencil, ExternalLink, ChevronDown,
  Image as ImageIcon, Tag, Monitor, Building2, ShieldCheck,
  ArrowUpDown, ToggleLeft, Sliders, ImagePlus,
} from "lucide-react";
import { ImageUploader } from "./ImageUploader";

// ─── SECTION META ─────────────────────────────────────────────────────────────

type ConfigField = { key: string; label: string; type: "text" | "number" | "boolean"; default: string | number | boolean; hint?: string };

const SECTION_META: Record<string, {
  label: string;
  icon: React.ReactNode;
  what: string;       // what it shows
  how: string;        // how to manage it
  color: string;
  configFields?: ConfigField[];
}> = {
  featured_banners: {
    label: "Banners principales",
    icon: <ImagePlus className="w-5 h-5" />,
    what: "Las imágenes grandes con texto que aparecen al tope de la página. Si no hay banners creados, se muestran los productos destacados automáticamente.",
    how: "Gestiona los banners en la pestaña «Banners» de arriba. Aquí solo puedes mover o esconder esta sección.",
    color: "#0088ff",
  },
  best_deals: {
    label: "Mejores ofertas del día",
    icon: <Tag className="w-5 h-5" />,
    what: "Una fila de productos que tienen precio de oferta (compareAtPrice > price). Aparecen ordenados por mayor porcentaje de descuento.",
    how: "Los productos se actualizan solos cuando cambias sus precios desde Productos o via CSV de ofertas.",
    color: "#ff3366",
    configFields: [
      { key: "title",    label: "Título de la sección", type: "text",   default: "Today's Best Deals", hint: "Ej: «Ofertas de la semana»" },
      { key: "maxItems", label: "Máx. productos a mostrar", type: "number", default: 6, hint: "Entre 4 y 12 recomendado" },
    ],
  },
  builds_by_type: {
    label: "Builds por nivel",
    icon: <Monitor className="w-5 h-5" />,
    what: "Tarjetas de categoría de builds: Starter, Pro, Elite, Workstation, Hogar. Cada tarjeta lleva al catálogo filtrado por tipo.",
    how: "Puedes cambiar el título de la sección. Las categorías y colores están fijos en el código.",
    color: "#00ff66",
    configFields: [
      { key: "title", label: "Título de la sección", type: "text", default: "Builds por Nivel", hint: "Ej: «Arma tu PC ideal»" },
    ],
  },
  brand_logos: {
    label: "Strip de marcas",
    icon: <Building2 className="w-5 h-5" />,
    what: "Una franja con logos de marcas (Intel, AMD, NVIDIA, etc.) que hacen scroll automático. Transmite confianza en los productos.",
    how: "Los logos están definidos en el código. Puedes mostrar u ocultar esta sección.",
    color: "#888888",
  },
  trust_signals: {
    label: "Íconos de confianza",
    icon: <ShieldCheck className="w-5 h-5" />,
    what: "Fila de íconos animados: envío rápido, pago seguro, stock local, garantía. Aparece al final de la página.",
    how: "El contenido está fijo. Puedes mostrar u ocultar esta sección.",
    color: "#a855f7",
  },
};

type Section = { id: string; slug: string; label: string; isVisible: boolean; order: number; config: Record<string, unknown> };
type Banner  = { id: string; title: string; subtitle: string | null; imageUrl: string; href: string; accentColor: string; isActive: boolean; order: number };

// ─── PAGE MAP ─────────────────────────────────────────────────────────────────

function PageMap({ sections }: { sections: Section[] }) {
  const ordered = [...sections].sort((a, b) => a.order - b.order);
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#080808] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#111] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-[10px] text-[#333] font-mono">compuelite.cl</span>
      </div>
      <div className="p-3 space-y-1.5">
        {/* Fixed header */}
        <div className="h-5 rounded bg-[#111] border border-[#1a1a1a] flex items-center px-2 gap-1.5">
          <div className="w-3 h-1.5 rounded-sm bg-[#00ff66]/40" />
          <div className="flex gap-1 ml-auto">
            {[1,2,3,4].map(i => <div key={i} className="w-4 h-1 rounded-sm bg-[#1a1a1a]" />)}
          </div>
        </div>
        {/* Sections */}
        {ordered.map((s) => {
          const meta = SECTION_META[s.slug];
          const color = meta?.color ?? "#333";
          if (!s.isVisible) return (
            <div key={s.id} className="h-5 rounded border border-dashed border-[#151515] flex items-center px-2 gap-1.5 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#222]" />
              <span className="text-[8px] text-[#2a2a2a] line-through">{meta?.label ?? s.slug}</span>
            </div>
          );
          return (
            <div key={s.id} className="rounded border flex items-center px-2 gap-1.5 transition-all"
              style={{ borderColor: `${color}30`, background: `${color}08`, height: s.slug === "featured_banners" ? "36px" : "24px" }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[8px] font-medium" style={{ color: `${color}cc` }}>{meta?.label ?? s.slug}</span>
            </div>
          );
        })}
        {/* Fixed footer */}
        <div className="h-4 rounded bg-[#080808] border border-[#111] flex items-center px-2 gap-1 mt-1">
          {[1,2,3].map(i => <div key={i} className="w-4 h-1 rounded-sm bg-[#111]" />)}
        </div>
      </div>
    </div>
  );
}

// ─── HOW IT WORKS TUTORIAL ────────────────────────────────────────────────────

function HowItWorks({ onDismiss }: { onDismiss: () => void }) {
  const steps = [
    { icon: <ArrowUpDown className="w-4 h-4" />, title: "Arrastra para reordenar", body: "Agarra cualquier sección por el ícono de puntos y arrástrala arriba o abajo. El orden se guarda al soltar." },
    { icon: <ToggleLeft className="w-4 h-4" />,  title: "Activa o desactiva secciones", body: "El botón «Visible» muestra u oculta la sección en la tienda sin borrarla. Útil para pruebas o temporadas." },
    { icon: <Sliders className="w-4 h-4" />,     title: "Configura el contenido", body: "Algunas secciones tienen opciones editables como el título o la cantidad de productos. Haz clic en «Config»." },
    { icon: <ImagePlus className="w-4 h-4" />,   title: "Gestiona banners por separado", body: "Los banners del tope tienen su propia pestaña. Ahí subes la imagen, defines el link y el color de acento." },
  ];

  return (
    <div className="rounded-xl border border-[#00ff66]/15 bg-[#00ff66]/[0.03] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#00ff66]/10">
        <p className="text-xs font-black text-[#00ff66] uppercase tracking-widest">¿Cómo funciona esta página?</p>
        <button onClick={onDismiss} className="text-[#444] hover:text-[#666] transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[#00ff66]/5">
        {steps.map((s, i) => (
          <div key={i} className="bg-[#080808] px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-[#00ff66]">
              {s.icon}
              <p className="text-[11px] font-bold text-white">{s.title}</p>
            </div>
            <p className="text-[11px] text-[#555] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION CONFIG MODAL ────────────────────────────────────────────────────

function ConfigModal({ section, onSave, onClose }: { section: Section; onSave: (config: Record<string, unknown>, label: string) => void; onClose: () => void }) {
  const meta = SECTION_META[section.slug];
  const [label, setLabel] = useState(section.label);
  const [fields, setFields] = useState<Record<string, unknown>>({ ...section.config });
  const [showRaw, setShowRaw] = useState(false);
  const [raw, setRaw] = useState(JSON.stringify(section.config, null, 2));
  const [rawErr, setRawErr] = useState<string | null>(null);

  function setField(key: string, val: unknown) {
    const next = { ...fields, [key]: val };
    setFields(next);
    setRaw(JSON.stringify(next, null, 2));
    setRawErr(null);
  }

  function handleRaw(v: string) {
    setRaw(v);
    try { setFields(JSON.parse(v)); setRawErr(null); } catch { setRawErr("JSON inválido"); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#222] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${meta?.color ?? "#333"}15`, color: meta?.color ?? "#888" }}>
              {meta?.icon}
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">{meta?.label ?? section.slug}</p>
              <p className="text-[10px] text-[#444] mt-0.5">Configuración de sección</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-[#444] hover:text-white transition-colors" /></button>
        </div>

        {meta?.what && (
          <div className="px-5 py-3 bg-[#080808] border-b border-[#111]">
            <p className="text-[11px] text-[#555] leading-relaxed">{meta.what}</p>
          </div>
        )}

        <div className="px-5 py-4 space-y-4 max-h-[55vh] overflow-y-auto">
          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Nombre en el admin</label>
            <input value={label} onChange={e => setLabel(e.target.value)} className="w-full px-3 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50" />
            <p className="text-[10px] text-[#333] mt-1">Solo se muestra aquí, no afecta la tienda.</p>
          </div>

          {meta?.configFields && meta.configFields.length > 0 ? (
            meta.configFields.map(f => (
              <div key={f.key}>
                <label className="text-[11px] text-[#666] block mb-1">{f.label}</label>
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={String(fields[f.key] ?? f.default)}
                  onChange={e => setField(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                  placeholder={f.hint}
                  className="w-full px-3 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50 placeholder-[#333]"
                />
                {f.hint && <p className="text-[10px] text-[#333] mt-1">{f.hint}</p>}
              </div>
            ))
          ) : (
            <div className="py-3 text-center">
              <p className="text-xs text-[#333]">Esta sección no tiene opciones configurables.</p>
              <p className="text-[10px] text-[#222] mt-1">Solo puedes cambiar el nombre en el admin o mostrar/ocultar desde la lista.</p>
            </div>
          )}

          <div>
            <button onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-1.5 text-[10px] text-[#333] hover:text-[#555] transition-colors">
              <ChevronDown className={`w-3 h-3 transition-transform ${showRaw ? "rotate-180" : ""}`} /> Opciones avanzadas (JSON)
            </button>
            {showRaw && (
              <div className="mt-2">
                <textarea value={raw} onChange={e => handleRaw(e.target.value)} rows={5} className="w-full px-3 py-2 text-xs font-mono bg-[#080808] border border-[#1a1a1a] text-[#888] rounded-lg focus:outline-none resize-none" spellCheck={false} />
                {rawErr && <p className="text-[10px] text-[#ff4545] mt-1">{rawErr}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#1a1a1a]">
          <button onClick={onClose} className="px-4 py-2 text-xs text-[#555] hover:text-[#888] uppercase tracking-wider">Cancelar</button>
          <button onClick={() => !rawErr && onSave(fields, label)} disabled={!!rawErr} className="flex items-center gap-2 px-4 py-2 bg-[#00ff66] text-black text-xs font-black uppercase tracking-widest rounded disabled:opacity-30">
            <Save className="w-3.5 h-3.5" /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BANNER FORM MODAL ────────────────────────────────────────────────────────

const ACCENT_PRESETS = ["#00ff66", "#0088ff", "#ffb800", "#ff3366", "#a855f7", "#00ddff", "#ff6b00"];

function BannerModal({ banner, onSave, onClose }: {
  banner: Partial<Banner> | null;
  onSave: (data: Omit<Banner, "id" | "order" | "isActive">) => void;
  onClose: () => void;
}) {
  const isEdit = !!banner?.id;
  const [title, setTitle]   = useState(banner?.title ?? "");
  const [subtitle, setSub]  = useState(banner?.subtitle ?? "");
  const [imageUrl, setImg]  = useState(banner?.imageUrl ?? "");
  const [href, setHref]     = useState(banner?.href ?? "");
  const [accent, setAccent] = useState(banner?.accentColor ?? "#00ff66");
  const valid = title.trim() && imageUrl.trim() && href.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#222] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div>
            <p className="text-xs font-black text-white uppercase tracking-widest">
              {isEdit ? "Editar banner" : "Nuevo banner"}
            </p>
            <p className="text-[10px] text-[#444] mt-0.5">Los banners aparecen al tope de la página de inicio</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-[#444] hover:text-white transition-colors" /></button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Live preview */}
          <div className="rounded-lg overflow-hidden border border-[#1a1a1a]" style={{ background: `linear-gradient(135deg, ${accent}20, #080808)` }}>
            <div className="relative h-28 flex items-center justify-center">
              {imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imageUrl} alt="preview" className="h-full max-h-24 object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-20">
                  <ImageIcon className="w-8 h-8 text-white" />
                  <p className="text-[10px] text-white">Sube una imagen para ver la previsualización</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[10px] font-bold" style={{ color: accent }}>{subtitle || "Marca / categoría"}</p>
                <p className="text-sm font-black text-white leading-tight">{title || "Título del banner"}</p>
              </div>
            </div>
            <div className="px-3 py-1.5 border-t border-[#1a1a1a] bg-[#080808]/60">
              <p className="text-[9px] text-[#333]">Previsualización — así se verá en la tienda</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Título principal *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="RTX 4090 — La GPU definitiva" className="w-full px-3 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50 placeholder-[#333]" />
            <p className="text-[10px] text-[#333] mt-1">Texto grande del banner. Corto y directo.</p>
          </div>

          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Subtítulo / Marca</label>
            <input value={subtitle} onChange={e => setSub(e.target.value)} placeholder="NVIDIA GeForce" className="w-full px-3 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50 placeholder-[#333]" />
            <p className="text-[10px] text-[#333] mt-1">Texto pequeño que aparece encima del título. Opcional.</p>
          </div>

          <ImageUploader value={imageUrl} onChange={url => setImg(url)} folder="banners" label="Imagen del banner *" />
          <p className="-mt-2 text-[10px] text-[#333]">Recomendado: imagen PNG con fondo transparente o oscuro, min. 600px de alto.</p>

          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Link destino *</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#333]" />
              <input value={href} onChange={e => setHref(e.target.value)} placeholder="/productos/rtx-4090" className="w-full pl-9 pr-4 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50 placeholder-[#333]" />
            </div>
            <p className="text-[10px] text-[#333] mt-1">Ruta interna (ej: /builds) o URL completa. Al hacer clic en el banner se irá aquí.</p>
          </div>

          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-2">Color de acento</label>
            <p className="text-[10px] text-[#333] mb-2">Define el color del subtítulo y del degradado de fondo.</p>
            <div className="flex items-center gap-2 flex-wrap">
              {ACCENT_PRESETS.map(c => (
                <button key={c} onClick={() => setAccent(c)} className="w-7 h-7 rounded-full border-2 transition-all" style={{ backgroundColor: c, borderColor: accent === c ? "white" : "transparent", transform: accent === c ? "scale(1.2)" : "scale(1)" }} />
              ))}
              <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-8 h-7 rounded cursor-pointer bg-transparent border border-[#333]" title="Color personalizado" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#1a1a1a]">
          <button onClick={onClose} className="px-4 py-2 text-xs text-[#555] hover:text-[#888] uppercase tracking-wider">Cancelar</button>
          <button
            onClick={() => valid && onSave({ title, subtitle: subtitle || null, imageUrl, href, accentColor: accent })}
            disabled={!valid}
            className="flex items-center gap-2 px-4 py-2 bg-[#00ff66] text-black text-xs font-black uppercase tracking-widest rounded disabled:opacity-30"
          >
            <Save className="w-3.5 h-3.5" /> {isEdit ? "Actualizar" : "Crear banner"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BANNERS TAB ─────────────────────────────────────────────────────────────

function BannersTab() {
  const utils = trpc.useUtils();
  const { data: banners = [], isLoading } = trpc.content.bannersAdmin.useQuery();
  const [modalBanner, setModalBanner] = useState<Partial<Banner> | null | false>(false);
  const dragIdx = useRef<number | null>(null);

  const inv = () => utils.content.bannersAdmin.invalidate();
  const createBanner   = trpc.content.createBanner.useMutation({ onSuccess: inv });
  const updateBanner   = trpc.content.updateBanner.useMutation({ onSuccess: inv });
  const deleteBanner   = trpc.content.deleteBanner.useMutation({ onSuccess: inv });
  const reorderBanners = trpc.content.reorderBanners.useMutation({ onSuccess: inv });

  function onDrop(i: number) {
    const from = dragIdx.current;
    if (from === null || from === i) return;
    const reordered = [...banners];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(i, 0, moved);
    reorderBanners.mutate(reordered.map((b, idx) => ({ id: b.id, order: idx + 1 })));
    dragIdx.current = null;
  }

  function handleSave(data: Omit<Banner, "id" | "order" | "isActive">) {
    const payload = { ...data, subtitle: data.subtitle ?? undefined };
    if (modalBanner && "id" in modalBanner && modalBanner.id) {
      updateBanner.mutate({ id: modalBanner.id, ...payload });
    } else {
      createBanner.mutate(payload);
    }
    setModalBanner(false);
  }

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-[#111] animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      {/* Tutorial */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#080808] p-4 space-y-3">
        <p className="text-xs font-bold text-white">¿Qué son los banners?</p>
        <p className="text-[11px] text-[#555] leading-relaxed">
          Los banners son las imágenes grandes que aparecen al tope de la página de inicio, antes de cualquier otro contenido.
          Puedes tener <strong className="text-[#888]">varios banners que rotan</strong> automáticamente.
          Si no hay banners activos, la tienda muestra los productos destacados como fallback.
        </p>
        {/* Mini visual */}
        <div className="rounded-lg border border-[#111] overflow-hidden">
          <div className="h-14 bg-gradient-to-r from-[#0088ff]/20 to-[#080808] flex items-center px-4 gap-3 relative">
            <div className="space-y-1">
              <div className="text-[9px] text-[#0088ff]">NVIDIA GeForce</div>
              <div className="text-[11px] font-black text-white">RTX 4090 — La GPU definitiva</div>
            </div>
            <div className="ml-auto w-12 h-10 rounded bg-[#0088ff]/10 border border-[#0088ff]/20 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-[#0088ff]/40" />
            </div>
            <div className="absolute bottom-2 right-2 flex gap-1">
              {[1,2,3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-white" : "bg-white/20"}`} />)}
            </div>
          </div>
          <div className="px-3 py-1.5 bg-[#050505] border-t border-[#111]">
            <p className="text-[9px] text-[#2a2a2a]">Así se ve un banner en la tienda · Los puntos indican cuántos hay</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#444]">
          {banners.length === 0
            ? "Sin banners — se muestra el fallback de productos destacados"
            : `${banners.length} banner${banners.length !== 1 ? "s" : ""} · arrastra para cambiar el orden de rotación`}
        </p>
        <button
          onClick={() => setModalBanner({})}
          className="flex items-center gap-2 px-3 py-2 bg-[#00ff66] text-black text-xs font-black uppercase tracking-widest rounded hover:bg-[#00cc52] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo banner
        </button>
      </div>

      {banners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-[#1a1a1a] rounded-xl gap-3 text-center px-6">
          <div className="w-10 h-10 rounded-xl border border-[#1a1a1a] bg-[#111] flex items-center justify-center">
            <ImagePlus className="w-5 h-5 text-[#2a2a2a]" />
          </div>
          <div>
            <p className="text-xs text-white font-semibold">Sin banners todavía</p>
            <p className="text-[11px] text-[#333] mt-1 max-w-xs">Ahora se muestran los productos destacados. Crea un banner para poner la imagen que quieras.</p>
          </div>
          <button onClick={() => setModalBanner({})} className="text-[10px] text-[#00ff66] border border-[#00ff66]/30 px-3 py-1.5 rounded hover:bg-[#00ff66]/5 transition-colors uppercase tracking-wider">
            + Crear primer banner
          </button>
        </div>
      )}

      <div className="space-y-2">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            draggable
            onDragStart={() => { dragIdx.current = i; }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="flex items-center gap-3 p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] cursor-grab active:cursor-grabbing hover:border-[#252525] transition-all"
          >
            <GripVertical className="w-4 h-4 text-[#1e1e1e] flex-shrink-0" />
            <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-[#1a1a1a] bg-[#080808] flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${banner.accentColor}20, #080808)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-contain p-1" onError={e => { e.currentTarget.style.display = "none"; }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: banner.accentColor }} />
                <p className="text-sm font-semibold text-white truncate">{banner.title}</p>
              </div>
              {banner.subtitle && <p className="text-[10px] text-[#444] mt-0.5 truncate">{banner.subtitle}</p>}
              <p className="text-[9px] font-mono text-[#2a2a2a] mt-0.5 truncate">→ {banner.href}</p>
            </div>
            <span className={`flex-shrink-0 text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${banner.isActive ? "text-[#00ff66] border-[#00ff66]/25 bg-[#00ff66]/5" : "text-[#333] border-[#1a1a1a]"}`}>
              {banner.isActive ? "Activo" : "Oculto"}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => updateBanner.mutate({ id: banner.id, isActive: !banner.isActive })} className="p-1.5 text-[#333] hover:text-[#888] transition-colors" title={banner.isActive ? "Ocultar" : "Mostrar"}>
                {banner.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setModalBanner(banner)} className="p-1.5 text-[#333] hover:text-[#00ff66] transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { if (confirm("¿Eliminar este banner?")) deleteBanner.mutate({ id: banner.id }); }} className="p-1.5 text-[#333] hover:text-[#ff4545] transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalBanner !== false && (
        <BannerModal banner={modalBanner} onSave={handleSave} onClose={() => setModalBanner(false)} />
      )}
    </div>
  );
}

// ─── SECTIONS TAB ─────────────────────────────────────────────────────────────

function SectionsTab({ sections, isLoading }: { sections: Section[]; isLoading: boolean }) {
  const utils = trpc.useUtils();
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const inv = () => utils.content.homepageSectionsAdmin.invalidate();
  const toggleVisibility = trpc.content.toggleSectionVisibility.useMutation({ onSuccess: inv });
  const reorderMutation  = trpc.content.reorderSections.useMutation({ onSuccess: inv });
  const updateSection    = trpc.content.updateSection.useMutation({
    onSuccess: (_, v) => { inv(); setSavedId(v.id); setTimeout(() => setSavedId(null), 2000); setEditSection(null); },
  });

  function onDrop(i: number) {
    const from = dragIdx.current;
    if (from === null || from === i) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(i, 0, moved);
    reorderMutation.mutate(reordered.map((s, idx) => ({ id: s.id, order: idx + 1 })));
    dragIdx.current = null;
    setDragOver(null);
  }

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-[#111] animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      {showTutorial && <HowItWorks onDismiss={() => setShowTutorial(false)} />}

      {/* Page map + section list side by side */}
      <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
        {/* Visual page map */}
        <div className="space-y-2">
          <p className="text-[10px] text-[#333] uppercase tracking-wider">Vista de la página</p>
          <PageMap sections={sections} />
          <p className="text-[9px] text-[#222] leading-tight">Las secciones ocultas aparecen tachadas</p>
        </div>

        {/* Section list */}
        <div className="space-y-2">
          {sections.map((section, i) => {
            const meta = SECTION_META[section.slug];
            const config = section.config as Record<string, unknown>;
            const hasConfig = (meta?.configFields?.length ?? 0) > 0;

            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => { dragIdx.current = i; }}
                onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => onDrop(i)}
                className={`rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  dragOver === i
                    ? "border-[#00ff66]/40 bg-[#00ff66]/[0.03]"
                    : section.isVisible
                    ? "border-[#1a1a1a] bg-[#0d0d0d]"
                    : "border-[#0f0f0f] bg-[#080808] opacity-50"
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  <GripVertical className="w-4 h-4 text-[#1e1e1e] flex-shrink-0" />

                  {/* Icon */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${meta?.color ?? "#333"}10`, color: section.isVisible ? (meta?.color ?? "#555") : "#333" }}>
                    {meta?.icon ?? <Settings className="w-4 h-4" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{meta?.label ?? section.label}</p>
                      {savedId === section.id && <span className="text-[9px] text-[#00ff66]">✓ guardado</span>}
                    </div>
                    <p className="text-[10px] text-[#444] mt-0.5 line-clamp-1">{meta?.what}</p>
                    {hasConfig && Object.keys(config).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(config).slice(0, 2).map(([k, v]) =>
                          typeof v !== "object" ? (
                            <span key={k} className="text-[9px] font-mono text-[#333] bg-[#111] border border-[#1a1a1a] px-1.5 py-0.5 rounded">{String(v)}</span>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {hasConfig && (
                      <button
                        onClick={() => setEditSection(section)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-[#444] hover:text-[#888] border border-[#1a1a1a] hover:border-[#252525] rounded transition-all uppercase tracking-wider"
                      >
                        <Settings className="w-3 h-3" /> Config
                      </button>
                    )}
                    <button
                      onClick={() => toggleVisibility.mutate({ id: section.id })}
                      disabled={toggleVisibility.isPending}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] border rounded transition-all uppercase tracking-wider ${
                        section.isVisible
                          ? "text-[#00ff66] border-[#00ff66]/25 bg-[#00ff66]/5 hover:bg-[#00ff66]/10"
                          : "text-[#555] border-[#1a1a1a] hover:border-[#252525] hover:text-[#888]"
                      }`}
                    >
                      {section.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {section.isVisible ? "Visible" : "Oculto"}
                    </button>
                  </div>
                </div>

                {/* Expandable "what it does" */}
                {meta?.how && (
                  <div className="px-3 pb-2.5 pl-16">
                    <p className="text-[10px] text-[#2a2a2a] leading-relaxed">{meta.how}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {editSection && (
        <ConfigModal
          section={editSection}
          onSave={(config, label) => updateSection.mutate({ id: editSection.id, config, label })}
          onClose={() => setEditSection(null)}
        />
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function AdminHomepage() {
  const [tab, setTab] = useState<"sections" | "banners">("sections");
  const { data: rawSections = [], isLoading } = trpc.content.homepageSectionsAdmin.useQuery();
  const sections = rawSections.map(s => ({ ...s, config: (s.config ?? {}) as Record<string, unknown> })) as Section[];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-widest">Homepage</h1>
          <p className="text-xs text-[#444] mt-1 max-w-lg">
            Controla qué aparece en la página de inicio de la tienda: el orden de las secciones, cuáles están activas y los banners de la parte superior.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 text-xs text-[#444] hover:text-[#00ff66] transition-colors border border-[#1a1a1a] hover:border-[#00ff66]/30 px-3 py-2 rounded-lg">
          <ExternalLink className="w-3.5 h-3.5" /> Ver tienda
        </a>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a1a1a]">
        <button onClick={() => setTab("sections")}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === "sections" ? "text-[#00ff66] border-[#00ff66]" : "text-[#444] border-transparent hover:text-[#666]"}`}>
          Secciones
          <span className="ml-2 text-[9px] text-[#333] normal-case tracking-normal font-normal">¿qué aparece y en qué orden?</span>
        </button>
        <button onClick={() => setTab("banners")}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === "banners" ? "text-[#00ff66] border-[#00ff66]" : "text-[#444] border-transparent hover:text-[#666]"}`}>
          Banners
          <span className="ml-2 text-[9px] text-[#333] normal-case tracking-normal font-normal">imágenes del tope</span>
        </button>
      </div>

      {tab === "sections"
        ? <SectionsTab sections={sections} isLoading={isLoading} />
        : <BannersTab />}
    </div>
  );
}
