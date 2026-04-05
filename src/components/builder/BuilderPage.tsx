"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ComponentType } from "@prisma/client";
import {
  useBuilderStore,
  BUILD_STEPS,
  STEP_META,
  checkCompatibility,
  type BuildStep,
  type SelectedComponent,
} from "@/stores/builderStore";
import { useCartStore } from "@/stores/cartStore";

// ─── UTILS ───────────────────────────────────────────────────────────────────

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

type Product = {
  id: string;
  name: string;
  brand: string;
  price: { toNumber: () => number } | number;
  sku: string;
  stock: number;
  specs: Record<string, unknown> | null;
  images: { url: string }[];
};

function getPrice(p: Product) {
  return typeof p.price === "object" ? p.price.toNumber() : Number(p.price);
}

function getSpecPills(step: BuildStep, specs: Record<string, unknown> | null): string[] {
  if (!specs) return [];
  switch (step) {
    case "GPU":        return [specs.vram, specs.tdp ? `${specs.tdp}W` : null].filter(Boolean) as string[];
    case "CPU":        return [specs.cores ? `${specs.cores} núcleos` : null, specs.boost_clock, specs.socket].filter(Boolean) as string[];
    case "MOTHERBOARD":return [specs.socket, specs.chipset, specs.form_factor].filter(Boolean) as string[];
    case "RAM":        return [specs.capacity, specs.type, specs.speed?.toString()].filter(Boolean) as string[];
    case "STORAGE":    return [specs.capacity, specs.read].filter(Boolean) as string[];
    case "CPU_COOLER": return [specs.type, specs.tdp ? `≤${specs.tdp}W` : null].filter(Boolean) as string[];
    case "PSU":        return [specs.wattage ? `${specs.wattage}W` : null, specs.efficiency].filter(Boolean) as string[];
    case "CASE":       return [specs.form_factor, specs.max_gpu_length ? `GPU ≤${specs.max_gpu_length}` : null].filter(Boolean) as string[];
    default:           return [];
  }
}

function getIncompatibilityReason(
  step: BuildStep,
  specs: Record<string, unknown> | null,
  components: ReturnType<typeof useBuilderStore.getState>["components"]
): string | null {
  if (!specs) return null;

  if (step === "MOTHERBOARD" && components.CPU) {
    const cpuSocket = components.CPU.specs?.socket as string;
    const mbSocket = specs.socket as string;
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket)
      return `Requiere socket ${mbSocket} (CPU es ${cpuSocket})`;
  }
  if (step === "CPU" && components.MOTHERBOARD) {
    const mbSocket = components.MOTHERBOARD.specs?.socket as string;
    const cpuSocket = specs.socket as string;
    if (mbSocket && cpuSocket && mbSocket !== cpuSocket)
      return `Requiere socket ${cpuSocket} (placa es ${mbSocket})`;
  }
  if (step === "PSU" && (components.GPU || components.CPU)) {
    const psuWatts = (specs.wattage as number) ?? 0;
    const gpuTdp = (components.GPU?.specs?.tdp as number) ?? 0;
    const cpuTdp = (components.CPU?.specs?.tdp as number) ?? 0;
    const required = gpuTdp + cpuTdp + 100;
    if (psuWatts > 0 && psuWatts < required)
      return `Insuficiente: necesitas ~${required}W`;
  }
  if (step === "CPU_COOLER" && components.CASE) {
    const coolerH = Number((specs.height as string)?.replace("mm", "").trim());
    const caseMax = Number((components.CASE.specs?.max_cooler_height as string)?.replace("mm", "").trim());
    if (coolerH && caseMax && coolerH > caseMax)
      return `Muy alto: ${coolerH}mm (máx ${caseMax}mm en el gabinete)`;
  }
  return null;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

