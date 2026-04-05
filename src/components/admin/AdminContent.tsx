"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { BlockType } from "@prisma/client";

// ─── ZONE CATALOG ─────────────────────────────────────────────────────────────

const ZONES = [
  // Homepage
  {
    group: "Homepage",
    id: "announcement_bar",
    label: "Barra de anuncio",
    desc: "Aparece arriba del navbar en todas las páginas",
    types: ["ANNOUNCEMENT"] as BlockType[],
  },
  {
    group: "Homepage",
    id: "homepage_live",
    label: "Stock ticker",
    desc: "Scroll horizontal de productos con stock en tiempo real",
    types: ["STOCK_TICKER"] as BlockType[],
  },
  {
    group: "Homepage",
    id: "homepage_dual",
    label: "Dual audience",
    desc: "Bifurcación Gamer / AI Developer — el elemento más diferenciador",
    types: ["DUAL_AUDIENCE"] as BlockType[],
  },
  {
    group: "Homepage",
    id: "homepage_editorial",
    label: "Editorial spotlight",
    desc: "Artículo / recomendación editorial — reemplaza los banners genéricos",
    types: ["EDITORIAL"] as BlockType[],
  },
  {
    group: "Homepage",
    id: "homepage_ai",
    label: "IA capability",
    desc: "Qué puede hacer tu GPU con modelos de IA locales",
    types: ["AI_CAPABILITY"] as BlockType[],
  },
  {
    group: "Homepage",
    id: "homepage_promo",
    label: "Promo / Countdown",
    desc: "Banner de oferta o cuenta regresiva — solo cuando hay oferta real",
    types: ["PROMO_BANNER", "COUNTDOWN"] as BlockType[],
  },
  {
    group: "Homepage",
    id: "homepage_community",
    label: "Build comunitario",
    desc: "Build del mes de la comunidad con historia del builder",
    types: ["COMMUNITY_BUILD"] as BlockType[],
  },
  {
    group: "Homepage",
    id: "homepage_quiz",
    label: "Quiz de orientación",
    desc: "3 preguntas → recomendación de build personalizada",
    types: ["QUIZ_FLOW"] as BlockType[],
  },
  // Páginas de producto
  {
    group: "Producto",
    id: "pdp_benchmark",
    label: "Benchmark grid",
    desc: "Tabla de rendimiento por juego y resolución (GPU/CPU pages)",
    types: ["BENCHMARK_GRID"] as BlockType[],
  },
  {
    group: "Producto",
    id: "pdp_ai",
    label: "IA en producto",
    desc: "Qué modelos corre esta GPU — aparece en páginas de producto",
    types: ["AI_CAPABILITY"] as BlockType[],
  },
  // Flujo de compra
  {
    group: "Compra",
    id: "builder_notice",
    label: "Aviso builder",
    desc: "Mensaje informativo dentro del configurador 3D",
    types: ["ANNOUNCEMENT", "PROMO_BANNER"] as BlockType[],
  },
  {
    group: "Compra",
    id: "cart_upsell",
    label: "Upsell carrito",
    desc: "Producto o promo sugerida encima del carrito",
    types: ["PROMO_BANNER", "PRODUCT_SPOT"] as BlockType[],
  },
  {
    group: "Compra",
    id: "checkout_notice",
    label: "Aviso checkout",
    desc: "Aviso o cuenta regresiva durante el proceso de pago",
    types: ["ANNOUNCEMENT", "COUNTDOWN"] as BlockType[],
  },
];

// ─── BLOCK LABELS ─────────────────────────────────────────────────────────────

const BLOCK_LABELS: Record<BlockType, string> = {
  ANNOUNCEMENT:   "Anuncio",
  PROMO_BANNER:   "Banner promo",
  PRODUCT_SPOT:   "Producto destacado",
  COUNTDOWN:      "Cuenta regresiva",
  EDITORIAL:      "Editorial",
  BENCHMARK_GRID: "Benchmark",
  AI_CAPABILITY:  "IA capability",
  COMMUNITY_BUILD:"Build comunidad",
  DUAL_AUDIENCE:  "Dual audience",
  STOCK_TICKER:   "Stock ticker",
  QUIZ_FLOW:      "Quiz",
};

// ─── DEFAULT DATA TEMPLATES ───────────────────────────────────────────────────

