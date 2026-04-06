"use client";

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Eye, EyeOff, Settings, Save, X, GripVertical,
  Plus, Trash2, Pencil, Image as ImageIcon, ExternalLink,
} from "lucide-react";
import { ImageUploader } from "./ImageUploader";

// ─── SECTION CONFIG META ─────────────────────────────────────────────────────

const SECTION_META: Record<string, { description: string; configFields?: ConfigField[] }> = {
  featured_banners: { description: "Banners rotativos superiores. Gestionados en la pestaña Banners." },
  best_deals:  {
    description: "Productos con descuento ordenados por mayor ahorro.",
    configFields: [
      { key: "title",    label: "Título",            type: "text",   default: "Today's Best Deals" },
      { key: "maxItems", label: "Máx. productos",    type: "number", default: 6 },
    ],
  },
  builds_by_type: {
    description: "Grid de categorías de builds.",
    configFields: [
      { key: "title", label: "Título", type: "text", default: "Builds por Nivel" },
    ],
  },
  brand_logos:   { description: "Strip de logos de marcas con scroll automático." },
  trust_signals: { description: "Íconos animados: envío, pago seguro, stock, garantía." },
};

type ConfigField = { key: string; label: string; type: "text" | "number" | "boolean"; default: string | number | boolean };
type Section = { id: string; slug: string; label: string; isVisible: boolean; order: number; config: Record<string, unknown> };
type Banner  = { id: string; title: string; subtitle: string | null; imageUrl: string; href: string; accentColor: string; isActive: boolean; order: number };

// ─── SECTION CONFIG MODAL ────────────────────────────────────────────────────

