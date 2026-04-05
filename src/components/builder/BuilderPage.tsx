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
  type BuildStep,
  type SelectedComponent,
} from "@/stores/builderStore";
import { useCartStore } from "@/stores/cartStore";

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

const STEP_SVG: Record<BuildStep, React.ReactNode> = {
  GPU: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1H3zm0 2h14v8H3V6zm2 2v4h4V8H5zm6 0v4h4V8h-4z" />
    </svg>
  ),
  CPU: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M7 3a1 1 0 00-1 1v1H5a2 2 0 00-2 2v6a2 2 0 002 2h1v1a1 1 0 102 0v-1h4v1a1 1 0 102 0v-1h1a2 2 0 002-2V7a2 2 0 00-2-2h-1V4a1 1 0 10-2 0v1H8V4a1 1 0 00-1-1zM5 7h10v6H5V7zm2 2v2h2V9H7zm4 0v2h2V9h-2z" />
    </svg>
  ),
  MOTHERBOARD: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1v12h12V4H4zm2 2h8v2H6V6zm0 4h4v2H6v-2zm6 0h2v2h-2v-2z" />
    </svg>
  ),
  RAM: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M3 6a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm2 1v6h10V7H5zm2 1h2v4H7V8zm4 0h2v4h-2V8z" />
    </svg>
  ),
  STORAGE: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0v2h10V5H5zm0 4v6h10V9H5zm2 1h6v2H7v-2z" />
    </svg>
  ),
  CPU_COOLER: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4zm0 2a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" />
    </svg>
  ),
  PSU: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M11 3a1 1 0 10-2 0v1H8a1 1 0 00-.8.4l-2 2.667A1 1 0 005 8v5a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-.2-.6l-2-2.667A1 1 0 0012 4h-1V3zm-1 4a3 3 0 110 6 3 3 0 010-6zm0 2a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  ),
  CASE: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4zm1 2h10v10H5V5zm2 2v6h2V7H7zm4 0v2h2V7h-2z" />
    </svg>
  ),
};

// ─── PRODUCT ROW ─────────────────────────────────────────────────────────────

type Product = {
  id: string;
  name: string;
  brand: string;
  price: { toNumber: () => number } | number;
  sku: string;
  stock: number;
  images: { url: string }[];
};

function ProductRow({
  product,
  selected,
  onSelect,
}: {
  product: Product;
  selected: boolean;
  onSelect: () => void;
}) {
  const price = typeof product.price === "object" ? product.price.toNumber() : Number(product.price);
  const inStock = product.stock > 0;
  const imageUrl = product.images[0]?.url;

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2 ${
        selected
          ? "border-[#00ff66] bg-[#00ff66]/5"
          : "border-transparent hover:border-[#00ff66]/30 hover:bg-[#ffffff]/[0.02]"
      }`}
    >
      {/* Radio dot */}
      <div
        className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-[#00ff66]" : "border-[#333]"
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-[#00ff66]" />}
      </div>

      {/* Image */}
      <div className="flex-shrink-0 w-10 h-10 bg-[#111] rounded border border-[#222] overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={product.name} width={40} height={40} className="w-full h-full object-contain p-1" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#333]">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${selected ? "text-white" : "text-[#ccc]"}`}>
          {product.name}
        </p>
        <p className="text-xs text-[#555]">{product.brand}</p>
      </div>

      {/* Stock + Price */}
      <div className="flex-shrink-0 text-right">
        <p className={`text-sm font-bold font-mono ${selected ? "text-[#00ff66]" : "text-[#888]"}`}>
          {formatCLP(price)}
        </p>
        <span
          className={`text-[10px] uppercase tracking-wider ${
            inStock ? "text-[#00ff66]/60" : "text-[#ff4444]/60"
          }`}
        >
          {inStock ? "En stock" : "Sin stock"}
        </span>
      </div>
    </button>
  );
}

// ─── SECTION ─────────────────────────────────────────────────────────────────

function BuilderSection({
  step,
  sectionRef,
}: {
  step: BuildStep;
  sectionRef: (el: HTMLElement | null) => void;
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
      const price = typeof p.price === "object" ? p.price.toNumber() : Number(p.price);
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
        });
      }
    },
    [selected, step, selectComponent, removeComponent]
  );

  return (
    <section ref={sectionRef} id={`section-${step}`} className="border-b border-[#1a1a1a]">
      {/* Section header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10 border-b border-[#111]">
        <div className="flex items-center gap-3">
          <span className="text-[#00ff66]">{STEP_SVG[step]}</span>
          <div>
            <h2
              className="text-sm font-black text-white uppercase tracking-wider"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {meta.label}
            </h2>
            <p className="text-xs text-[#444]">{meta.description}</p>
          </div>
          {meta.optional && (
            <span className="text-[10px] text-[#555] border border-[#222] rounded px-1.5 py-0.5 uppercase tracking-wider">
              opcional
            </span>
          )}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-[#555]">Solo en stock</span>
          <div
            className={`w-8 h-4 rounded-full transition-colors relative ${onlyInStock ? "bg-[#00ff66]/30" : "bg-[#222]"}`}
            onClick={() => setOnlyInStock((v) => !v)}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                onlyInStock ? "left-4 bg-[#00ff66]" : "left-0.5 bg-[#555]"
              }`}
            />
          </div>
        </label>
      </div>

      {/* Products */}
      <div className="divide-y divide-[#111]">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="skeleton w-4 h-4 rounded-full" />
              <div className="skeleton w-10 h-10 rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-48 rounded" />
                <div className="skeleton h-2.5 w-24 rounded" />
              </div>
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          ))
        ) : products?.length === 0 ? (
          <div className="px-6 py-8 text-center text-xs text-[#555]">
            No hay productos disponibles en esta categoría
          </div>
        ) : (
          products?.map((p) => (
            <ProductRow
              key={p.id}
              product={p as Product}
              selected={selected?.productId === p.id}
              onSelect={() => handleSelect(p as Product)}
            />
          ))
        )}
      </div>
    </section>
  );
}