const STEP_SVG: Record<BuildStep, React.ReactNode> = {
  GPU:         <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1H3zm0 2h14v8H3V6zm2 2v4h4V8H5zm6 0v4h4V8h-4z"/></svg>,
  CPU:         <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7 3a1 1 0 00-1 1v1H5a2 2 0 00-2 2v6a2 2 0 002 2h1v1a1 1 0 102 0v-1h4v1a1 1 0 102 0v-1h1a2 2 0 002-2V7a2 2 0 00-2-2h-1V4a1 1 0 10-2 0v1H8V4a1 1 0 00-1-1zM5 7h10v6H5V7zm2 2v2h2V9H7zm4 0v2h2V9h-2z"/></svg>,
  MOTHERBOARD: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1v12h12V4H4zm2 2h8v2H6V6zm0 4h4v2H6v-2zm6 0h2v2h-2v-2z"/></svg>,
  RAM:         <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 6a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm2 1v6h10V7H5zm2 1h2v4H7V8zm4 0h2v4h-2V8z"/></svg>,
  STORAGE:     <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0v2h10V5H5zm0 4v6h10V9H5zm2 1h6v2H7v-2z"/></svg>,
  CPU_COOLER:  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4zm0 2a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z"/></svg>,
  PSU:         <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M11 3a1 1 0 10-2 0v1H8a1 1 0 00-.8.4l-2 2.667A1 1 0 005 8v5a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-.2-.6l-2-2.667A1 1 0 0012 4h-1V3zm-1 4a3 3 0 110 6 3 3 0 010-6zm0 2a1 1 0 100 2 1 1 0 000-2z"/></svg>,
  CASE:        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4zm1 2h10v10H5V5zm2 2v6h2V7H7zm4 0v2h2V7h-2z"/></svg>,
};

// ─── PRODUCT ROW ─────────────────────────────────────────────────────────────

function ProductRow({
  product,
  step,
  selected,
  incompatibleReason,
  onSelect,
  onHover,
}: {
  product: Product;
  step: BuildStep;
  selected: boolean;
  incompatibleReason: string | null;
  onSelect: () => void;
  onHover: (p: Product | null) => void;
}) {
  const price = getPrice(product);
  const inStock = product.stock > 0;
  const pills = getSpecPills(step, product.specs);
  const isIncompat = !!incompatibleReason && !selected;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(product)}
      onMouseLeave={() => onHover(null)}
      disabled={isIncompat}
      title={incompatibleReason ?? undefined}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-l-2 group/row ${
        selected
          ? "border-[#00ff66] bg-[#00ff66]/[0.04]"
          : isIncompat
          ? "border-transparent opacity-35 cursor-not-allowed"
          : "border-transparent hover:border-[#252525] hover:bg-white/[0.015]"
      }`}
    >
      {/* Radio */}
      <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? "border-[#00ff66]" : "border-[#2a2a2a]"
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-[#00ff66]" />}
      </div>

      {/* Image */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg border overflow-hidden bg-[#080808] transition-colors ${
        selected ? "border-[#00ff66]/20" : "border-[#1a1a1a]"
      }`}>
        {product.images[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain p-1.5" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2a2a2a]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug truncate ${selected ? "text-white" : "text-[#aaa]"}`}>
          {product.name}
        </p>
        <p className="text-[11px] text-[#444] mt-0.5">{product.brand}</p>
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {pills.slice(0, 3).map((pill) => (
              <span key={pill} className="text-[10px] font-mono text-[#444] bg-[#111] border border-[#1a1a1a] px-1.5 py-0.5 rounded">
                {pill}
              </span>
            ))}
          </div>
        )}
        {incompatibleReason && (
          <p className="text-[10px] text-[#ff4545]/70 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {incompatibleReason}
          </p>
        )}
      </div>

      {/* Stock only — no individual component prices shown */}
      <div className="flex-shrink-0 text-right">
        <span className={`text-[10px] ${inStock ? "text-[#444]" : "text-[#ff4545]/50"}`}>
          {inStock ? `${product.stock} en stock` : "Sin stock"}
        </span>
      </div>
    </button>
  );
}

// ─── SECTION ─────────────────────────────────────────────────────────────────