function defaultData(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "ANNOUNCEMENT":
      return { text: "Nuevo anuncio de Compuelite", variant: "sale", dismissible: true, linkLabel: "Ver más", linkHref: "/productos" };

    case "PROMO_BANNER":
      return { eyebrow: "Oferta especial", title: "Título de la promo", subtitle: "Subtítulo descriptivo de la oferta", ctaLabel: "Ver oferta", ctaHref: "/productos", layout: "full", accentColor: "#00ff66" };

    case "PRODUCT_SPOT":
      return { productId: "", productName: "Nombre del producto", productSlug: "slug-del-producto", productPrice: 499990, badge: "Destacado" };

    case "COUNTDOWN":
      return { title: "Oferta por tiempo limitado", subtitle: "Solo hasta agotar stock", endsAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString(), ctaLabel: "Aprovechar", ctaHref: "/productos", accentColor: "#00ff66" };

    case "EDITORIAL":
      return {
        category: "GPU Guide",
        headline: "El mejor valor en GPUs mid-range este mes",
        deck: "Analizamos el mercado y te decimos qué comprar sin arrepentirte — con datos reales, no specs del fabricante.",
        readTime: 5,
        ctaLabel: "Leer análisis",
        ctaHref: "/productos?categoria=gpu",
        layout: "full",
        accentColor: "#00ff66",
      };

    case "BENCHMARK_GRID":
      return {
        title: "Rendimiento en juegos AAA",
        subtitle: "Datos promedio en Ultra / High según resolución",
        source: "Compuelite Labs 2025",
        resolutions: [
          {
            label: "1080p",
            games: [
              { name: "Cyberpunk 2077", entries: [{ productName: "RTX 5070", productSlug: "rtx-5070", fps: 142, preset: "Ultra" }, { productName: "RX 9070 XT", productSlug: "rx-9070-xt", fps: 138, preset: "Ultra" }] },
              { name: "Black Myth: Wukong", entries: [{ productName: "RTX 5070", productSlug: "rtx-5070", fps: 167 }, { productName: "RX 9070 XT", productSlug: "rx-9070-xt", fps: 159 }] },
            ],
          },
          {
            label: "1440p",
            games: [
              { name: "Cyberpunk 2077", entries: [{ productName: "RTX 5070", productSlug: "rtx-5070", fps: 98, preset: "Ultra" }, { productName: "RX 9070 XT", productSlug: "rx-9070-xt", fps: 94, preset: "Ultra" }] },
              { name: "Black Myth: Wukong", entries: [{ productName: "RTX 5070", productSlug: "rtx-5070", fps: 112 }, { productName: "RX 9070 XT", productSlug: "rx-9070-xt", fps: 108 }] },
            ],
          },
          {
            label: "4K",
            games: [
              { name: "Cyberpunk 2077", entries: [{ productName: "RTX 5070", productSlug: "rtx-5070", fps: 58, preset: "Ultra" }, { productName: "RX 9070 XT", productSlug: "rx-9070-xt", fps: 54, preset: "Ultra" }] },
              { name: "Black Myth: Wukong", entries: [{ productName: "RTX 5070", productSlug: "rtx-5070", fps: 65 }, { productName: "RX 9070 XT", productSlug: "rx-9070-xt", fps: 60 }] },
            ],
          },
        ],
      };

    case "AI_CAPABILITY":
      return {
        headline: "Corre IA de última generación sin depender de la nube",
        deck: "Con una GPU mid-range puedes tener un asistente de IA privado, generar imágenes y más — todo local, todo tuyo.",
        accentColor: "#4488ff",
        ctaLabel: "Ver GPUs compatibles",
        ctaHref: "/productos?categoria=gpu",
        capabilities: [
          { model: "Llama 3.1 8B", metric: "45 tok/seg", useCase: "Chat, código, análisis", icon: "llm" },
          { model: "Llama 3.3 70B (Q4)", metric: "12 tok/seg", useCase: "Razonamiento avanzado", icon: "llm" },
          { model: "Stable Diffusion 3.5", metric: "4 img/min", useCase: "Generación de imágenes 1024px", icon: "image" },
          { model: "Wan 2.1 (720p)", metric: "2 min/video", useCase: "Generación de video", icon: "video" },
          { model: "Whisper Large v3", metric: "10× real-time", useCase: "Transcripción y traducción", icon: "audio" },
          { model: "Qwen2.5-Coder 32B", metric: "18 tok/seg", useCase: "Asistente de código experto", icon: "code" },
        ],
      };

    case "COMMUNITY_BUILD":
      return {
        builderName: "Matías González",
        builderCity: "Santiago, Chile",
        buildName: "Silent Powerhouse",
        buildSlug: "share-xxxx",
        story: "Quería un equipo silencioso para trabajar y jugar en la misma máquina. Prioridad: temperatura baja, buena relación precio/rendimiento y espacio para IA local.",
        totalPrice: 1450000,
        highlights: ["65°C bajo carga máxima", "120fps en 1440p", "Corre Llama 3.1 70B Q4"],
        components: [
          { type: "CPU", name: "Ryzen 7 9700X" },
          { type: "GPU", name: "RX 9070 XT 16GB" },
          { type: "RAM", name: "64GB DDR5 6000MHz" },
          { type: "Storage", name: "2TB NVMe Gen5" },
        ],
      };

    case "DUAL_AUDIENCE":
      return {
        leftLabel: "PC Gamer",
        leftHref: "/builder?profile=gaming",
        leftDesc: "Arma tu setup para streaming, competitivo o inmersión total en mundos abiertos.",
        leftAccent: "#00ff66",
        leftBullets: ["120+ fps en 1440p garantizados", "Compatible con G-Sync y FreeSync", "Asesoría de compatibilidad incluida"],
        rightLabel: "AI Workstation",
        rightHref: "/builder?profile=ai",
        rightDesc: "Hardware optimizado para LLMs locales, Stable Diffusion, fine-tuning y desarrollo con CUDA.",
        rightAccent: "#4488ff",
        rightBullets: ["+16GB VRAM recomendados", "Soporte CUDA 12.x nativo", "Verificamos compatibilidad con PyTorch"],
      };

    case "STOCK_TICKER":
      return {
        title: "Movimiento de precios esta semana",
        items: [
          { productSlug: "rtx-5070", productName: "RTX 5070 12GB", currentStock: 8, price: 899990, priceChange: -50000 },
          { productSlug: "rx-9070-xt", productName: "RX 9070 XT 16GB", currentStock: 3, price: 839990, daysLow: true },
          { productSlug: "ryzen-7-9700x", productName: "Ryzen 7 9700X", currentStock: 12, price: 349990, priceChange: -20000 },
          { productSlug: "rtx-5080", productName: "RTX 5080 16GB", currentStock: 1, price: 1699990 },
          { productSlug: "ddr5-32gb", productName: "DDR5 32GB 6000MHz", currentStock: 20, price: 89990, priceChange: -10000 },
        ],
      };

    case "QUIZ_FLOW":
      return {
        headline: "¿Qué PC necesitas?",
        deck: "3 preguntas. Te mostramos el build perfecto para ti.",
        accentColor: "#00ff66",
        steps: [
          {
            question: "¿Para qué usas principalmente tu PC?",
            options: [
              { label: "Gaming competitivo", icon: "🎯", value: "comp", desc: "FPS, estrategia, battle royale" },
              { label: "Gaming inmersivo", icon: "🌍", value: "open", desc: "RPGs, mundos abiertos, 4K" },
              { label: "Creación de contenido", icon: "🎬", value: "create", desc: "Video, streaming, diseño" },
              { label: "IA / Desarrollo", icon: "🤖", value: "ai", desc: "LLMs, código, ML" },
            ],
          },
          {
            question: "¿Cuál es tu presupuesto aproximado?",
            options: [
              { label: "Hasta $600.000", value: "budget", desc: "Performance sólido sin sacrificar calidad" },
              { label: "$600k — $1.200.000", value: "mid", desc: "El sweet spot del mercado actual" },
              { label: "$1.200.000 — $2.000.000", value: "high", desc: "Sin compromisos" },
              { label: "Más de $2.000.000", value: "ultra", desc: "Lo mejor disponible hoy" },
            ],
          },
          {
            question: "¿Qué resolución/monitor tienes o quieres?",
            options: [
              { label: "1080p / 144Hz+", icon: "🏎️", value: "1080", desc: "Máximos FPS, mínima latencia" },
              { label: "1440p / 165Hz+", icon: "⚡", value: "1440", desc: "El equilibrio perfecto hoy" },
              { label: "4K / 60Hz+", icon: "🎨", value: "4k", desc: "Calidad visual máxima" },
            ],
          },
        ],
        outcomes: {
          "comp-budget-1080": { label: "PC Competitivo Entry", href: "/builder?preset=comp-entry", desc: "Ryzen 5 + RX 7600 — máximos FPS a 1080p sin desperdiciar presupuesto." },
          "comp-mid-1080": { label: "PC Competitivo Pro", href: "/builder?preset=comp-pro", desc: "Ryzen 7 + RTX 5070 — domina en cualquier juego competitivo." },
          "open-high-1440": { label: "PC Gaming 1440p Premium", href: "/builder?preset=gaming-1440", desc: "Ryzen 9 + RX 9070 XT — inmersión total sin compromisos." },
          "ai-mid-1080": { label: "AI Workstation Mid", href: "/builder?preset=ai-mid", desc: "Ryzen 7 + RTX 5070 — suficiente VRAM para modelos 70B en Q4." },
          "ai-high-1440": { label: "AI Workstation Pro", href: "/builder?preset=ai-pro", desc: "Ryzen 9 + RTX 5080 — corre los modelos más grandes sin cuantizar." },
          "create-mid-1440": { label: "Creator Build", href: "/builder?preset=creator", desc: "Ryzen 9 + RTX 5070 — renders rápidos y streaming de calidad." },
        },
      };
  }
}

