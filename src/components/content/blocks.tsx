"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface AnnouncementData {
  text: string;
  linkLabel?: string;
  linkHref?: string;
  variant?: "default" | "sale" | "info" | "warning";
  dismissible?: boolean;
}

export interface PromoBannerData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  accentColor?: string;
  imageUrl?: string;
  layout?: "full" | "compact";
}

export interface ProductSpotData {
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  productPrice: number;
  badge?: string;
  ctaLabel?: string;
}

export interface CountdownData {
  title: string;
  subtitle?: string;
  endsAt: string;
  ctaLabel?: string;
  ctaHref?: string;
  accentColor?: string;
}

export interface EditorialData {
  category: string;
  headline: string;
  deck: string;
  bodyHtml?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  readTime?: number;
  accentColor?: string;
  layout?: "full" | "compact";
}

export interface BenchmarkEntry {
  productName: string;
  productSlug: string;
  fps: number;
  preset?: string;
}

export interface BenchmarkGame {
  name: string;
  entries: BenchmarkEntry[];
}

export interface BenchmarkGridData {
  title: string;
  subtitle?: string;
  resolutions: Array<{
    label: "1080p" | "1440p" | "4K";
    games: BenchmarkGame[];
  }>;
  source?: string;
}

export interface AiCapabilityItem {
  model: string;
  metric: string;
  useCase: string;
  icon: "llm" | "image" | "video" | "audio" | "code";
}

export interface AiCapabilityData {
  headline: string;
  deck?: string;
  productSlug?: string;
  productName?: string;
  capabilities: AiCapabilityItem[];
  ctaLabel?: string;
  ctaHref?: string;
  accentColor?: string;
}

export interface CommunityBuildData {
  builderName: string;
  builderCity: string;
  buildName: string;
  buildSlug: string;
  story: string;
  imageUrl?: string;
  totalPrice: number;
  highlights: string[];
  components?: Array<{ type: string; name: string }>;
}

export interface DualAudienceData {
  leftLabel: string;
  leftHref: string;
  leftDesc: string;
  leftBullets?: string[];
  leftImageUrl?: string;
  leftAccent?: string;
  rightLabel: string;
  rightHref: string;
  rightDesc: string;
  rightBullets?: string[];
  rightImageUrl?: string;
  rightAccent?: string;
}

export interface StockTickerItem {
  productSlug: string;
  productName: string;
  productImage?: string;
  currentStock: number;
  price: number;
  priceChange?: number;
  daysLow?: boolean;
}

export interface StockTickerData {
  title?: string;
  items: StockTickerItem[];
}

export interface QuizOption {
  label: string;
  icon?: string;
  value: string;
  desc?: string;
}

export interface QuizStep {
  question: string;
  options: QuizOption[];
}

export interface QuizOutcome {
  label: string;
  href: string;
  desc?: string;
}