function BuilderSection({
  step,
  sectionRef,
  onHoverProduct,
}: {
  step: BuildStep;
  sectionRef: (el: HTMLElement | null) => void;
  onHoverProduct: (p: Product | null) => void;
}) {
  const meta = STEP_META[step];
  const [onlyInStock, setOnlyInStock] = useState(false);
  const { components, selectComponent, removeComponent } = useBuilderStore();
  const selected = components[step];

  const { data: products, isLoading } = trpc.builder.productsByType.useQuery({
    componentType: meta.componentType as ComponentType,
    onlyInStock,
    limit: 50,
  });

  const handleSelect = useCallback(
    (p: Product) => {
      const price = getPrice(p);
      if (selected?.productId === p.id) {
        removeComponent(step);
      } else {
        selectComponent(step, {
          productId: p.id,
          name: p.name,
          brand: p.brand,
          price,
          sku: p.sku,
          imageUrl: p.images[0]?.url,
          specs: p.specs ?? undefined,
        } as SelectedComponent);
      }
    },
    [selected, step, selectComponent, removeComponent]
  );

  return (
    <section ref={sectionRef} id={`section-${step}`} className="border-b border-[#141414]">
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between sticky top-0 bg-[#080808]/95 backdrop-blur-sm z-10 border-b border-[#111]">
        <div className="flex items-center gap-2.5">
          <span className="text-[#00ff66]">{STEP_SVG[step]}</span>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
              {meta.label}
            </h2>
            <p className="text-[10px] text-[#383838]">{meta.description}</p>
          </div>
          {meta.optional && (
            <span className="text-[9px] text-[#383838] border border-[#1a1a1a] rounded px-1.5 py-0.5 uppercase tracking-wider ml-1">
              opcional
            </span>
          )}
        </div>
        {/* Solo en stock toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] text-[#383838]">En stock</span>
          <div
            className={`w-7 h-3.5 rounded-full transition-colors relative cursor-pointer ${onlyInStock ? "bg-[#00ff66]/20" : "bg-[#1a1a1a]"}`}
            onClick={() => setOnlyInStock((v) => !v)}
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${onlyInStock ? "left-3.5 bg-[#00ff66]" : "left-0.5 bg-[#333]"}`} />
          </div>
        </label>
      </div>

      {/* Products */}
      <div className="divide-y divide-[#0d0d0d]">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-4 h-4 rounded-full bg-[#1a1a1a] animate-pulse" />
                <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-[#1a1a1a] rounded animate-pulse" />
                  <div className="h-2 w-24 bg-[#141414] rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-[#1a1a1a] rounded animate-pulse" />
              </div>
            ))
          : products?.length === 0
          ? (
            <div className="px-5 py-8 text-center text-xs text-[#333]">
              Sin productos disponibles
            </div>
          )
          : products?.map((p) => {
              const incompatReason = getIncompatibilityReason(step, p.specs as Record<string, unknown> | null, components);
              return (
                <ProductRow
                  key={p.id}
                  product={p as Product}
                  step={step}
                  selected={selected?.productId === p.id}
                  incompatibleReason={incompatReason}
                  onSelect={() => handleSelect(p as Product)}
                  onHover={onHoverProduct}
                />
              );
            })}
      </div>
    </section>
  );
}

// ─── RIGHT PANEL ─────────────────────────────────────────────────────────────

