"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { BlockType } from "@prisma/client";
import {
  Megaphone, BarChart2, Users, FileText, Cpu,
  Tag, Trophy, HelpCircle, ChevronDown, ChevronUp,
  ShoppingCart, Wrench, CreditCard, Plus, X,
} from "lucide-react";

// ─── ZONE CATALOG ─────────────────────────────────────────────────────────────

const ZONES = [
  {
    group: "Homepage",
    id: "announcement_bar",
    label: "Barra de anuncio",
    desc: "Aparece arriba del navbar en todas las páginas",
    icon: <Megaphone className="w-4 h-4" />,
    color: "#f59e0b",
    what: "Una barra delgada al tope absoluto de la página, antes del menú. Ideal para anunciar envío gratis, descuentos especiales o avisos importantes.",
    example: "«Envío gratis en compras sobre $50.000 este fin de semana»",
    types: ["ANNOUNCEMENT"] as BlockType[],
    mapPos: 0,
  },
  {
    group: "Homepage",
    id: "homepage_live",
    label: "Stock ticker",
    desc: "Scroll horizontal de productos con stock en tiempo real",
    icon: <BarChart2 className="w-4 h-4" />,
    color: "#3b82f6",
    what: "Franja horizontal con precios y stock de productos que se desplaza automáticamente. Genera urgencia mostrando qué hay disponible y a qué precio.",
    example: "«RTX 5070 — $899.990 · 8 en stock ↓ $50.000»",
    types: ["STOCK_TICKER"] as BlockType[],
    mapPos: 1,
  },
  {
    group: "Homepage",
    id: "homepage_dual",
    label: "Gamer vs AI Dev",
    desc: "Bifurcación Gamer / AI Developer — el elemento más diferenciador",
    icon: <Users className="w-4 h-4" />,
    color: "#8b5cf6",
    what: "Dos columnas lado a lado — una para PC Gamer y otra para AI Workstation. El cliente elige su perfil y es llevado al configurador correcto. Muy efectivo para convertir.",
    example: "«PC Gamer → /builder?profile=gaming | AI Workstation → /builder?profile=ai»",
    types: ["DUAL_AUDIENCE"] as BlockType[],
    mapPos: 2,
  },
  {
    group: "Homepage",
    id: "homepage_editorial",
    label: "Editorial",
    desc: "Artículo / recomendación editorial",
    icon: <FileText className="w-4 h-4" />,
    color: "#16a34a",
    what: "Sección de contenido editorial: análisis del mercado, qué comprar este mes, comparativas. Genera confianza mostrando que sabes de lo que hablas.",
    example: "«El mejor valor en GPUs mid-range este mes — con datos reales»",
    types: ["EDITORIAL"] as BlockType[],
    mapPos: 3,
  },
  {
    group: "Homepage",
    id: "homepage_ai",
    label: "IA capability",
    desc: "Qué puede hacer tu GPU con modelos de IA locales",
    icon: <Cpu className="w-4 h-4" />,
    color: "#06b6d4",
    what: "Muestra qué modelos de IA puede correr una GPU localmente (Llama, Stable Diffusion, etc.) con métricas reales. Diferencia tu tienda de las genéricas.",
    example: "«Llama 3.1 8B — 45 tok/seg · Stable Diffusion — 4 img/min»",
    types: ["AI_CAPABILITY"] as BlockType[],
    mapPos: 4,
  },
  {
    group: "Homepage",
    id: "homepage_promo",
    label: "Promo / Countdown",
    desc: "Banner de oferta o cuenta regresiva",
    icon: <Tag className="w-4 h-4" />,
    color: "#ef4444",
    what: "Banner prominente para una oferta puntual, con o sin cuenta regresiva. Desactívalo cuando la oferta termina — sin borrar el contenido.",
    example: "«Black Friday GPU — termina en 2d 14h 30m — Ver oferta»",
    types: ["PROMO_BANNER", "COUNTDOWN"] as BlockType[],
    mapPos: 5,
  },
  {
    group: "Homepage",
    id: "homepage_community",
    label: "Build comunitario",
    desc: "Build del mes de la comunidad",
    icon: <Trophy className="w-4 h-4" />,
    color: "#14b8a6",
    what: "Presenta el build de un cliente real con su historia, componentes y por qué eligió ese setup. Genera comunidad y confianza social.",
    example: "«Matías González, Santiago — Silent Powerhouse: 65°C bajo carga»",
    types: ["COMMUNITY_BUILD"] as BlockType[],
    mapPos: 6,
  },
  {
    group: "Homepage",
    id: "homepage_quiz",
    label: "Quiz de orientación",
    desc: "3 preguntas → recomendación de build personalizada",
    icon: <HelpCircle className="w-4 h-4" />,
    color: "#eab308",
    what: "Quiz interactivo de 3 pasos: uso → presupuesto → resolución. Al final recomienda el build ideal. Muy efectivo para clientes indecisos.",
    example: "«¿Para qué usas tu PC? → ¿Cuál es tu presupuesto? → ¿Qué resolución?»",
    types: ["QUIZ_FLOW"] as BlockType[],
    mapPos: 7,
  },
  {
    group: "Producto",
    id: "pdp_benchmark",
    label: "Benchmark grid",
    desc: "Tabla de FPS por juego y resolución",
    icon: <BarChart2 className="w-4 h-4" />,
    color: "#3b82f6",
    what: "Tabla de rendimiento real en juegos: FPS por resolución (1080p / 1440p / 4K) comparando productos. Aparece en páginas de GPU y CPU.",
    example: "«Cyberpunk 2077 — RTX 5070: 142fps · RX 9070 XT: 138fps @ 1080p Ultra»",
    types: ["BENCHMARK_GRID"] as BlockType[],
    mapPos: 0,
  },
  {
    group: "Producto",
    id: "pdp_ai",
    label: "IA en producto",
    desc: "Qué modelos corre esta GPU específica",
    icon: <Cpu className="w-4 h-4" />,
    color: "#06b6d4",
    what: "Igual que el bloque IA del homepage, pero contextualizado al producto que el cliente está mirando. Aparece en la página de detalle del producto.",
    example: "«Con esta GPU puedes correr Llama 3.3 70B a 12 tok/seg»",
    types: ["AI_CAPABILITY"] as BlockType[],
    mapPos: 1,
  },
  {
    group: "Compra",
    id: "builder_notice",
    label: "Aviso en el configurador",
    desc: "Mensaje dentro del Arma tu PC",
    icon: <Wrench className="w-4 h-4" />,
    color: "#f59e0b",
    what: "Mensaje informativo o promo que aparece mientras el cliente está armando su PC. Puede ser un aviso de compatibilidad, oferta de componentes, etc.",
    example: "«¡Agrega una pantalla y llévate 10% de descuento esta semana!»",
    types: ["ANNOUNCEMENT", "PROMO_BANNER"] as BlockType[],
    mapPos: 0,
  },
  {
    group: "Compra",
    id: "cart_upsell",
    label: "Upsell en el carrito",
    desc: "Producto o promo sugerida en el carrito",
    icon: <ShoppingCart className="w-4 h-4" />,
    color: "#16a34a",
    what: "Aparece encima del resumen del carrito. Sugiere un producto complementario o una promo activa al cliente que está a punto de comprar.",
    example: "«¿Olvidaste el mousepad? Arctic L — $15.990»",
    types: ["PROMO_BANNER", "PRODUCT_SPOT"] as BlockType[],
    mapPos: 1,
  },
  {
    group: "Compra",
    id: "checkout_notice",
    label: "Aviso en el checkout",
    desc: "Aviso o cuenta regresiva durante el pago",
    icon: <CreditCard className="w-4 h-4" />,
    color: "#ef4444",
    what: "Se muestra mientras el cliente ingresa sus datos de pago. Puede ser un aviso de seguridad, una promo de último minuto o una cuenta regresiva.",
    example: "«Precio bloqueado por 15 minutos — completa tu compra ahora»",
    types: ["ANNOUNCEMENT", "COUNTDOWN"] as BlockType[],
    mapPos: 2,
  },
];

