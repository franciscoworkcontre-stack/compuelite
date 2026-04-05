"use client";

import { useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  useBuilderStore,
  BUILD_STEPS,
  STEP_META,
  type BuildStep,
  type SelectedComponent,
} from "@/stores/builderStore";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepList() {
  const { currentStep, components, setStep } = useBuilderStore();

  return (
    <div className="flex gap-1.5 flex-wrap px-4 py-3 border-b border-[#1a1a1a]">
      {BUILD_STEPS.map((step, i) => {
        const filled = Boolean(components[step]);
        const active = currentStep === step;
        const meta = STEP_META[step];
        return (
          <button
            key={step}
            onClick={() => setStep(step)}
            title={meta.label}
            className={`relative w-7 h-7 rounded flex items-center justify-center text-sm transition-all ${
              active
                ? "bg-[#00ff66] text-black ring-2 ring-[#00ff66] ring-offset-1 ring-offset-[#111]"
                : filled
                ? "bg-[#00ff66]/20 text-[#00ff66]"
                : "bg-[#1a1a1a] text-[#444] hover:text-[#888]"
            }`}
          >
            {filled ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-xs" style={{ fontFamily: "var(--font-display)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Selected component card ──────────────────────────────────────────────────

function SelectedCard({ step }: { step: BuildStep }) {
  const { components, removeComponent, setStep } = useBuilderStore();
  const comp = components[step];
  if (!comp) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#0d1a0d] border border-[#00ff66]/20 rounded-lg mx-4 mb-4">
      <div className="w-10 h-10 bg-[#111] border border-[#222] rounded flex items-center justify-center text-xl flex-shrink-0">
        {STEP_META[step].icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">{STEP_META[step].label}</p>
        <p className="text-xs text-white font-medium truncate">{comp.name}</p>
        <p className="text-xs font-mono text-[#00ff66]">{formatCLP(comp.price)}</p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setStep(step)}
          className="p-1.5 rounded text-[#555] hover:text-[#00ff66] hover:bg-[#00ff66]/10 transition-all"
          title="Cambiar"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => removeComponent(step)}
          className="p-1.5 rounded text-[#555] hover:text-[#ff3333] hover:bg-[#ff3333]/10 transition-all"
          title="Quitar"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Product picker ───────────────────────────────────────────────────────────

function ProductPicker({ step }: { step: BuildStep }) {
  const meta = STEP_META[step];
  const { selectComponent, components } = useBuilderStore();

  const { data, isLoading } = trpc.products.list.useQuery(
    {
      componentType: meta.componentType ?? undefined,
      inStock: true,
      sort: "price_asc",
      limit: 20,
    },
    { enabled: Boolean(meta.componentType) }
  );

  const handleSelect = useCallback(
    (p: {
      id: string;
      name: string;
      brand: string;
      price: { toNumber?: () => number } | number | string;
      sku: string;
      images: { url: string }[];
    }) => {
      const comp: SelectedComponent = {
        productId: p.id,
        name: p.name,
        brand: p.brand,
        price: typeof p.price === "object" && p.price?.toNumber
          ? p.price.toNumber()
          : Number(p.price),
        sku: p.sku,
        imageUrl: p.images[0]?.url,
      };
      selectComponent(step, comp);
    },
    [step, selectComponent]
  );

  if (!meta.componentType) {
    return (
      <div className="px-4 py-6 text-center text-xs text-[#555]">
        <p className="text-2xl mb-2">✨</p>
        <p>Los extras (pasta térmica, RGB, OS) se agregan al finalizar el build.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const products = data?.items ?? [];

  if (products.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-3xl mb-2 opacity-20">📦</p>
        <p className="text-xs text-[#555]">No hay {meta.label.toLowerCase()} disponibles en este momento.</p>
      </div>
    );
  }

  const currentComp = components[step];

  return (
    <div className="space-y-2 px-4">
      {products.map((p) => {
        const price =
          typeof p.price === "object" && (p.price as { toNumber?: () => number })?.toNumber
            ? (p.price as { toNumber: () => number }).toNumber()
            : Number(p.price);
        const isSelected = currentComp?.productId === p.id;

        return (
          <button
            key={p.id}
            onClick={() => handleSelect(p as Parameters<typeof handleSelect>[0])}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
              isSelected
                ? "border-[#00ff66] bg-[#00ff66]/10"
                : "border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#333] hover:bg-[#111]"
            }`}
          >
            {/* Image */}
            <div className="w-10 h-10 bg-[#111] border border-[#222] rounded flex items-center justify-center flex-shrink-0 text-lg">
              {p.images[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0].url} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                STEP_META[step].icon
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white leading-tight truncate">
                {p.name}
              </p>
              <p className="text-xs text-[#555]">{p.brand}</p>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold font-mono text-[#00ff66]">
                {formatCLP(price)}
              </p>
              {isSelected && (
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" />
                  <span className="text-xs text-[#00ff66]">Seleccionado</span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── BuilderPanel ─────────────────────────────────────────────────────────────

export function BuilderPanel() {
  const { currentStep, components, setStep } = useBuilderStore();
  const meta = STEP_META[currentStep];
  const currentComp = components[currentStep];
  const stepIndex = BUILD_STEPS.indexOf(currentStep);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Tab") {
        const next = BUILD_STEPS[stepIndex + 1];
        if (next) setStep(next);
      }
      if (e.key === "ArrowLeft") {
        const prev = BUILD_STEPS[stepIndex - 1];
        if (prev) setStep(prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stepIndex, setStep]);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] border-l border-[#1a1a1a] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1a1a1a]">
        <p className="text-xs text-[#00ff66] uppercase tracking-widest mb-1"
          style={{ fontFamily: "var(--font-display)" }}>
          Paso {stepIndex + 1} / {BUILD_STEPS.length}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}>
              {meta.label}
            </h2>
            <p className="text-xs text-[#555]">{meta.description}</p>
          </div>
          {meta.optional && (
            <span className="ml-auto text-xs px-2 py-0.5 border border-[#333] rounded text-[#555]">
              Opcional
            </span>
          )}
        </div>
      </div>

      {/* Step dots */}
      <StepList />

      {/* Selected component (if any) */}
      <div className="pt-3">
        {currentComp && <SelectedCard step={currentStep} />}
      </div>

      {/* Products list */}
      <div className="flex-1 overflow-y-auto pb-4 space-y-1">
        <ProductPicker step={currentStep} />
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 border-t border-[#1a1a1a] flex gap-2">
        <button
          onClick={() => {
            const prev = BUILD_STEPS[stepIndex - 1];
            if (prev) setStep(prev);
          }}
          disabled={stepIndex === 0}
          className="flex-1 py-2 border border-[#222] rounded text-xs text-[#555] hover:border-[#333] hover:text-[#888] disabled:opacity-30 transition-all uppercase tracking-wider"
        >
          ← Anterior
        </button>
        {meta.optional && !currentComp ? (
          <button
            onClick={() => {
              const next = BUILD_STEPS[stepIndex + 1];
              if (next) setStep(next);
            }}
            className="flex-1 py-2 border border-[#222] rounded text-xs text-[#555] hover:border-[#333] hover:text-[#888] transition-all uppercase tracking-wider"
          >
            Omitir →
          </button>
        ) : (
          <button
            onClick={() => {
              const next = BUILD_STEPS[stepIndex + 1];
              if (next) setStep(next);
            }}
            disabled={stepIndex === BUILD_STEPS.length - 1}
            className="flex-1 py-2 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded text-xs text-[#00ff66] hover:bg-[#00ff66]/20 disabled:opacity-30 transition-all uppercase tracking-wider"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