// ─── BLOCK ROW ────────────────────────────────────────────────────────────────

function BlockRow({
  block,
  onRefetch,
}: {
  block: {
    id: string; type: BlockType; label: string | null;
    active: boolean; order: number; data: unknown;
    startsAt: Date | null; endsAt: Date | null;
  };
  onRefetch: () => void;
}) {
  const toggle = trpc.content.toggleActive.useMutation({ onSuccess: onRefetch });
  const del    = trpc.content.delete.useMutation({ onSuccess: onRefetch });

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      block.active ? "border-[#00ff66]/20 bg-[#00ff66]/[0.03]" : "border-[#1a1a1a] bg-[#0f0f0f]"
    }`}>
      <span className="text-[10px] font-mono text-[#333] w-5 text-center flex-shrink-0">{block.order}</span>

      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#1a1a1a] text-[#444] flex-shrink-0">
        {BLOCK_LABELS[block.type]}
      </span>

      <p className="flex-1 text-sm text-[#888] truncate">{block.label ?? "Sin nombre"}</p>

      {(block.startsAt || block.endsAt) && (
        <span className="text-[10px] text-[#333] hidden md:block flex-shrink-0">
          {block.startsAt ? new Date(block.startsAt).toLocaleDateString("es-CL") : "∞"}
          {" — "}
          {block.endsAt ? new Date(block.endsAt).toLocaleDateString("es-CL") : "∞"}
        </span>
      )}

      {/* Toggle */}
      <button
        onClick={() => toggle.mutate({ id: block.id })}
        disabled={toggle.isPending}
        className={`flex-shrink-0 w-8 h-4 rounded-full transition-all relative ${block.active ? "bg-[#00ff66]/40" : "bg-[#222]"}`}
        title={block.active ? "Desactivar" : "Activar"}
      >
        <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${block.active ? "left-4 bg-[#00ff66]" : "left-0.5 bg-[#555]"}`} />
      </button>

      {/* Delete */}
      <button
        onClick={() => { if (confirm(`¿Eliminar "${block.label ?? block.type}"?`)) del.mutate({ id: block.id }); }}
        disabled={del.isPending}
        className="flex-shrink-0 text-[#2a2a2a] hover:text-[#ff4444] transition-colors"
        title="Eliminar"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── CREATE FORM ──────────────────────────────────────────────────────────────