function ConfigModal({ section, onSave, onClose }: { section: Section; onSave: (config: Record<string, unknown>, label: string) => void; onClose: () => void }) {
  const meta = SECTION_META[section.slug];
  const [label, setLabel] = useState(section.label);
  const [fields, setFields] = useState<Record<string, unknown>>({ ...section.config });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#222] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div>
            <p className="text-xs font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>Configurar sección</p>
            <p className="text-[10px] text-[#444] mt-0.5">{section.slug}</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-[#444] hover:text-white transition-colors" /></button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Nombre en admin</label>
            <input value={label} onChange={e => setLabel(e.target.value)} className="w-full px-3 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50" />
          </div>
          {meta?.configFields?.map(f => (
            <div key={f.key}>
              <label className="text-[11px] text-[#666] block mb-1">{f.label}</label>
              <input
                type={f.type === "number" ? "number" : "text"}
                value={String(fields[f.key] ?? f.default)}
                onChange={e => setField(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50"
              />
            </div>
          ))}
          <div>
            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Config JSON (avanzado)</p>
            <textarea value={raw} onChange={e => handleRaw(e.target.value)} rows={5} className="w-full px-3 py-2 text-xs font-mono bg-[#080808] border border-[#1a1a1a] text-[#888] rounded-lg focus:outline-none resize-none" spellCheck={false} />
            {rawErr && <p className="text-[10px] text-[#ff4545] mt-1">{rawErr}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#1a1a1a]">
          <button onClick={onClose} className="px-4 py-2 text-xs text-[#555] hover:text-[#888] uppercase tracking-wider">Cancelar</button>
          <button onClick={() => !rawErr && onSave(fields, label)} disabled={!!rawErr} className="flex items-center gap-2 px-4 py-2 bg-[#00ff66] text-black text-xs font-black uppercase tracking-widest rounded disabled:opacity-30" style={{ fontFamily: "var(--font-display)" }}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#222] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-xs font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
            {isEdit ? "Editar banner" : "Nuevo banner"}
          </p>
          <button onClick={onClose}><X className="w-4 h-4 text-[#444] hover:text-white transition-colors" /></button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Preview */}
          {imageUrl && (
            <div className="relative h-28 rounded-lg overflow-hidden border border-[#1a1a1a] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}15, #0a0a0a)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="preview" className="h-full max-h-24 object-contain" />
              <div className="absolute bottom-2 left-3">
                <p className="text-[10px] font-bold" style={{ color: accent }}>{subtitle || "Subtítulo"}</p>
                <p className="text-sm font-black text-white">{title || "Título"}</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Título *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="RTX 4090 — La GPU definitiva" className="w-full px-3 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50 placeholder-[#333]" />
          </div>

          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Subtítulo / Marca</label>
            <input value={subtitle} onChange={e => setSub(e.target.value)} placeholder="NVIDIA / AMD / Intel" className="w-full px-3 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50 placeholder-[#333]" />
          </div>

          <ImageUploader value={imageUrl} onChange={url => setImg(url)} folder="banners" label="Imagen del banner *" />

          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">Link destino *</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#333]" />
              <input value={href} onChange={e => setHref(e.target.value)} placeholder="/productos/rtx-4090 o https://..." className="w-full pl-9 pr-4 py-2 text-sm bg-[#111] border border-[#222] text-white rounded-lg focus:outline-none focus:border-[#00ff66]/50 placeholder-[#333]" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-2">Color de acento</label>
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
            style={{ fontFamily: "var(--font-display)" }}
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

  const inv = () => utils.content.bannersAdmin.invalidate();

  const createBanner  = trpc.content.createBanner.useMutation({ onSuccess: inv });
  const updateBanner  = trpc.content.updateBanner.useMutation({ onSuccess: inv });
  const deleteBanner  = trpc.content.deleteBanner.useMutation({ onSuccess: inv });
  const reorderBanners = trpc.content.reorderBanners.useMutation({ onSuccess: inv });

  // Drag state
  const dragIdx = useRef<number | null>(null);

  function onDragStart(i: number) { dragIdx.current = i; }
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#444]">
          {banners.length === 0
            ? "Sin banners — se muestran productos destacados como fallback"
            : `${banners.length} banner${banners.length !== 1 ? "s" : ""} · arrastra para reordenar`}
        </p>
        <button
          onClick={() => setModalBanner({})}
          className="flex items-center gap-2 px-3 py-2 bg-[#00ff66] text-black text-xs font-black uppercase tracking-widest rounded"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo banner
        </button>
      </div>

      {banners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-[#1a1a1a] rounded-xl gap-3 text-center">
          <ImageIcon className="w-8 h-8 text-[#1a1a1a]" />
          <p className="text-xs text-[#2a2a2a]">Crea tu primer banner para reemplazar el fallback de productos destacados</p>
          <button onClick={() => setModalBanner({})} className="text-[10px] text-[#00ff66] border border-[#00ff66]/30 px-3 py-1.5 rounded hover:bg-[#00ff66]/5 transition-colors uppercase tracking-wider">
            + Crear banner
          </button>
        </div>
      )}

      <div className="space-y-2">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="flex items-center gap-3 p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] cursor-grab active:cursor-grabbing hover:border-[#252525] transition-all"
          >
            <GripVertical className="w-4 h-4 text-[#1e1e1e] flex-shrink-0" />

            {/* Image preview */}
            <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-[#1a1a1a] bg-[#080808] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-contain p-1" onError={e => { e.currentTarget.style.display = "none"; }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: banner.accentColor }} />
                <p className="text-sm font-semibold text-white truncate">{banner.title}</p>
              </div>
              {banner.subtitle && <p className="text-[10px] text-[#444] mt-0.5 truncate">{banner.subtitle}</p>}
              <p className="text-[9px] font-mono text-[#2a2a2a] mt-0.5 truncate">{banner.href}</p>
            </div>

            {/* Active badge */}
            <span className={`flex-shrink-0 text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${banner.isActive ? "text-[#00ff66] border-[#00ff66]/25 bg-[#00ff66]/5" : "text-[#333] border-[#1a1a1a]"}`}>
              {banner.isActive ? "Activo" : "Oculto"}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => updateBanner.mutate({ id: banner.id, isActive: !banner.isActive })}
                className="p-1.5 text-[#333] hover:text-[#888] transition-colors"
                title={banner.isActive ? "Ocultar" : "Mostrar"}
              >
                {banner.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setModalBanner(banner)} className="p-1.5 text-[#333] hover:text-[#00ff66] transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { if (confirm("¿Eliminar este banner?")) deleteBanner.mutate({ id: banner.id }); }}
                className="p-1.5 text-[#333] hover:text-[#ff4545] transition-colors"
              >
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

function SectionsTab() {
  const utils = trpc.useUtils();
  const { data: sections = [], isLoading } = trpc.content.homepageSectionsAdmin.useQuery();
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const inv = () => utils.content.homepageSectionsAdmin.invalidate();

  const toggleVisibility = trpc.content.toggleSectionVisibility.useMutation({ onSuccess: inv });
  const reorderMutation  = trpc.content.reorderSections.useMutation({ onSuccess: inv });
  const updateSection    = trpc.content.updateSection.useMutation({
    onSuccess: (_, v) => { inv(); setSavedId(v.id); setTimeout(() => setSavedId(null), 2000); setEditSection(null); },
  });

  // Drag state
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function onDragStart(i: number) { dragIdx.current = i; }
  function onDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOver(i); }
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

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#111] animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#444]">Arrastra para reordenar · Activa o desactiva secciones sin necesidad de código</p>

      <div className="space-y-2">
        {sections.map((section, i) => {
          const meta = SECTION_META[section.slug];
          const config = section.config as Record<string, unknown>;
          const isDragTarget = dragOver === i;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => onDrop(i)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                isDragTarget
                  ? "border-[#00ff66]/40 bg-[#00ff66]/[0.03]"
                  : section.isVisible
                  ? "border-[#1a1a1a] bg-[#0d0d0d]"
                  : "border-[#111] bg-[#080808] opacity-50"
              }`}
            >
              <GripVertical className="w-4 h-4 text-[#252525] flex-shrink-0" />

              {/* Order badge */}
              <div className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-[#111] border border-[#1a1a1a]">
                <span className="text-[10px] font-mono text-[#444]">{i + 1}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white">{section.label}</p>
                  <span className="text-[9px] font-mono text-[#333] border border-[#1a1a1a] px-1.5 py-0.5 rounded">{section.slug}</span>
                  {savedId === section.id && <span className="text-[9px] text-[#00ff66]">✓ guardado</span>}
                </div>
                <p className="text-[11px] text-[#444] mt-0.5">{meta?.description}</p>
                {Object.keys(config).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {Object.entries(config).slice(0, 3).map(([k, v]) =>
                      typeof v !== "object" ? (
                        <span key={k} className="text-[9px] font-mono text-[#333] bg-[#111] border border-[#1a1a1a] px-1.5 py-0.5 rounded">{k}: {String(v)}</span>
                      ) : null
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditSection(section as Section)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] text-[#444] hover:text-[#888] border border-[#1a1a1a] hover:border-[#252525] rounded transition-all uppercase tracking-wider"
                >
                  <Settings className="w-3 h-3" /> Config
                </button>
                <button
                  onClick={() => toggleVisibility.mutate({ id: section.id })}
                  disabled={toggleVisibility.isPending}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] border rounded transition-all uppercase tracking-wider ${
                    section.isVisible
                      ? "text-[#00ff66] border-[#00ff66]/25 bg-[#00ff66]/5 hover:bg-[#00ff66]/10"
                      : "text-[#444] border-[#1a1a1a] hover:border-[#252525]"
                  }`}
                >
                  {section.isVisible ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Oculto</>}
                </button>
              </div>
            </div>
          );
        })}
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

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
            Homepage
          </h1>
          <p className="text-xs text-[#444] mt-0.5">Secciones · Banners · Orden</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#444] hover:text-[#00ff66] transition-colors border border-[#1a1a1a] px-3 py-1.5 rounded">
          <ExternalLink className="w-3.5 h-3.5" /> Ver homepage
        </a>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a1a1a]">
        {(["sections", "banners"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
              tab === t
                ? "text-[#00ff66] border-[#00ff66]"
                : "text-[#444] border-transparent hover:text-[#666]"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t === "sections" ? "Secciones" : "Banners"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "sections" ? <SectionsTab /> : <BannersTab />}
    </div>
  );
}