export interface QuizFlowData {
  headline: string;
  deck?: string;
  steps: QuizStep[];
  outcomes: Record<string, QuizOutcome>;
  accentColor?: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── ANNOUNCEMENT BAR ─────────────────────────────────────────────────────────

export function AnnouncementBlock({ data }: { data: AnnouncementData }) {
  const [dismissed, setDismissed] = useState(false);

  const VARIANT_STYLES = {
    default: { bg: "bg-[#0f0f0f]", text: "text-[#888]", accent: "text-[#00ff66]", border: "border-[#1a1a1a]" },
    sale:    { bg: "bg-[#00ff66]/[0.06]", text: "text-[#aaa]", accent: "text-[#00ff66]", border: "border-[#00ff66]/20" },
    info:    { bg: "bg-[#4488ff]/[0.06]", text: "text-[#aaa]", accent: "text-[#4488ff]", border: "border-[#4488ff]/20" },
    warning: { bg: "bg-[#f5a623]/[0.06]", text: "text-[#aaa]", accent: "text-[#f5a623]", border: "border-[#f5a623]/20" },
  };

  const v = VARIANT_STYLES[data.variant ?? "default"];
  if (dismissed) return null;

  return (
    <div className={`w-full border-b ${v.bg} ${v.border} px-4 py-2.5`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-xs relative">
        <p className={v.text}>
          {data.text}
          {data.linkHref && data.linkLabel && (
            <Link href={data.linkHref} className={`ml-2 font-semibold underline underline-offset-2 ${v.accent}`}>
              {data.linkLabel}
            </Link>
          )}
        </p>
        {data.dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-0 text-[#333] hover:text-[#666] transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PROMO BANNER ─────────────────────────────────────────────────────────────

export function PromoBannerBlock({ data }: { data: PromoBannerData }) {
  const accent = data.accentColor ?? "#00ff66";
  const isCompact = data.layout === "compact";

  if (isCompact) {
    return (
      <div
        className="mx-4 my-4 rounded-xl border overflow-hidden flex items-center gap-4 px-5 py-4"
        style={{ borderColor: `${accent}25`, background: `${accent}08` }}
      >
        {data.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.imageUrl} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {data.eyebrow && <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: accent }}>{data.eyebrow}</p>}
          <p className="text-sm font-bold text-white truncate">{data.title}</p>
          {data.subtitle && <p className="text-xs text-[#555] truncate">{data.subtitle}</p>}
        </div>
        {data.ctaLabel && data.ctaHref && (
          <Link
            href={data.ctaHref}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
            style={{ background: accent, color: "#000", fontFamily: "var(--font-display)" }}
          >
            {data.ctaLabel}
          </Link>
        )}
      </div>
    );
  }

  return (
    <section className="px-4 py-6">
      <div
        className="max-w-7xl mx-auto rounded-2xl border overflow-hidden relative"
        style={{ borderColor: `${accent}20`, background: `linear-gradient(135deg, ${accent}08 0%, transparent 60%)` }}
      >
        <div className="px-8 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center gap-6">
          {data.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.imageUrl} alt="" className="w-24 h-24 md:w-32 md:h-32 object-contain flex-shrink-0" />
          )}
          <div className="flex-1">
            {data.eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>
                {data.eyebrow}
              </p>
            )}
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {data.title}
            </h2>
            {data.subtitle && <p className="text-sm text-[#888] max-w-lg">{data.subtitle}</p>}
          </div>
          {(data.ctaLabel || data.ctaSecondaryLabel) && (
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              {data.ctaLabel && data.ctaHref && (
                <Link
                  href={data.ctaHref}
                  className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95"
                  style={{ background: accent, color: "#000", fontFamily: "var(--font-display)" }}
                >
                  {data.ctaLabel}
                </Link>
              )}
              {data.ctaSecondaryLabel && data.ctaSecondaryHref && (
                <Link
                  href={data.ctaSecondaryHref}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-[#888] border border-[#222] hover:border-[#333] hover:text-white transition-all"
                >
                  {data.ctaSecondaryLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── PRODUCT SPOTLIGHT ────────────────────────────────────────────────────────

export function ProductSpotBlock({ data }: { data: ProductSpotData }) {
  return (
    <Link
      href={`/productos/${data.productSlug}`}
      className="group mx-4 my-4 flex items-center gap-4 px-4 py-3.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl hover:border-[#252525] transition-all"
    >
      {data.productImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.productImage} alt={data.productName} className="w-14 h-14 object-contain flex-shrink-0 group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-14 h-14 bg-[#111] rounded-lg flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        {data.badge && (
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 mb-1 uppercase tracking-wider">
            {data.badge}
          </span>
        )}
        <p className="text-sm font-medium text-white truncate group-hover:text-[#00ff66] transition-colors">{data.productName}</p>
        <p className="text-base font-bold font-mono text-white mt-0.5">{formatCLP(data.productPrice)}</p>
      </div>
      <svg className="w-4 h-4 text-[#333] group-hover:text-[#00ff66] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────

function useCountdown(endsAt: string) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const calc = () => setDiff(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  const totalSeconds = Math.floor(diff / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s, expired: diff === 0 };
}

function Digit({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black font-mono text-white tabular-nums w-10">{String(n).padStart(2, "0")}</div>
      <div className="text-[9px] text-[#444] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

export function CountdownBlock({ data }: { data: CountdownData }) {
  const { d, h, m, s, expired } = useCountdown(data.endsAt);
  const accent = data.accentColor ?? "#00ff66";
  if (expired) return null;
  return (
    <section className="px-4 py-5">
      <div
        className="max-w-7xl mx-auto rounded-2xl border px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ borderColor: `${accent}20`, background: `${accent}06` }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: accent }}>Oferta por tiempo limitado</p>
          <h2 className="text-xl font-black text-white uppercase" style={{ fontFamily: "var(--font-display)" }}>{data.title}</h2>
          {data.subtitle && <p className="text-sm text-[#555] mt-1">{data.subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          <Digit n={d} label="días" />
          <span className="text-[#333] text-xl font-light mb-4 mx-0.5">:</span>
          <Digit n={h} label="hrs" />
          <span className="text-[#333] text-xl font-light mb-4 mx-0.5">:</span>
          <Digit n={m} label="min" />
          <span className="text-[#333] text-xl font-light mb-4 mx-0.5">:</span>
          <Digit n={s} label="seg" />
        </div>
        {data.ctaLabel && data.ctaHref && (
          <Link
            href={data.ctaHref}
            className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 flex-shrink-0"
            style={{ background: accent, color: "#000", fontFamily: "var(--font-display)" }}
          >
            {data.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}

// ─── EDITORIAL ────────────────────────────────────────────────────────────────

export function EditorialBlock({ data }: { data: EditorialData }) {
  const [expanded, setExpanded] = useState(false);
  const accent = data.accentColor ?? "#00ff66";
  const isCompact = data.layout === "compact";

  if (isCompact) {
    return (
      <div className="px-4 py-3">
        <Link
          href={data.ctaHref ?? "#"}
          className="group flex items-start gap-4 px-5 py-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[#252525] transition-all"
        >
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: accent }}>{data.category}</span>
            <h3 className="text-sm font-bold text-white mt-1 group-hover:text-[#00ff66] transition-colors line-clamp-2">{data.headline}</h3>
            <p className="text-xs text-[#555] mt-1 line-clamp-2">{data.deck}</p>
          </div>
          {data.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
          )}
        </Link>
      </div>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative rounded-2xl border overflow-hidden"
          style={{ borderColor: `${accent}18`, background: `linear-gradient(135deg, ${accent}06 0%, transparent 50%)` }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Content side */}
            <div className="flex-1 px-8 py-10 lg:py-12">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  style={{ color: accent, borderColor: `${accent}30`, background: `${accent}10` }}
                >
                  {data.category}
                </span>
                {data.readTime && (
                  <span className="text-[10px] text-[#444] uppercase tracking-wider">{data.readTime} min lectura</span>
                )}
              </div>
              <h2
                className="text-2xl md:text-4xl font-black text-white leading-tight mb-3"
                style={{ fontFamily: "var(--font-display)", textTransform: "uppercase" }}
              >
                {data.headline}
              </h2>
              <p className="text-[#666] leading-relaxed mb-6 max-w-xl">{data.deck}</p>

              {data.bodyHtml && (
                <>
                  {expanded && (
                    <div
                      className="text-sm text-[#555] leading-relaxed mb-6 max-w-xl prose-invert"
                      dangerouslySetInnerHTML={{ __html: data.bodyHtml }}
                    />
                  )}
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-[#444] hover:text-[#888] transition-colors mr-4 underline underline-offset-2"
                  >
                    {expanded ? "Leer menos" : "Leer más"}
                  </button>
                </>
              )}

              {data.ctaLabel && data.ctaHref && (
                <Link
                  href={data.ctaHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95"
                  style={{ background: accent, color: "#000", fontFamily: "var(--font-display)" }}
                >
                  {data.ctaLabel}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Image side */}
            {data.imageUrl && (
              <div className="lg:w-80 xl:w-96 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.imageUrl}
                  alt=""
                  className="w-full h-full object-cover min-h-48"
                  style={{ filter: "brightness(0.7)" }}
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${accent}08, transparent)` }} />
              </div>
            )}
          </div>

          {/* Decorative corner accent */}
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]"
            style={{ background: `radial-gradient(circle at 100% 0%, ${accent}, transparent 70%)` }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── BENCHMARK GRID ───────────────────────────────────────────────────────────

export function BenchmarkGridBlock({ data }: { data: BenchmarkGridData }) {
  const [activeRes, setActiveRes] = useState(0);
  const currentRes = data.resolutions[activeRes];

  if (!currentRes) return null;

  // Collect all unique products
  const allProducts = Array.from(
    new Map(
      currentRes.games.flatMap((g) => g.entries.map((e) => [e.productSlug, e.productName]))
    ).entries()
  );

  function fpsColor(fps: number) {
    if (fps >= 144) return "#00ff66";
    if (fps >= 90)  return "#88dd00";
    if (fps >= 60)  return "#f5a623";
    return "#ff5533";
  }

  function fpsBar(fps: number) {
    return Math.min(100, (fps / 200) * 100);
  }

  return (
    <section className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#00ff66] mb-1">Rendimiento real</p>
            <h2 className="text-xl font-black text-white uppercase" style={{ fontFamily: "var(--font-display)" }}>
              {data.title}
            </h2>
            {data.subtitle && <p className="text-xs text-[#555] mt-1">{data.subtitle}</p>}
          </div>

          {/* Resolution picker */}
          <div className="flex gap-1 p-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl self-start sm:self-auto">
            {data.resolutions.map((r, i) => (
              <button
                key={r.label}
                onClick={() => setActiveRes(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeRes === i ? "bg-[#00ff66] text-black" : "text-[#444] hover:text-[#888]"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="rounded-2xl border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
          {/* Column headers */}
          <div className="grid border-b border-[#1a1a1a]" style={{ gridTemplateColumns: `200px repeat(${allProducts.length}, 1fr)` }}>
            <div className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#333]">Juego / Preset</div>
            {allProducts.map(([slug, name]) => (
              <div key={slug} className="px-3 py-3 text-[10px] uppercase tracking-wider text-[#555] text-center truncate">
                {name}
              </div>
            ))}
          </div>

          {/* Rows */}
          {currentRes.games.map((game, gi) => (
            <div
              key={game.name}
              className={`grid border-b border-[#111] last:border-0`}
              style={{ gridTemplateColumns: `200px repeat(${allProducts.length}, 1fr)` }}
            >
              <div className="px-4 py-4 flex flex-col justify-center">
                <p className="text-sm text-white font-medium">{game.name}</p>
                {game.entries[0]?.preset && (
                  <p className="text-[10px] text-[#444] mt-0.5 uppercase tracking-wider">{game.entries[0].preset}</p>
                )}
              </div>
              {allProducts.map(([slug]) => {
                const entry = game.entries.find((e) => e.productSlug === slug);
                return (
                  <div key={slug} className="px-3 py-4 flex flex-col items-center justify-center gap-1.5">
                    {entry ? (
                      <>
                        <span className="text-lg font-black font-mono" style={{ color: fpsColor(entry.fps) }}>
                          {entry.fps}
                        </span>
                        <span className="text-[9px] text-[#333] uppercase tracking-widest">fps</span>
                        <div className="w-full bg-[#111] rounded-full h-0.5 mt-0.5">
                          <div
                            className="h-0.5 rounded-full transition-all duration-500"
                            style={{ width: `${fpsBar(entry.fps)}%`, background: fpsColor(entry.fps) }}
                          />
                        </div>
                      </>
                    ) : (
                      <span className="text-[#2a2a2a] text-sm">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend + source */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
            {[["#00ff66","≥144 fps"],["#88dd00","≥90 fps"],["#f5a623","≥60 fps"],["#ff5533","<60 fps"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span className="text-[#333]">{l}</span>
              </span>
            ))}
          </div>
          {data.source && <p className="text-[10px] text-[#2a2a2a]">Fuente: {data.source}</p>}
        </div>
      </div>
    </section>
  );
}

// ─── AI CAPABILITY ────────────────────────────────────────────────────────────

const AI_ICONS: Record<AiCapabilityItem["icon"], React.ReactNode> = {
  llm: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  image: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  code: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

export function AiCapabilityBlock({ data }: { data: AiCapabilityData }) {
  const accent = data.accentColor ?? "#4488ff";

  return (
    <section className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-2xl border overflow-hidden relative"
          style={{ borderColor: `${accent}20`, background: `linear-gradient(135deg, #080808 0%, ${accent}08 100%)` }}
        >
          {/* Scan line decoration */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${accent}03 3px, ${accent}03 4px)`,
          }} />

          <div className="relative px-8 py-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
                  <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: accent }}>
                    IA Local
                  </span>
                  {data.productName && (
                    <span className="text-[10px] text-[#333] uppercase tracking-wider">· {data.productName}</span>
                  )}
                </div>
                <h2
                  className="text-xl md:text-2xl font-black text-white uppercase leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {data.headline}
                </h2>
                {data.deck && <p className="text-sm text-[#555] mt-2">{data.deck}</p>}
              </div>

              {data.ctaLabel && data.ctaHref && (
                <Link
                  href={data.ctaHref}
                  className="flex-shrink-0 self-start px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border"
                  style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10`, fontFamily: "var(--font-display)" }}
                >
                  {data.ctaLabel}
                </Link>
              )}
            </div>

            {/* Capability grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all hover:border-opacity-40"
                  style={{ borderColor: `${accent}18`, background: `${accent}06` }}
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    {AI_ICONS[cap.icon]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-white truncate">{cap.model}</p>
                      <span className="text-xs font-black font-mono flex-shrink-0" style={{ color: accent }}>
                        {cap.metric}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#444] uppercase tracking-wider">{cap.useCase}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <p className="text-[10px] text-[#2a2a2a] mt-4">
              Resultados aproximados. Varían según driver, RAM del sistema y modelo de quantización.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── COMMUNITY BUILD ──────────────────────────────────────────────────────────

export function CommunityBuildBlock({ data }: { data: CommunityBuildData }) {
  return (
    <section className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row rounded-2xl border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
          {/* Image */}
          <div className="lg:w-80 xl:w-96 relative bg-[#111] flex-shrink-0 min-h-48">
            {data.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.imageUrl} alt={data.buildName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20">
              Build del mes
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-8 py-8 flex flex-col">
            {/* Builder info */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center text-sm font-black text-[#00ff66]">
                {data.builderName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{data.builderName}</p>
                <p className="text-xs text-[#444]">{data.builderCity}</p>
              </div>
            </div>

            <h3 className="text-xl font-black text-white uppercase mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {data.buildName}
            </h3>
            <p className="text-sm text-[#666] leading-relaxed mb-5 flex-1">{data.story}</p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-2 mb-5">
              {data.highlights.map((h, i) => (
                <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-[#111] border border-[#1a1a1a] text-[#888] uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>

            {/* Components preview */}
            {data.components && data.components.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 mb-5">
                {data.components.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#111] border border-[#1a1a1a] rounded-lg">
                    <span className="text-[9px] uppercase tracking-wider text-[#333] w-12 flex-shrink-0">{c.type}</span>
                    <span className="text-[10px] text-[#666] truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#111]">
              <div>
                <p className="text-[10px] text-[#444] uppercase tracking-wider">Total del build</p>
                <p className="text-lg font-black font-mono text-white">{formatCLP(data.totalPrice)}</p>
              </div>
              <Link
                href={`/builds/${data.buildSlug}`}
                className="px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95"
                style={{ background: "#00ff66", color: "#000", fontFamily: "var(--font-display)" }}
              >
                Ver build
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── DUAL AUDIENCE ────────────────────────────────────────────────────────────

export function DualAudienceBlock({ data }: { data: DualAudienceData }) {
  const leftAccent  = data.leftAccent  ?? "#00ff66";
  const rightAccent = data.rightAccent ?? "#4488ff";

  return (
    <section className="px-4 py-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4">
        {/* Gamer side */}
        <Link
          href={data.leftHref}
          className="group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.01]"
          style={{ borderColor: `${leftAccent}20`, background: `linear-gradient(135deg, ${leftAccent}08 0%, transparent 60%)` }}
        >
          <div className="px-8 py-10">
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: leftAccent }} />
              <span
                className="text-[11px] font-black uppercase tracking-widest"
                style={{ color: leftAccent }}
              >
                Para Gamers
              </span>
            </div>

            <h3
              className="text-3xl md:text-4xl font-black text-white uppercase leading-none mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {data.leftLabel}
            </h3>
            <p className="text-sm text-[#666] mb-6 leading-relaxed">{data.leftDesc}</p>

            {data.leftBullets && (
              <ul className="space-y-2 mb-8">
                {data.leftBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#555]">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: leftAccent }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            )}

            <span
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider"
              style={{ color: leftAccent, fontFamily: "var(--font-display)" }}
            >
              Armar mi PC Gamer
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          {data.leftImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.leftImageUrl}
              alt=""
              className="absolute bottom-0 right-0 w-40 h-40 object-contain opacity-20 group-hover:opacity-30 transition-opacity"
            />
          )}

          {/* Corner glow */}
          <div
            className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"
            style={{ background: leftAccent }}
          />
        </Link>

        {/* AI Dev side */}
        <Link
          href={data.rightHref}
          className="group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.01]"
          style={{ borderColor: `${rightAccent}20`, background: `linear-gradient(135deg, ${rightAccent}08 0%, transparent 60%)` }}
        >
          <div className="px-8 py-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: rightAccent }} />
              <span
                className="text-[11px] font-black uppercase tracking-widest"
                style={{ color: rightAccent }}
              >
                Para AI Devs
              </span>
            </div>

            <h3
              className="text-3xl md:text-4xl font-black text-white uppercase leading-none mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {data.rightLabel}
            </h3>
            <p className="text-sm text-[#666] mb-6 leading-relaxed">{data.rightDesc}</p>

            {data.rightBullets && (
              <ul className="space-y-2 mb-8">
                {data.rightBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#555]">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: rightAccent }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            )}

            <span
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider"
              style={{ color: rightAccent, fontFamily: "var(--font-display)" }}
            >
              Armar mi AI Workstation
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          {data.rightImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.rightImageUrl}
              alt=""
              className="absolute bottom-0 right-0 w-40 h-40 object-contain opacity-20 group-hover:opacity-30 transition-opacity"
            />
          )}

          <div
            className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"
            style={{ background: rightAccent }}
          />
        </Link>
      </div>
    </section>
  );
}

// ─── STOCK TICKER ─────────────────────────────────────────────────────────────

export function StockTickerBlock({ data }: { data: StockTickerData }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function stockColor(n: number) {
    if (n === 0) return "#ff3333";
    if (n <= 3)  return "#f5a623";
    return "#00ff66";
  }

  function stockLabel(n: number) {
    if (n === 0) return "Sin stock";
    if (n <= 3)  return `Solo ${n} disponibles`;
    return "En stock";
  }

  return (
    <section className="px-4 py-4">
      <div className="max-w-7xl mx-auto">
        {data.title && (
          <p className="text-[10px] uppercase tracking-widest text-[#333] mb-3">{data.title}</p>
        )}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {data.items.map((item, i) => (
            <Link
              key={i}
              href={`/productos/${item.productSlug}`}
              className="group flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[#222] transition-all min-w-56"
            >
              {item.productImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.productImage} alt="" className="w-10 h-10 object-contain flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white font-medium truncate group-hover:text-[#00ff66] transition-colors">
                  {item.productName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black font-mono text-white">{formatCLP(item.price)}</span>
                  {item.priceChange !== undefined && item.priceChange !== 0 && (
                    <span
                      className="flex items-center gap-0.5 text-[10px] font-bold"
                      style={{ color: item.priceChange < 0 ? "#00ff66" : "#ff5533" }}
                    >
                      {item.priceChange < 0 ? "▼" : "▲"}
                      {formatCLP(Math.abs(item.priceChange))}
                    </span>
                  )}
                  {item.daysLow && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 uppercase tracking-wider">
                      mín 30d
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="w-1.5 h-1.5 rounded-full ml-auto mb-1" style={{ background: stockColor(item.currentStock) }} />
                <p className="text-[9px] uppercase tracking-wider whitespace-nowrap" style={{ color: stockColor(item.currentStock) }}>
                  {stockLabel(item.currentStock)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── QUIZ FLOW ────────────────────────────────────────────────────────────────

export function QuizFlowBlock({ data }: { data: QuizFlowData }) {
  const [step, setStep]         = useState(0);
  const [answers, setAnswers]   = useState<string[]>([]);
  const [done, setDone]         = useState(false);
  const accent = data.accentColor ?? "#00ff66";

  const currentStep = data.steps[step];
  const totalSteps  = data.steps.length;

  function handleOption(value: string) {
    const next = [...answers, value];
    setAnswers(next);
    if (step + 1 < totalSteps) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  function reset() {
    setStep(0);
    setAnswers([]);
    setDone(false);
  }

  // Determine outcome key by joining answer values
  const outcomeKey = answers.join("-");
  const outcome = data.outcomes[outcomeKey] ?? Object.values(data.outcomes)[0];

  return (
    <section className="px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${accent}20`, background: `linear-gradient(135deg, ${accent}06 0%, transparent 60%)` }}
        >
          <div className="px-8 py-10">
            {!done ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h2
                    className="text-xl md:text-2xl font-black text-white uppercase mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {data.headline}
                  </h2>
                  {data.deck && <p className="text-sm text-[#555]">{data.deck}</p>}
                </div>

                {/* Progress */}
                <div className="flex gap-1.5 mb-8">
                  {data.steps.map((_, i) => (
                    <div
                      key={i}
                      className="h-0.5 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i <= step ? accent : "#1a1a1a" }}
                    />
                  ))}
                </div>

                {/* Question */}
                {currentStep && (
                  <>
                    <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: accent }}>
                      Pregunta {step + 1} de {totalSteps}
                    </p>
                    <h3 className="text-lg font-bold text-white mb-6">{currentStep.question}</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {currentStep.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleOption(opt.value)}
                          className="group text-left px-5 py-4 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] hover:border-opacity-60 transition-all active:scale-[0.98]"
                          style={{ ["--hover-border" as string]: `${accent}40` }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${accent}40`)}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
                        >
                          {opt.icon && <span className="text-2xl mb-2 block">{opt.icon}</span>}
                          <p className="text-sm font-bold text-white group-hover:text-[#00ff66] transition-colors">{opt.label}</p>
                          {opt.desc && <p className="text-xs text-[#444] mt-1">{opt.desc}</p>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Result */
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: `${accent}15`, border: `2px solid ${accent}40` }}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: accent }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: accent }}>Tu recomendación</p>
                <h3 className="text-2xl font-black text-white uppercase mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  {outcome?.label}
                </h3>
                {outcome?.desc && <p className="text-sm text-[#666] mb-8 max-w-sm mx-auto">{outcome.desc}</p>}
                <div className="flex gap-3 justify-center">
                  {outcome?.href && (
                    <Link
                      href={outcome.href}
                      className="px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95"
                      style={{ background: accent, color: "#000", fontFamily: "var(--font-display)" }}
                    >
                      Ver opciones
                    </Link>
                  )}
                  <button
                    onClick={reset}
                    className="px-8 py-3 rounded-xl text-sm font-semibold text-[#555] border border-[#1a1a1a] hover:text-[#888] hover:border-[#222] transition-all"
                  >
                    Volver a empezar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