const BLOCK_LABELS: Record<BlockType, string> = {
  ANNOUNCEMENT:    "Anuncio de texto",
  PROMO_BANNER:    "Banner de promo",
  PRODUCT_SPOT:    "Producto destacado",
  COUNTDOWN:       "Cuenta regresiva",
  EDITORIAL:       "Artículo editorial",
  BENCHMARK_GRID:  "Tabla de benchmarks",
  AI_CAPABILITY:   "IA capability",
  COMMUNITY_BUILD: "Build de la comunidad",
  DUAL_AUDIENCE:   "Gamer vs AI Dev",
  STOCK_TICKER:    "Stock ticker",
  QUIZ_FLOW:       "Quiz de orientación",
};

const BLOCK_HINTS: Record<BlockType, string> = {
  ANNOUNCEMENT:    "Texto corto. Aparece en una barra o chip.",
  PROMO_BANNER:    "Banner con eyebrow, título, subtítulo y botón CTA.",
  PRODUCT_SPOT:    "Muestra un producto por ID con precio y badge.",
  COUNTDOWN:       "Timer que cuenta regresiva hasta una fecha.",
  EDITORIAL:       "Artículo con categoría, titular, bajada y tiempo de lectura.",
  BENCHMARK_GRID:  "Tabla de FPS por juego y resolución.",
  AI_CAPABILITY:   "Lista de modelos de IA con métricas de velocidad.",
  COMMUNITY_BUILD: "Historia de un cliente con su build y componentes.",
  DUAL_AUDIENCE:   "Dos columnas Gamer / AI con bullets y link a configurador.",
  STOCK_TICKER:    "Franja con precios y stock de productos en movimiento.",
  QUIZ_FLOW:       "Quiz de 3 pasos con recomendación de build al final.",
};

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────