// ─── SUMMARY PANEL ───────────────────────────────────────────────────────────

function BuilderSummary({ onScrollTo }: { onScrollTo: (step: BuildStep) => void }) {
  const { components, totalPrice, reset } = useBuilderStore();
  const { addItem } = useCartStore();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const selectedCount = Object.keys(components).length;
  const requiredSteps = BUILD_STEPS.filter((s) => !STEP_META[s].optional);
  const requiredDone = requiredSteps.filter((s) => components[s]).length;

  const handleAddToCart = () => {
    Object.values(components).forEach((c) => {
      if (!c) return;
      addItem({
        productId: c.productId,
        name: c.name,
        brand: c.brand,
        price: c.price,
        sku: c.sku,
        imageUrl: c.imageUrl,
      });
    });
    setAdded(true);
    setTimeout(() => {
      router.push("/carrito");
    }, 600);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="px-5 py-4 border-b border-[#1a1a1a]">
        <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">Configuración</p>
        <div className="flex items-end justify-between">
          <p
            className="text-lg font-black text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCLP(totalPrice)}
          </p>
          <p className="text-xs text-[#444]">
            {requiredDone}/{requiredSteps.length} req.
          </p>
        </div>
        {totalPrice > 0 && (
          <div className="mt-2 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00ff66] rounded-full transition-all"
              style={{ width: `${(requiredDone / requiredSteps.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#111]">
        {BUILD_STEPS.map((step) => {
          const meta = STEP_META[step];
          const sel = components[step];
          return (
            <button
              key={step}
              onClick={() => onScrollTo(step)}
              className="w-full px-5 py-2.5 flex items-center gap-3 hover:bg-[#ffffff]/[0.02] transition-colors text-left"
            >
              <span className={sel ? "text-[#00ff66]" : "text-[#333]"}>
                {STEP_SVG[step]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#444] uppercase tracking-wider">{meta.label}</p>
                {sel ? (
                  <p className="text-xs text-[#888] truncate">{sel.name}</p>
                ) : (
                  <p className="text-xs text-[#2a2a2a] italic">
                    {meta.optional ? "Opcional" : "Sin seleccionar"}
                  </p>
                )}
              </div>
              {sel && (
                <p className="text-xs font-mono text-[#555] flex-shrink-0">{formatCLP(sel.price)}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-5 py-4 border-t border-[#1a1a1a] space-y-2">
        <button
          onClick={handleAddToCart}
          disabled={selectedCount === 0 || added}
          className="w-full py-3 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#00cc52] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {added ? "Agregado ✓" : `Agregar al carrito (${selectedCount})`}
        </button>
        <button
          onClick={reset}
          className="w-full py-2 text-xs text-[#444] hover:text-[#666] transition-colors uppercase tracking-wider"
        >
          Reiniciar configuración
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export function BuilderPage() {
  const { activeStep, setActiveStep } = useBuilderStore();
  const sectionRefs = useRef<Partial<Record<BuildStep, HTMLElement>>>({});

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
      { threshold: 0.3 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [setActiveStep]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 h-12 border-b border-[#1a1a1a] flex items-center px-5 gap-3 z-50 bg-[#0a0a0a]">
        <Link
          href="/"
          className="text-[#555] hover:text-[#00ff66] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-px h-4 bg-[#222]" />
        <span
          className="text-xs font-black text-white uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          PC Builder
        </span>
        <span className="text-xs text-[#333]">— Arma tu equipo ideal</span>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ── Left nav (sticky) ── */}
        <nav className="flex-shrink-0 w-52 border-r border-[#1a1a1a] overflow-y-auto bg-[#080808]">
          <div className="py-3">
            <p className="px-4 mb-1 text-[10px] text-[#333] uppercase tracking-widest font-medium">
              Componentes
            </p>
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

        {/* ── Center sections ── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {BUILD_STEPS.map((step) => (
            <BuilderSection
              key={step}
              step={step}
              sectionRef={setSectionRef(step)}
            />
          ))}
          <div className="h-32" /> {/* Bottom padding */}
        </main>

        {/* ── Right summary ── */}
        <aside className="flex-shrink-0 w-72 border-l border-[#1a1a1a] overflow-hidden bg-[#080808]">
          <BuilderSummary onScrollTo={scrollToSection} />
        </aside>
      </div>
    </div>
  );
}

// ─── NAV ITEM (extracted to avoid hooks-in-loop issue) ────────────────────────

function NavItem({
  step,
  isActive,
  onClick,
}: {
  step: BuildStep;
  isActive: boolean;
  onClick: () => void;
}) {
  const { components } = useBuilderStore();
  const meta = STEP_META[step];
  const sel = components[step];
  const isSelected = !!sel;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all border-l-2 ${
        isActive
          ? "border-[#00ff66] bg-[#00ff66]/5 text-white"
          : "border-transparent text-[#555] hover:text-[#888] hover:bg-[#ffffff]/[0.02]"
      }`}
    >
      <span className={isSelected ? "text-[#00ff66]" : isActive ? "text-[#666]" : "text-[#333]"}>
        {STEP_SVG[step]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{meta.label}</p>
        {sel && <p className="text-[10px] text-[#00ff66]/60 truncate">{sel.brand}</p>}
      </div>
      {isSelected && (
        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#00ff66]" />
      )}
      {!isSelected && meta.optional && (
        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#222]" />
      )}
    </button>
  );
}