function BuilderSummary({
  hoveredProduct,
  hoveredStep,
  onScrollTo,
}: {
  hoveredProduct: Product | null;
  hoveredStep: BuildStep | null;
  onScrollTo: (step: BuildStep) => void;
}) {
  const { components, totalPrice, reset } = useBuilderStore();
  const { addItem } = useCartStore();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareBuild = trpc.builder.shareBuild.useMutation({
    onSuccess: ({ slug }) => {
      const url = `${window.location.origin}/builds/${slug}`;
      setShareUrl(url);
      navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    },
  });

  const handleShare = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return;
    }
    const items = BUILD_STEPS.flatMap((step) => {
      const c = components[step];
      if (!c) return [];
      return [{ productId: c.productId, componentType: STEP_META[step].componentType }];
    });
    if (items.length === 0) return;
    shareBuild.mutate({ components: items });
  };

  const issues = checkCompatibility(components);
  const selectedCount = Object.keys(components).length;
  const requiredSteps = BUILD_STEPS.filter((s) => !STEP_META[s].optional);
  const requiredDone = requiredSteps.filter((s) => components[s]).length;

  const handleAddToCart = () => {
    Object.values(components).forEach((c) => {
      if (!c) return;
      addItem({ productId: c.productId, name: c.name, brand: c.brand, price: c.price, sku: c.sku, imageUrl: c.imageUrl });
    });
    setAdded(true);
    setTimeout(() => router.push("/carrito"), 600);
  };

  // If hovering a product, show preview
  if (hoveredProduct && hoveredStep) {
    const price = getPrice(hoveredProduct);
    const pills = getSpecPills(hoveredStep, hoveredProduct.specs);
    const img = hoveredProduct.images[0]?.url;
    return (
      <div className="flex flex-col h-full">
        {/* Preview image */}
        <div className="aspect-square bg-[#060606] overflow-hidden flex-shrink-0 border-b border-[#111]">
          {img ? (
            <img src={img} alt={hoveredProduct.name} className="w-full h-full object-contain p-8" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
          )}
        </div>
        {/* Product info */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <p className="text-[10px] text-[#383838] uppercase tracking-widest">{hoveredProduct.brand}</p>
          <p className="text-sm font-medium text-white leading-snug">{hoveredProduct.name}</p>
          {/* Spec pills */}
          <div className="flex flex-wrap gap-1.5">
            {pills.map((pill) => (
              <span key={pill} className="text-[10px] font-mono text-[#555] bg-[#111] border border-[#1a1a1a] px-2 py-1 rounded">
                {pill}
              </span>
            ))}
          </div>
          <div className="pt-2 border-t border-[#111]">
            <p className="text-lg font-bold font-mono text-white">{formatCLP(price)}</p>
            <p className="text-[10px] text-[#383838]">
              {hoveredProduct.stock > 0 ? `${hoveredProduct.stock} en stock` : "Sin stock"}
            </p>
          </div>
        </div>
        {/* Footer - show total */}
        <div className="border-t border-[#111] px-5 py-3">
          <p className="text-[10px] text-[#383838]">Total actual</p>
          <p className="text-sm font-bold font-mono text-white">{formatCLP(totalPrice)}</p>
        </div>
      </div>
    );
  }

  // Default: build summary
  return (
    <div className="flex flex-col h-full">
      {/* Total */}
      <div className="px-5 py-4 border-b border-[#111]">
        <p className="text-[10px] text-[#383838] uppercase tracking-widest mb-1">Tu configuración</p>
        <div className="flex items-end justify-between">
          <p className="text-xl font-black text-white font-mono">{formatCLP(totalPrice)}</p>
          <p className="text-[10px] text-[#333]">{requiredDone}/{requiredSteps.length} req.</p>
        </div>
        {/* Progress bar */}
        {totalPrice > 0 && (
          <div className="mt-2.5 h-px bg-[#141414] overflow-hidden">
            <div
              className="h-full bg-[#00ff66] transition-all duration-500"
              style={{ width: `${(requiredDone / requiredSteps.length) * 100}%` }}
            />
          </div>
        )}
        {/* Compatibility issues */}
        {issues.map((issue, i) => (
          <div
            key={i}
            className={`mt-2 text-[10px] flex items-start gap-1.5 px-2.5 py-2 rounded ${
              issue.type === "error"
                ? "bg-[#1a0a0a] border border-[#ff4545]/20 text-[#ff4545]"
                : "bg-[#1a1200] border border-[#f5a623]/20 text-[#f5a623]"
            }`}
          >
            <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {issue.message}
          </div>
        ))}
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#0d0d0d]">
        {BUILD_STEPS.map((step) => {
          const meta = STEP_META[step];
          const sel = components[step];
          return (
            <button
              key={step}
              onClick={() => onScrollTo(step)}
              className="w-full px-5 py-2.5 flex items-center gap-3 hover:bg-white/[0.015] transition-colors text-left"
            >
              {sel?.imageUrl ? (
                <img src={sel.imageUrl} alt="" className="w-7 h-7 object-contain flex-shrink-0 opacity-80" />
              ) : (
                <span className={sel ? "text-[#00ff66]" : "text-[#252525]"}>{STEP_SVG[step]}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#333] uppercase tracking-wider">{meta.label}</p>
                {sel ? (
                  <p className="text-[11px] text-[#777] truncate">{sel.name}</p>
                ) : (
                  <p className="text-[11px] text-[#252525] italic">{meta.optional ? "Opcional" : "Sin elegir"}</p>
                )}
              </div>
              {/* Individual component prices hidden — total shown at footer */}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-5 py-4 border-t border-[#111] space-y-2">
        <button
          onClick={handleAddToCart}
          disabled={selectedCount === 0 || added || issues.filter((i) => i.type === "error").length > 0}
          className="w-full py-3 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00e85c] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {added ? "Agregado ✓" : `Armar PC (${selectedCount} piezas)`}
        </button>
        {issues.filter((i) => i.type === "error").length > 0 && (
          <p className="text-[10px] text-[#ff4545]/60 text-center">Resuelve incompatibilidades antes de continuar</p>
        )}

        {/* Share */}
        {selectedCount > 0 && (
          <button
            onClick={handleShare}
            disabled={shareBuild.isPending}
            className="w-full py-2 border border-[#1a1a1a] rounded-lg text-[10px] text-[#444] hover:text-[#888] hover:border-[#252525] transition-all uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {shareBuild.isPending ? "Generando..." : copied ? "¡Link copiado!" : shareUrl ? "Copiar link" : "Compartir build"}
          </button>
        )}

        <button onClick={reset} className="w-full py-1.5 text-[10px] text-[#2a2a2a] hover:text-[#444] transition-colors uppercase tracking-widest">
          Reiniciar
        </button>
      </div>
    </div>
  );
}

// ─── NAV ITEM ─────────────────────────────────────────────────────────────────

function NavItem({ step, isActive, onClick }: { step: BuildStep; isActive: boolean; onClick: () => void }) {
  const { components } = useBuilderStore();
  const meta = STEP_META[step];
  const sel = components[step];
  const isSelected = !!sel;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all border-l-2 ${
        isActive
          ? "border-[#00ff66] bg-[#00ff66]/[0.03] text-white"
          : "border-transparent text-[#444] hover:text-[#666] hover:bg-white/[0.02]"
      }`}
    >
      <span className={isSelected ? "text-[#00ff66]" : isActive ? "text-[#555]" : "text-[#252525]"}>
        {STEP_SVG[step]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate">{meta.label}</p>
        {sel && <p className="text-[9px] text-[#383838] truncate">{sel.brand}</p>}
      </div>
      {isSelected && <div className="w-1 h-1 rounded-full bg-[#00ff66] flex-shrink-0" />}
    </button>
  );
}

// ─── PERIPHERAL CARD ──────────────────────────────────────────────────────────

function PeripheralCard({ product }: { product: { id: string; name: string; brand: string; price: unknown; slug: string; images: { url: string }[] } }) {
  const price = typeof product.price === "object" && product.price !== null && "toNumber" in product.price
    ? (product.price as { toNumber: () => number }).toNumber()
    : Number(product.price);

  return (
    <Link href={`/productos/${product.slug}`} className="group flex-shrink-0 w-44 flex flex-col bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#252525] transition-all">
      <div className="aspect-square bg-[#080808] overflow-hidden">
        {product.images[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[9px] text-[#383838] uppercase tracking-wider">{product.brand}</p>
        <p className="text-[11px] text-[#888] group-hover:text-white transition-colors line-clamp-2 mt-0.5 leading-snug">{product.name}</p>
        <p className="text-sm font-bold font-mono text-white mt-2">{formatCLP(price)}</p>
      </div>
    </Link>
  );
}

// ─── MOBILE STEP BAR ─────────────────────────────────────────────────────────

function MobileStepBar({
  activeStep,
  onSelect,
}: {
  activeStep: BuildStep;
  onSelect: (step: BuildStep) => void;
}) {
  const { components } = useBuilderStore();
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active pill into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeStep]);

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none" style={{ scrollbarWidth: "none" }}>
      {BUILD_STEPS.map((step) => {
        const meta = STEP_META[step];
        const selected = !!components[step];
        const isActive = step === activeStep;
        return (
          <button
            key={step}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(step)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
              isActive
                ? "bg-white text-black border-white"
                : selected
                ? "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30"
                : "bg-transparent text-[#444] border-[#1a1a1a] hover:border-[#252525] hover:text-[#666]"
            }`}
            style={{ fontFamily: isActive ? "var(--font-display)" : undefined }}
          >
            {selected && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" />}
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── MOBILE BOTTOM BAR ───────────────────────────────────────────────────────

function MobileBottomBar({ onOpenSummary }: { onOpenSummary: () => void }) {
  const { components, totalPrice } = useBuilderStore();
  const selectedCount = Object.keys(components).length;
  const issues = checkCompatibility(components);
  const hasErrors = issues.some((i) => i.type === "error");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-[#141414] px-4 py-3 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-[10px] text-[#444] uppercase tracking-widest">Total</p>
        <p className="text-lg font-black font-mono text-white">{
          new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(totalPrice)
        }</p>
      </div>
      {hasErrors && (
        <div className="w-2 h-2 rounded-full bg-[#ff4545] flex-shrink-0" title="Incompatibilidades" />
      )}
      <button
        onClick={onOpenSummary}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#00ff66] text-black text-xs font-black uppercase tracking-wider rounded-lg"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Resumen
        {selectedCount > 0 && (
          <span className="bg-black/20 px-1.5 py-0.5 rounded-full text-[10px]">{selectedCount}</span>
        )}
      </button>
    </div>
  );
}

// ─── MOBILE SUMMARY SHEET ────────────────────────────────────────────────────

function MobileSummarySheet({
  open,
  onClose,
  onScrollTo,
}: {
  open: boolean;
  onClose: () => void;
  onScrollTo: (step: BuildStep) => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={onClose}
        />
      )}
      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-[#1a1a1a] rounded-t-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85dvh", display: "flex", flexDirection: "column" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#252525]" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <BuilderSummary
            hoveredProduct={null}
            hoveredStep={null}
            onScrollTo={(step) => { onScrollTo(step); onClose(); }}
          />
        </div>
      </div>
    </>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export function BuilderPage() {
  const { activeStep, setActiveStep } = useBuilderStore();
  const sectionRefs = useRef<Partial<Record<BuildStep, HTMLElement>>>({});
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [hoveredStep, setHoveredStep] = useState<BuildStep | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: peripherals } = trpc.builder.peripheralRecommendations.useQuery({ limit: 8 });

  const setSectionRef = useCallback(
    (step: BuildStep) => (el: HTMLElement | null) => {
      if (el) sectionRefs.current[step] = el;
    },
    []
  );

  const scrollToSection = useCallback((step: BuildStep) => {
    sectionRefs.current[step]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveStep(step);
  }, [setActiveStep]);

  // Scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const step = entry.target.id.replace("section-", "") as BuildStep;
            if (BUILD_STEPS.includes(step)) setActiveStep(step);
          }
        }
      },
      { threshold: 0.25, rootMargin: "-48px 0px 0px 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [setActiveStep]);

  const handleHoverProduct = useCallback((step: BuildStep) => (p: Product | null) => {
    setHoveredProduct(p);
    setHoveredStep(p ? step : null);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#080808] overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 h-11 border-b border-[#111] flex items-center px-5 gap-3 bg-[#080808] z-10">
        <Link href="/" className="text-[#333] hover:text-[#666] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-px h-3.5 bg-[#1a1a1a]" />
        <span className="text-xs font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
          PC Builder
        </span>
        <span className="hidden sm:inline text-[11px] text-[#2a2a2a]">— Arma tu equipo</span>
      </header>

      {/* Mobile step scroller (hidden on md+) */}
      <div className="md:hidden flex-shrink-0 border-b border-[#111] bg-[#060606]">
        <MobileStepBar activeStep={activeStep} onSelect={scrollToSection} />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left nav — desktop only */}
        <nav className="hidden md:block flex-shrink-0 w-48 border-r border-[#111] overflow-y-auto bg-[#060606]">
          <div className="py-4">
            <p className="px-4 mb-2 text-[9px] text-[#252525] uppercase tracking-widest">Componentes</p>
            {BUILD_STEPS.map((step) => (
              <NavItem
                key={step}
                step={step}
                isActive={activeStep === step}
                onClick={() => scrollToSection(step)}
              />
            ))}
          </div>
        </nav>

        {/* Center — scrollable sections */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
          {BUILD_STEPS.map((step) => (
            <BuilderSection
              key={step}
              step={step}
              sectionRef={setSectionRef(step)}
              onHoverProduct={handleHoverProduct(step)}
            />
          ))}

          {/* Peripheral recommendations */}
          {peripherals && peripherals.length > 0 && (
            <section className="px-5 py-8 border-t border-[#111]">
              <p className="text-[10px] text-[#333] uppercase tracking-widest mb-1">También considera</p>
              <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
                Completa tu setup
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {peripherals.map((p) => (
                  <PeripheralCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
          <div className="h-6" />
        </main>

        {/* Right panel — desktop only */}
        <aside className="hidden md:block flex-shrink-0 w-72 border-l border-[#111] overflow-hidden bg-[#060606]">
          <BuilderSummary
            hoveredProduct={hoveredProduct}
            hoveredStep={hoveredStep}
            onScrollTo={scrollToSection}
          />
        </aside>
      </div>

      {/* Mobile bottom bar + summary sheet */}
      <div className="md:hidden">
        <MobileBottomBar onOpenSummary={() => setSheetOpen(true)} />
        <MobileSummarySheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onScrollTo={scrollToSection}
        />
      </div>
    </div>
  );
}