function defaultData(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "ANNOUNCEMENT":
      return { text: "Nuevo anuncio de Compuelite", variant: "sale", dismissible: true, linkLabel: "Ver más", linkHref: "/productos" };
    case "PROMO_BANNER":
      return { eyebrow: "Oferta especial", title: "Título de la promo", subtitle: "Subtítulo descriptivo", ctaLabel: "Ver oferta", ctaHref: "/productos", accentColor: "#16a34a" };
    case "PRODUCT_SPOT":
      return { productId: "", productName: "Nombre del producto", productSlug: "slug-del-producto", productPrice: 499990, badge: "Destacado" };
    case "COUNTDOWN":
      return { title: "Oferta por tiempo limitado", subtitle: "Solo hasta agotar stock", endsAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString(), ctaLabel: "Aprovechar", ctaHref: "/productos", accentColor: "#16a34a" };
    case "EDITORIAL":
      return { category: "GPU Guide", headline: "El mejor valor en GPUs mid-range este mes", deck: "Analizamos el mercado y te decimos qué comprar.", readTime: 5, ctaLabel: "Leer análisis", ctaHref: "/productos?categoria=gpu", accentColor: "#16a34a" };
    case "BENCHMARK_GRID":
      return { title: "Rendimiento en juegos AAA", subtitle: "Datos promedio en Ultra/High según resolución", source: "Compuelite Labs 2025", resolutions: [{ label: "1080p", games: [{ name: "Cyberpunk 2077", entries: [{ productName: "RTX 5070", productSlug: "rtx-5070", fps: 142 }] }] }] };
    case "AI_CAPABILITY":
      return { headline: "Corre IA local sin depender de la nube", deck: "Con una GPU mid-range puedes tener un asistente privado.", accentColor: "#4488ff", ctaLabel: "Ver GPUs compatibles", ctaHref: "/productos?categoria=gpu", capabilities: [{ model: "Llama 3.1 8B", metric: "45 tok/seg", useCase: "Chat, código, análisis" }] };
    case "COMMUNITY_BUILD":
      return { builderName: "Matías González", builderCity: "Santiago, Chile", buildName: "Silent Powerhouse", buildSlug: "share-xxxx", story: "Quería un equipo silencioso para trabajar y jugar.", totalPrice: 1450000, highlights: ["65°C bajo carga", "120fps en 1440p"], components: [{ type: "CPU", name: "Ryzen 7 9700X" }, { type: "GPU", name: "RX 9070 XT 16GB" }] };
    case "DUAL_AUDIENCE":
      return { leftLabel: "PC Gamer", leftHref: "/builder?profile=gaming", leftDesc: "Arma tu setup para streaming y gaming.", leftAccent: "#16a34a", leftBullets: ["120+ fps en 1440p", "Compatible G-Sync/FreeSync"], rightLabel: "AI Workstation", rightHref: "/builder?profile=ai", rightDesc: "Hardware para LLMs locales y CUDA.", rightAccent: "#4488ff", rightBullets: ["+16GB VRAM recomendados", "Soporte CUDA 12.x"] };
    case "STOCK_TICKER":
      return { title: "Movimiento de precios esta semana", items: [{ productSlug: "rtx-5070", productName: "RTX 5070 12GB", currentStock: 8, price: 899990, priceChange: -50000 }] };
    case "QUIZ_FLOW":
      return { headline: "¿Qué PC necesitas?", deck: "3 preguntas. Te mostramos el build perfecto.", accentColor: "#16a34a", steps: [{ question: "¿Para qué usas principalmente tu PC?", options: [{ label: "Gaming", icon: "🎮", value: "gaming" }, { label: "IA / Desarrollo", icon: "🤖", value: "ai" }] }], outcomes: {} };
  }
}