function CreateBlockForm({ zone, onSuccess }: { zone: typeof ZONES[0]; onSuccess: () => void }) {
  const [type, setType]       = useState<BlockType>(zone.types[0]);
  const [label, setLabel]     = useState("");
  const [dataRaw, setDataRaw] = useState(() => JSON.stringify(defaultData(zone.types[0]), null, 2));
  const [jsonError, setJsonError] = useState("");
  const [startsAt, setStartsAt]   = useState("");
  const [endsAt, setEndsAt]       = useState("");

  const create = trpc.content.create.useMutation({
    onSuccess: () => { setLabel(""); setStartsAt(""); setEndsAt(""); onSuccess(); },
  });

  function handleTypeChange(t: BlockType) {
    setType(t);
    setDataRaw(JSON.stringify(defaultData(t), null, 2));
    setJsonError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(dataRaw); }
    catch { setJsonError("JSON inválido — revisa la sintaxis"); return; }
    setJsonError("");
    create.mutate({
      zone: zone.id, type, data: parsed,
      label: label || undefined, active: false, order: 0,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt:   endsAt   ? new Date(endsAt).toISOString()   : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl border border-[#00ff66]/20 bg-[#00ff66]/[0.02]">
      <p className="text-xs font-bold uppercase tracking-wider text-[#00ff66] mb-3">Nuevo bloque</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#333] mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as BlockType)}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#888] focus:border-[#333] outline-none"
          >
            {zone.types.map((t) => <option key={t} value={t}>{BLOCK_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#333] mb-1">Nombre interno</label>
          <input
            type="text" value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="Ej: Black Friday GPU"
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#888] placeholder:text-[#2a2a2a] focus:border-[#333] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#333] mb-1">Inicio (opcional)</label>
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#888] focus:border-[#333] outline-none" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#333] mb-1">Fin (opcional)</label>
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#888] focus:border-[#333] outline-none" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] uppercase tracking-wider text-[#333]">Datos JSON</label>
          <button
            type="button"
            onClick={() => { setDataRaw(JSON.stringify(defaultData(type), null, 2)); setJsonError(""); }}
            className="text-[10px] text-[#333] hover:text-[#555] transition-colors underline underline-offset-2"
          >
            Resetear template
          </button>
        </div>
        <textarea
          value={dataRaw} onChange={(e) => { setDataRaw(e.target.value); setJsonError(""); }}
          rows={10}
          className="w-full bg-[#080808] border border-[#1a1a1a] rounded-lg px-3 py-2 text-[11px] font-mono text-[#666] focus:border-[#333] outline-none resize-none"
          spellCheck={false}
        />
        {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
      </div>

      <button
        type="submit" disabled={create.isPending}
        className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
        style={{ background: "#00ff66", color: "#000", fontFamily: "var(--font-display)" }}
      >
        {create.isPending ? "Creando..." : "Crear bloque"}
      </button>
    </form>
  );
}

// ─── ZONE PANEL ───────────────────────────────────────────────────────────────

function ZonePanel({ zone }: { zone: typeof ZONES[0] }) {
  const [showCreate, setShowCreate] = useState(false);
  const { data: blocks, refetch } = trpc.content.list.useQuery({ zone: zone.id });

  return (
    <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">{zone.label}</h3>
          <p className="text-xs text-[#333] mt-0.5">{zone.desc}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#2a2a2a] font-mono">{blocks?.length ?? 0} bloques</span>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              showCreate
                ? "border-[#00ff66]/30 text-[#00ff66] bg-[#00ff66]/[0.05]"
                : "border-[#1a1a1a] text-[#444] hover:text-[#00ff66] hover:border-[#00ff66]/30"
            }`}
          >
            {showCreate ? "Cancelar" : "+ Añadir"}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {blocks?.length === 0 && !showCreate && (
          <p className="text-xs text-[#2a2a2a] text-center py-6">Sin bloques — pulsa Añadir para crear el primero.</p>
        )}
        {blocks?.map((block) => (
          <BlockRow
            key={block.id}
            block={{
              ...block,
              data: block.data,
              startsAt: block.startsAt ? new Date(block.startsAt) : null,
              endsAt:   block.endsAt   ? new Date(block.endsAt)   : null,
            }}
            onRefetch={refetch}
          />
        ))}
        {showCreate && (
          <div className="pt-2">
            <CreateBlockForm zone={zone} onSuccess={() => { setShowCreate(false); refetch(); }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const GROUPS = Array.from(new Set(ZONES.map((z) => z.group)));

export function AdminContent() {
  const [activeGroup, setActiveGroup] = useState(GROUPS[0]);

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-widest text-[#00ff66] mb-1">Admin · Compuelite</p>
        <h1 className="text-2xl font-black text-white uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Contenido editorial
        </h1>
        <p className="text-sm text-[#444] mt-1 max-w-lg">
          Gestiona banners, editoriales, benchmarks, IA y promos por zona. Bloques inactivos no se muestran. Los que tienen fechas se activan automáticamente.
        </p>
      </div>

      {/* Group tabs */}
      <div className="flex gap-1 p-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl mb-6 w-fit">
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeGroup === g ? "bg-[#00ff66] text-black" : "text-[#333] hover:text-[#888]"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Zone panels */}
      <div className="space-y-5">
        {ZONES.filter((z) => z.group === activeGroup).map((zone) => (
          <ZonePanel key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
}
