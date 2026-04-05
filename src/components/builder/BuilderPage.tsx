"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ComponentType } from "@prisma/client";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import {
  Check,
  Search,
  ShoppingCart,
  Share2,
  RotateCcw,
  AlertTriangle,
  Zap,
  ChevronLeft,
  Package,
} from "lucide-react";
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

// ─── STEP ICONS (SVG) ────────────────────────────────────────────────────────

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

// ─── ANIMATED PRICE ───────────────────────────────────────────────────────────

function AnimatedPrice({ value }: { value: number }) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 18 });
  const display = useTransform(spring, (v) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v)
  );

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}

// ─── LEFT NAV ─────────────────────────────────────────────────────────────────

function BuilderNav({
  activeStep,
  onSelect,
}: {
  activeStep: BuildStep;
  onSelect: (step: BuildStep) => void;
}) {
  const { components } = useBuilderStore();

  return (
    <nav className="py-4 px-3">
      <p className="px-2 mb-4 text-[9px] text-[#2a2a2a] uppercase tracking-widest font-bold">Componentes</p>
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[22px] top-4 bottom-4 w-px bg-[#1a1a1a]" />

        {BUILD_STEPS.map((step, index) => {
          const meta = STEP_META[step];
          const sel = components[step];
          const isActive = activeStep === step;
          const isDone = !!sel;
          const stepNumber = index + 1;

          return (
            <motion.button
              key={step}
              onClick={() => onSelect(step)}
              className={`relative w-full flex items-center gap-3 px-2 py-2.5 text-left rounded-lg transition-colors mb-0.5 ${
                isActive ? "bg-[#00ff66]/[0.06]" : "hover:bg-white/[0.025]"
              }`}
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Step indicator circle */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  className={`w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? "border-[#00ff66] bg-[#00ff66]/10"
                      : isActive
                      ? "border-[#333] bg-[#111]"
                      : "border-[#1a1a1a] bg-[#080808]"
                  }`}
                  animate={isDone ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence mode="wait">
                    {isDone ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <Check className="w-3 h-3 text-[#00ff66]" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="num"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`text-[9px] font-bold ${isActive ? "text-white" : "text-[#2a2a2a]"}`}
                      >
                        {stepNumber}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate transition-colors ${
                  isActive ? "text-white" : isDone ? "text-[#888]" : "text-[#444]"
                }`}>
                  {meta.label}
                </p>
                <AnimatePresence>
                  {sel ? (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[10px] text-[#00ff66]/70 truncate"
                    >
                      {sel.brand}
                    </motion.p>
                  ) : (
                    <p className="text-[10px] text-[#252525]">
                      {meta.optional ? "Opcional" : "Por elegir"}
                    </p>
                  )}
                </AnimatePresence>
              </div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00ff66] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  step,
  selected,
  incompatibleReason,
  onSelect,
  onHover,
  index,
}: {
  product: Product;
  step: BuildStep;
  selected: boolean;
  incompatibleReason: string | null;
  onSelect: () => void;
  onHover: (p: Product | null) => void;
  index: number;
}) {
  const price = getPrice(product);
  const inStock = product.stock > 0;
  const pills = getSpecPills(step, product.specs);
  const isIncompat = !!incompatibleReason && !selected;

  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={() => onHover(product)}
      onMouseLeave={() => onHover(null)}
      disabled={isIncompat}
      title={incompatibleReason ?? undefined}
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 120, damping: 18 }}
      whileHover={isIncompat ? {} : { y: -1, scale: 1.005 }}
      whileTap={isIncompat ? {} : { scale: 0.998 }}
      className={`w-full flex items-center gap-4 p-4 text-left rounded-xl border transition-all group ${
        selected
          ? "border-[#00ff66]/40 bg-[#00ff66]/[0.04] shadow-lg shadow-[#00ff66]/5"
          : isIncompat
          ? "border-[#1a1a1a] opacity-30 cursor-not-allowed"
          : "border-[#161616] hover:border-[#2a2a2a] hover:bg-white/[0.02]"
      }`}
    >
      {/* Image */}
      <div className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border transition-all ${
        selected ? "border-[#00ff66]/20 bg-[#001a09]" : "border-[#1a1a1a] bg-[#0d0d0d]"
      }`}>
        {product.images[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-[#1a1a1a]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-medium leading-snug truncate ${selected ? "text-white" : "text-[#aaa]"}`}>
              {product.name}
            </p>
            <p className="text-[11px] text-[#3a3a3a] mt-0.5">{product.brand}</p>
          </div>
          {/* Selected check */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00ff66] flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-black" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spec badges */}
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {pills.slice(0, 4).map((pill) => (
              <span
                key={pill}
                className="text-[10px] font-mono text-[#444] bg-[#111] border border-[#1d1d1d] px-2 py-0.5 rounded-full"
              >
                {pill}
              </span>
            ))}
          </div>
        )}

        {/* Incompatibility warning */}
        {incompatibleReason && (
          <div className="flex items-center gap-1.5 mt-2">
            <AlertTriangle className="w-3 h-3 text-[#ff4545]/70 flex-shrink-0" />
            <p className="text-[10px] text-[#ff4545]/70">{incompatibleReason}</p>
          </div>
        )}
      </div>

      {/* Stock badge */}
      <div className="flex-shrink-0">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
          inStock
            ? "text-[#00ff66]/60 border-[#00ff66]/15 bg-[#00ff66]/5"
            : "text-[#ff4545]/50 border-[#ff4545]/15"
        }`}>
          {inStock ? `${product.stock}u` : "Sin stock"}
        </span>
      </div>
    </motion.button>
  );
}

// ─── BUILDER SECTION ─────────────────────────────────────────────────────────

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
  const [search, setSearch] = useState("");
  const { components, selectComponent, removeComponent } = useBuilderStore();
  const selected = components[step];

  const { data: products, isLoading } = trpc.builder.productsByType.useQuery({
    componentType: meta.componentType as ComponentType,
    onlyInStock,
    limit: 50,
  });

  const filtered = products?.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

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
    <section ref={sectionRef} id={`section-${step}`} className="border-b border-[#0f0f0f]">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between sticky top-0 bg-[#080808]/98 backdrop-blur-sm z-10 border-b border-[#111]">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
            selected ? "border-[#00ff66]/30 bg-[#00ff66]/10 text-[#00ff66]" : "border-[#1a1a1a] bg-[#111] text-[#333]"
          }`}>
            {STEP_SVG[step]}
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
              {meta.label}
            </h2>
            <p className="text-[10px] text-[#333]">{meta.description}</p>
          </div>
          {meta.optional && (
            <span className="text-[9px] text-[#2a2a2a] border border-[#1a1a1a] rounded px-1.5 py-0.5 uppercase tracking-wider">
              opcional
            </span>
          )}
          {selected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[9px] text-[#00ff66] border border-[#00ff66]/20 bg-[#00ff66]/5 rounded px-1.5 py-0.5 uppercase tracking-wider"
            >
              ✓ seleccionado
            </motion.span>
          )}
        </div>
        {/* En stock toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] text-[#333]">En stock</span>
          <div
            className={`w-7 h-3.5 rounded-full transition-colors relative cursor-pointer ${onlyInStock ? "bg-[#00ff66]/20" : "bg-[#1a1a1a]"}`}
            onClick={() => setOnlyInStock((v) => !v)}
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${onlyInStock ? "left-3.5 bg-[#00ff66]" : "left-0.5 bg-[#333]"}`} />
          </div>
        </label>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-[#0f0f0f]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2a2a2a]" />
          <input
            type="text"
            placeholder={`Buscar ${meta.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-xs bg-[#0d0d0d] border border-[#161616] rounded-lg text-[#888] placeholder-[#2a2a2a] focus:outline-none focus:border-[#2a2a2a] transition-colors"
          />
        </div>
      </div>

      {/* Product list */}
      <div className="px-5 py-3 space-y-2">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[#111] animate-pulse">
                <div className="w-14 h-14 rounded-lg bg-[#111]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-[#111] rounded-full" />
                  <div className="h-2 w-24 bg-[#0d0d0d] rounded-full" />
                  <div className="flex gap-1.5">
                    <div className="h-4 w-14 bg-[#0d0d0d] rounded-full" />
                    <div className="h-4 w-14 bg-[#0d0d0d] rounded-full" />
                  </div>
                </div>
              </div>
            ))
          : filtered?.length === 0
          ? (
            <div className="py-12 text-center">
              <Package className="w-8 h-8 text-[#1a1a1a] mx-auto mb-3" />
              <p className="text-xs text-[#2a2a2a]">
                {search ? "Sin resultados para tu búsqueda" : "Sin productos disponibles"}
              </p>
            </div>
          )
          : (
            <AnimatePresence mode="popLayout">
              {filtered?.map((p, i) => {
                const incompatReason = getIncompatibilityReason(step, p.specs as Record<string, unknown> | null, components);
                return (
                  <ProductCard
                    key={p.id}
                    product={p as Product}
                    step={step}
                    selected={selected?.productId === p.id}
                    incompatibleReason={incompatReason}
                    onSelect={() => handleSelect(p as Product)}
                    onHover={onHoverProduct}
                    index={i}
                  />
                );
              })}
            </AnimatePresence>
          )}
      </div>
      <div className="h-2" />
    </section>
  );
}

// ─── RIGHT PANEL — SUMMARY ────────────────────────────────────────────────────

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
  const hasErrors = issues.filter((i) => i.type === "error").length > 0;
  const selectedCount = Object.keys(components).length;
  const requiredSteps = BUILD_STEPS.filter((s) => !STEP_META[s].optional);
  const requiredDone = requiredSteps.filter((s) => components[s]).length;
  const progressPct = requiredSteps.length > 0 ? (requiredDone / requiredSteps.length) * 100 : 0;

  const handleAddToCart = () => {
    Object.values(components).forEach((c) => {
      if (!c) return;
      addItem({ productId: c.productId, name: c.name, brand: c.brand, price: c.price, sku: c.sku, imageUrl: c.imageUrl });
    });
    setAdded(true);
    setTimeout(() => router.push("/carrito"), 600);
  };

  // Product hover preview
  if (hoveredProduct && hoveredStep) {
    const price = getPrice(hoveredProduct);
    const pills = getSpecPills(hoveredStep, hoveredProduct.specs);
    const img = hoveredProduct.images[0]?.url;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full"
      >
        <div className="aspect-square bg-[#060606] overflow-hidden flex-shrink-0 border-b border-[#111]">
          {img ? (
            <img src={img} alt={hoveredProduct.name} className="w-full h-full object-contain p-8" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-[#1a1a1a]" />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <p className="text-[10px] text-[#00ff66]/60 uppercase tracking-widest">{hoveredProduct.brand}</p>
          <p className="text-sm font-medium text-white leading-snug">{hoveredProduct.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {pills.map((pill) => (
              <span key={pill} className="text-[10px] font-mono text-[#444] bg-[#111] border border-[#1a1a1a] px-2 py-0.5 rounded-full">
                {pill}
              </span>
            ))}
          </div>
          <div className="pt-3 border-t border-[#111]">
            <p className="text-xl font-black font-mono text-white">{formatCLP(price)}</p>
            <p className="text-[10px] text-[#333] mt-0.5">
              {hoveredProduct.stock > 0 ? `${hoveredProduct.stock} en stock` : "Sin stock"}
            </p>
          </div>
        </div>
        <div className="border-t border-[#111] px-5 py-3">
          <p className="text-[9px] text-[#333] uppercase tracking-widest">Total actual</p>
          <p className="text-sm font-bold font-mono text-white">{formatCLP(totalPrice)}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress + total */}
      <div className="px-5 pt-5 pb-4 border-b border-[#111] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-[#333] uppercase tracking-widest">Tu PC</p>
          <p className="text-[10px] text-[#333]">{requiredDone}/{requiredSteps.length} pasos</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#111] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#00ff66] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          />
        </div>

        {/* Animated price */}
        <div>
          <p className="text-3xl font-black font-mono text-white leading-none">
            <AnimatedPrice value={totalPrice} />
          </p>
          {totalPrice > 0 && (
            <p className="text-[10px] text-[#333] mt-1">
              6 cuotas de{" "}
              <span className="text-[#888] font-mono">{formatCLP(totalPrice / 6)}</span>
            </p>
          )}
        </div>

        {/* Compatibility issues */}
        <AnimatePresence>
          {issues.map((issue, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`text-[10px] flex items-start gap-2 px-3 py-2 rounded-lg border ${
                issue.type === "error"
                  ? "bg-[#1a0808] border-[#ff4545]/20 text-[#ff4545]"
                  : "bg-[#1a1200] border-[#f5a623]/20 text-[#f5a623]"
              }`}
            >
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {issue.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto py-2">
        {BUILD_STEPS.map((step) => {
          const meta = STEP_META[step];
          const sel = components[step];
          return (
            <button
              key={step}
              onClick={() => onScrollTo(step)}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors text-left group"
            >
              {sel?.imageUrl ? (
                <img src={sel.imageUrl} alt="" className="w-7 h-7 object-contain flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              ) : (
                <span className={sel ? "text-[#00ff66]/60" : "text-[#1a1a1a]"}>{STEP_SVG[step]}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-[#2a2a2a] uppercase tracking-wider">{meta.label}</p>
                {sel ? (
                  <p className="text-[11px] text-[#666] truncate group-hover:text-[#888] transition-colors">{sel.name}</p>
                ) : (
                  <p className="text-[11px] text-[#1e1e1e] italic">{meta.optional ? "Opcional" : "Sin elegir"}</p>
                )}
              </div>
              {sel && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66]/60 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="px-4 py-4 border-t border-[#111] space-y-2">
        {/* Add to cart — pulsing glow */}
        <motion.button
          onClick={handleAddToCart}
          disabled={selectedCount === 0 || added || hasErrors}
          animate={selectedCount > 0 && !hasErrors && !added ? {
            boxShadow: [
              "0 0 0px rgba(0,255,102,0)",
              "0 0 20px rgba(0,255,102,0.35)",
              "0 0 0px rgba(0,255,102,0)",
            ],
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-[#00e85c] transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <ShoppingCart className="w-4 h-4" />
          {added ? "Agregado ✓" : selectedCount > 0 ? `Armar PC (${selectedCount})` : "Elige componentes"}
        </motion.button>

        {hasErrors && (
          <p className="text-[10px] text-[#ff4545]/50 text-center">Resuelve incompatibilidades primero</p>
        )}

        {/* Share */}
        {selectedCount > 0 && (
          <motion.button
            onClick={handleShare}
            disabled={shareBuild.isPending}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-2.5 border border-[#1a1a1a] rounded-xl text-[10px] text-[#3a3a3a] hover:text-[#666] hover:border-[#252525] transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Share2 className="w-3 h-3" />
            {shareBuild.isPending ? "Generando..." : copied ? "¡Link copiado!" : shareUrl ? "Copiar link" : "Compartir build"}
          </motion.button>
        )}

        <button
          onClick={reset}
          className="w-full py-1.5 text-[10px] text-[#1e1e1e] hover:text-[#333] transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3 h-3" />
          Reiniciar
        </button>
      </div>
    </div>
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

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeStep]);

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none" style={{ scrollbarWidth: "none" }}>
      {BUILD_STEPS.map((step) => {
        const meta = STEP_META[step];
        const done = !!components[step];
        const isActive = step === activeStep;
        return (
          <button
            key={step}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(step)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
              isActive
                ? "bg-white text-black border-white"
                : done
                ? "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30"
                : "bg-transparent text-[#444] border-[#1a1a1a] hover:border-[#252525] hover:text-[#666]"
            }`}
            style={{ fontFamily: isActive ? "var(--font-display)" : undefined }}
          >
            {done && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" />}
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
        <p className="text-lg font-black font-mono text-white">
          {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(totalPrice)}
        </p>
      </div>
      {hasErrors && <div className="w-2 h-2 rounded-full bg-[#ff4545] flex-shrink-0" />}
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
      {open && <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-[#1a1a1a] rounded-t-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85dvh", display: "flex", flexDirection: "column" }}
      >
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

// ─── PERIPHERAL CARD ─────────────────────────────────────────────────────────

function PeripheralCard({ product }: { product: { id: string; name: string; brand: string; price: unknown; slug: string; images: { url: string }[] } }) {
  return (
    <Link href={`/productos/${product.slug}`} className="group flex-shrink-0 w-44 flex flex-col bg-[#0d0d0d] border border-[#161616] rounded-xl overflow-hidden hover:border-[#252525] transition-all">
      <div className="aspect-square bg-[#080808] overflow-hidden">
        {product.images[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-[#1a1a1a]" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[9px] text-[#333] uppercase tracking-wider">{product.brand}</p>
        <p className="text-[11px] text-[#666] group-hover:text-white transition-colors line-clamp-2 mt-0.5 leading-snug">{product.name}</p>
      </div>
    </Link>
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

  const scrollToSection = useCallback(
    (step: BuildStep) => {
      sectionRefs.current[step]?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveStep(step);
    },
    [setActiveStep]
  );

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

  const handleHoverProduct = useCallback(
    (step: BuildStep) => (p: Product | null) => {
      setHoveredProduct(p);
      setHoveredStep(p ? step : null);
    },
    []
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#080808] overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 h-11 border-b border-[#111] flex items-center px-5 gap-3 bg-[#080808] z-10">
        <Link href="/" className="text-[#2a2a2a] hover:text-[#666] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="w-px h-3.5 bg-[#1a1a1a]" />
        <span className="text-xs font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
          PC Builder
        </span>
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#2a2a2a]">
          <Zap className="w-3 h-3 text-[#00ff66]/40" />
          Arma tu equipo ideal
        </span>
      </header>

      {/* Mobile step bar */}
      <div className="md:hidden flex-shrink-0 border-b border-[#111] bg-[#060606]">
        <MobileStepBar activeStep={activeStep} onSelect={scrollToSection} />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left nav — desktop */}
        <nav className="hidden md:block flex-shrink-0 w-52 border-r border-[#0f0f0f] overflow-y-auto bg-[#050505]">
          <BuilderNav activeStep={activeStep} onSelect={scrollToSection} />
        </nav>

        {/* Center — scrollable component sections */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0 bg-[#080808]">
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
            <section className="px-5 py-8 border-t border-[#0f0f0f]">
              <p className="text-[9px] text-[#252525] uppercase tracking-widest mb-1">También considera</p>
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

        {/* Right panel — desktop */}
        <aside className="hidden md:block flex-shrink-0 w-72 border-l border-[#0f0f0f] overflow-hidden bg-[#050505]">
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