// ─── PAGE MAP ─────────────────────────────────────────────────────────────────

const HOMEPAGE_ZONES_ORDER = [
  { id: "announcement_bar", label: "Barra de anuncio", color: "#f59e0b", height: "h-3" },
  { id: "__nav__",           label: "Menú navegación", color: "#374151", height: "h-4" },
  { id: "__banners__",       label: "Banners (pestaña Homepage)", color: "#6b7280", height: "h-8", faded: true },
  { id: "homepage_live",     label: "Stock ticker", color: "#3b82f6", height: "h-3" },
  { id: "homepage_dual",     label: "Gamer vs AI Dev", color: "#8b5cf6", height: "h-7" },
  { id: "homepage_editorial",label: "Editorial", color: "#16a34a", height: "h-5" },
  { id: "homepage_ai",       label: "IA capability", color: "#06b6d4", height: "h-5" },
  { id: "homepage_promo",    label: "Promo / Countdown", color: "#ef4444", height: "h-4" },
  { id: "homepage_community",label: "Build comunidad", color: "#14b8a6", height: "h-5" },
  { id: "homepage_quiz",     label: "Quiz", color: "#eab308", height: "h-5" },
];

const PRODUCTO_ZONES_ORDER = [
  { id: "__nav__",      label: "Navbar", color: "#374151", height: "h-3" },
  { id: "__imgs__",     label: "Galería + precio (automático)", color: "#6b7280", height: "h-10", faded: true },
  { id: "pdp_benchmark",label: "Benchmark grid", color: "#3b82f6", height: "h-8" },
  { id: "pdp_ai",       label: "IA capability", color: "#06b6d4", height: "h-6" },
  { id: "__related__",  label: "Productos relacionados (automático)", color: "#6b7280", height: "h-5", faded: true },
];

const COMPRA_ZONES_ORDER = [
  { id: "builder_notice",   label: "Aviso en configurador", color: "#f59e0b", height: "h-4" },
  { id: "__builder__",      label: "Configurador (automático)", color: "#6b7280", height: "h-10", faded: true },
  { id: "cart_upsell",      label: "Upsell en carrito", color: "#16a34a", height: "h-5" },
  { id: "__cart__",         label: "Carrito (automático)", color: "#6b7280", height: "h-8", faded: true },
  { id: "checkout_notice",  label: "Aviso en checkout", color: "#ef4444", height: "h-4" },
  { id: "__checkout__",     label: "Formulario pago (automático)", color: "#6b7280", height: "h-8", faded: true },
];

function PageMap({ group, activeZoneId }: { group: string; activeZoneId: string | null }) {
  const zones = group === "Homepage" ? HOMEPAGE_ZONES_ORDER
    : group === "Producto" ? PRODUCTO_ZONES_ORDER
    : COMPRA_ZONES_ORDER;

  return (
    <div className="rounded-xl border border-[#e5e7eb] overflow-hidden bg-white">
      {/* Browser chrome */}
      <div className="bg-[#f3f4f6] border-b border-[#e5e7eb] px-3 py-1.5 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#fca5a5]" />
        <div className="w-2 h-2 rounded-full bg-[#fde68a]" />
        <div className="w-2 h-2 rounded-full bg-[#86efac]" />
        <div className="flex-1 mx-2 bg-white rounded text-[8px] text-[#9ca3af] px-2 py-0.5 font-mono">compuelite.cl</div>
      </div>
      {/* Page simulation */}
      <div className="bg-[#f9fafb] p-2 space-y-1">
        {zones.map((z) => {
          const isEditable = !z.id.startsWith("__");
          const isActive = z.id === activeZoneId;
          return (
            <div key={z.id} className={`rounded flex items-center gap-2 px-1.5 transition-all ${z.height} ${
              isActive ? "ring-2 ring-offset-1 ring-[#374151]" : ""
            } ${z.faded ? "opacity-40" : ""}`}
              style={{ background: `${z.color}18`, border: `1px solid ${z.color}40` }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: z.color }} />
              <span className="text-[8px] font-medium leading-none truncate" style={{ color: z.color }}>
                {z.label}
              </span>
              {!isEditable && (
                <span className="ml-auto text-[7px] text-[#9ca3af] flex-shrink-0">auto</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BLOCK ROW ────────────────────────────────────────────────────────────────

function BlockRow({ block, onRefetch }: {
  block: { id: string; type: BlockType; label: string | null; active: boolean; order: number; data: unknown; startsAt: Date | null; endsAt: Date | null };
  onRefetch: () => void;
}) {
  const toggle = trpc.content.toggleActive.useMutation({ onSuccess: onRefetch });
  const del    = trpc.content.delete.useMutation({ onSuccess: onRefetch });

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      block.active ? "border-[#16a34a]/25 bg-[#f0fdf4]" : "border-[#e5e7eb] bg-[#f9fafb]"
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${block.active ? "bg-[#16a34a]" : "bg-[#d1d5db]"}`} />

      <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#e5e7eb] text-[#6b7280] bg-white flex-shrink-0">
        {BLOCK_LABELS[block.type]}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111827] truncate">{block.label ?? "Sin nombre"}</p>
        {(block.startsAt || block.endsAt) && (
          <p className="text-[10px] text-[#9ca3af]">
            {block.startsAt ? new Date(block.startsAt).toLocaleDateString("es-CL") : "∞"}
            {" → "}
            {block.endsAt ? new Date(block.endsAt).toLocaleDateString("es-CL") : "∞"}
          </p>
        )}
      </div>

      <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
        block.active ? "text-[#16a34a] bg-[#dcfce7]" : "text-[#9ca3af] bg-[#f3f4f6]"
      }`}>
        {block.active ? "Activo" : "Inactivo"}
      </span>

      <button
        onClick={() => toggle.mutate({ id: block.id })}
        disabled={toggle.isPending}
        className={`flex-shrink-0 w-9 h-5 rounded-full transition-all relative ${block.active ? "bg-[#16a34a]" : "bg-[#d1d5db]"}`}
        title={block.active ? "Desactivar" : "Activar"}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${block.active ? "left-4" : "left-0.5"}`} />
      </button>

      <button
        onClick={() => { if (confirm(`¿Eliminar "${block.label ?? block.type}"?`)) del.mutate({ id: block.id }); }}
        disabled={del.isPending}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[#d1d5db] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
        title="Eliminar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── CREATE FORM ──────────────────────────────────────────────────────────────

function CreateBlockForm({ zone, onSuccess }: { zone: typeof ZONES[0]; onSuccess: () => void }) {
  const [type, setType]     = useState<BlockType>(zone.types[0]);
  const [label, setLabel]   = useState("");
  const [dataRaw, setData]  = useState(() => JSON.stringify(defaultData(zone.types[0]), null, 2));
  const [jsonError, setErr] = useState("");
  const [startsAt, setStart]= useState("");
  const [endsAt, setEnd]    = useState("");
  const [showJson, setShowJson] = useState(false);

  const create = trpc.content.create.useMutation({
    onSuccess: () => { setLabel(""); setStart(""); setEnd(""); onSuccess(); },
  });

  function handleTypeChange(t: BlockType) {
    setType(t);
    setData(JSON.stringify(defaultData(t), null, 2));
    setErr("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(dataRaw); } catch { setErr("JSON inválido — revisa la sintaxis"); return; }
    setErr("");
    create.mutate({ zone: zone.id, type, data: parsed, label: label || undefined, active: false, order: 0, startsAt: startsAt ? new Date(startsAt).toISOString() : undefined, endsAt: endsAt ? new Date(endsAt).toISOString() : undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl border border-[#e5e7eb] bg-white">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#111827]">Nuevo bloque</p>
        <p className="text-[10px] text-[#9ca3af]">Se crea inactivo — actívalo cuando esté listo</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Tipo de bloque</label>
          <select value={type} onChange={e => handleTypeChange(e.target.value as BlockType)}
            className="w-full bg-white border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#374151] focus:outline-none focus:border-[#16a34a]/50">
            {zone.types.map(t => <option key={t} value={t}>{BLOCK_LABELS[t]}</option>)}
          </select>
          <p className="text-[10px] text-[#9ca3af] mt-1">{BLOCK_HINTS[type]}</p>
        </div>
        <div>
          <label className="block text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Nombre interno</label>
          <input type="text" value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Ej: Black Friday GPU 2025"
            className="w-full bg-white border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#374151] placeholder:text-[#d1d5db] focus:outline-none focus:border-[#16a34a]/50" />
          <p className="text-[10px] text-[#9ca3af] mt-1">Solo se ve en el admin, no en la tienda.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Publicar desde (opcional)</label>
          <input type="datetime-local" value={startsAt} onChange={e => setStart(e.target.value)}
            className="w-full bg-white border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#374151] focus:outline-none focus:border-[#16a34a]/50" />
        </div>
        <div>
          <label className="block text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Terminar el (opcional)</label>
          <input type="datetime-local" value={endsAt} onChange={e => setEnd(e.target.value)}
            className="w-full bg-white border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#374151] focus:outline-none focus:border-[#16a34a]/50" />
        </div>
      </div>

      {/* JSON editor — collapsed by default */}
      <div>
        <button type="button" onClick={() => setShowJson(!showJson)}
          className="flex items-center gap-2 text-[11px] text-[#6b7280] hover:text-[#374151] transition-colors">
          {showJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Editar contenido (JSON) — el template ya está precargado
        </button>
        {showJson && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[#9ca3af]">Modifica los textos del template. Mantén la estructura.</p>
              <button type="button" onClick={() => { setData(JSON.stringify(defaultData(type), null, 2)); setErr(""); }}
                className="text-[10px] text-[#16a34a] hover:text-[#15803d] transition-colors">
                Resetear template
              </button>
            </div>
            <textarea value={dataRaw} onChange={e => { setData(e.target.value); setErr(""); }} rows={12}
              className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-2 text-[11px] font-mono text-[#374151] focus:outline-none resize-none"
              spellCheck={false} />
            {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          </div>
        )}
      </div>

      <button type="submit" disabled={create.isPending}
        className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors disabled:opacity-50">
        {create.isPending ? "Creando..." : "Crear bloque (inactivo)"}
      </button>
    </form>
  );
}

// ─── ZONE PANEL ───────────────────────────────────────────────────────────────

function ZonePanel({ zone, onHover, isHovered }: { zone: typeof ZONES[0]; onHover: (id: string | null) => void; isHovered: boolean }) {
  const [showCreate, setShowCreate] = useState(false);
  const { data: blocks, refetch } = trpc.content.list.useQuery({ zone: zone.id });

  return (
    <div
      className={`rounded-2xl border bg-white overflow-hidden transition-all ${isHovered ? "border-[#374151] shadow-md" : "border-[#e5e7eb]"}`}
      onMouseEnter={() => onHover(zone.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${zone.color}15`, color: zone.color }}>
          {zone.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-[#111827]">{zone.label}</h3>
            <span className="text-[9px] font-mono text-[#9ca3af] border border-[#e5e7eb] px-1.5 py-0.5 rounded">{zone.id}</span>
            {blocks && blocks.length > 0 && (
              <span className="text-[9px] text-[#6b7280]">{blocks.length} bloque{blocks.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          <p className="text-[11px] text-[#6b7280] mt-0.5">{zone.what}</p>
          <p className="text-[10px] text-[#9ca3af] mt-1 italic">Ej: {zone.example}</p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            showCreate
              ? "border-[#ef4444]/30 text-[#ef4444] bg-[#fef2f2]"
              : "border-[#e5e7eb] text-[#6b7280] hover:text-[#16a34a] hover:border-[#16a34a]/30"
          }`}
        >
          {showCreate ? <><X className="w-3 h-3" /> Cancelar</> : <><Plus className="w-3 h-3" /> Añadir</>}
        </button>
      </div>

      <div className="p-4 space-y-2">
        {(!blocks || blocks.length === 0) && !showCreate && (
          <div className="text-center py-6 border border-dashed border-[#e5e7eb] rounded-xl">
            <p className="text-xs text-[#9ca3af]">Sin bloques activos — esta zona no muestra nada en la tienda</p>
            <button onClick={() => setShowCreate(true)} className="mt-2 text-[10px] text-[#16a34a] hover:underline">
              + Crear el primero
            </button>
          </div>
        )}
        {blocks?.map(block => (
          <BlockRow key={block.id} block={{ ...block, data: block.data, startsAt: block.startsAt ? new Date(block.startsAt) : null, endsAt: block.endsAt ? new Date(block.endsAt) : null }} onRefetch={refetch} />
        ))}
        {showCreate && (
          <div className="pt-1">
            <CreateBlockForm zone={zone} onSuccess={() => { setShowCreate(false); refetch(); }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { n: "1", title: "Elige una zona", body: "Cada zona es un lugar específico en la tienda (la barra del top, el quiz del homepage, el upsell del carrito). Al pasar el cursor sobre una zona, se resalta en el mapa de la página." },
    { n: "2", title: "Añade un bloque", body: "Cada zona puede tener uno o varios bloques con contenido diferente. Un bloque creado empieza inactivo — nadie lo ve todavía." },
    { n: "3", title: "Actívalo cuando esté listo", body: "Cuando quieras que el bloque aparezca en la tienda, activa el toggle. Puedes programar fechas de inicio y fin para que se active solo." },
    { n: "4", title: "Desactívalo sin borrar", body: "Si termina una promo, desactiva el bloque. El contenido queda guardado para la próxima vez. Solo bórralo si ya no lo necesitas nunca más." },
  ];
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e5e7eb]">
        <p className="text-xs font-bold text-[#111827]">¿Cómo funciona el sistema de contenido?</p>
        <p className="text-[11px] text-[#6b7280] mt-0.5">Bloques de contenido editorial que puedes activar y desactivar en cualquier parte de la tienda, sin tocar código</p>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[#e5e7eb]">
        {steps.map(s => (
          <div key={s.n} className="bg-white px-4 py-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[10px] font-black text-[#374151]">{s.n}</span>
              <p className="text-[11px] font-bold text-[#111827]">{s.title}</p>
            </div>
            <p className="text-[11px] text-[#6b7280] leading-relaxed pl-7">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const GROUPS = ["Homepage", "Producto", "Compra"] as const;

export function AdminContent() {
  const [activeGroup, setActiveGroup] = useState<typeof GROUPS[number]>("Homepage");
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const zonesForGroup = ZONES.filter(z => z.group === activeGroup);

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-[#111827] uppercase tracking-wide">Contenido</h1>
        <p className="text-xs text-[#6b7280] mt-1">
          Activa o desactiva bloques de contenido editorial en zonas específicas de la tienda — sin tocar código.
        </p>
      </div>

      {/* How it works */}
      <HowItWorks />

      {/* Group tabs */}
      <div className="flex gap-1 p-1 bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl w-fit">
        {GROUPS.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeGroup === g ? "bg-white text-[#111827] shadow-sm" : "text-[#9ca3af] hover:text-[#374151]"
            }`}>
            {g}
          </button>
        ))}
      </div>

      {/* Map + zones side by side */}
      <div className="grid grid-cols-[180px_1fr] gap-5 items-start">
        {/* Page map */}
        <div className="sticky top-4 space-y-2">
          <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Mapa de la página</p>
          <PageMap group={activeGroup} activeZoneId={hoveredZone} />
          <p className="text-[9px] text-[#d1d5db] leading-tight">
            Pasa el cursor sobre una zona para ver dónde aparece en la página
          </p>
        </div>

        {/* Zone panels */}
        <div className="space-y-4">
          {zonesForGroup.map(zone => (
            <ZonePanel
              key={zone.id}
              zone={zone}
              onHover={setHoveredZone}
              isHovered={hoveredZone === zone.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
