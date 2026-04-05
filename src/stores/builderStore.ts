import { create } from "zustand";
import { ComponentType } from "@prisma/client";

export type BuildStep =
  | "CASE"
  | "MOTHERBOARD"
  | "CPU"
  | "CPU_COOLER"
  | "GPU"
  | "RAM"
  | "STORAGE"
  | "PSU"
  | "EXTRAS";

export const BUILD_STEPS: BuildStep[] = [
  "CASE",
  "MOTHERBOARD",
  "CPU",
  "CPU_COOLER",
  "GPU",
  "RAM",
  "STORAGE",
  "PSU",
  "EXTRAS",
];

export const STEP_META: Record<
  BuildStep,
  {
    label: string;
    icon: string;
    componentType: ComponentType | null;
    optional: boolean;
    description: string;
  }
> = {
  CASE:        { label: "Gabinete",         icon: "🗂️", componentType: "CASE",        optional: false, description: "Define el tamaño y flujo de aire" },
  MOTHERBOARD: { label: "Placa Madre",      icon: "🔲", componentType: "MOTHERBOARD", optional: false, description: "Socket, RAM slots y conectividad" },
  CPU:         { label: "Procesador",       icon: "⚡", componentType: "CPU",         optional: false, description: "El cerebro del equipo" },
  CPU_COOLER:  { label: "Refrigeración",    icon: "❄️", componentType: "CPU_COOLER",  optional: true,  description: "Cooler de CPU o AIO" },
  GPU:         { label: "Tarjeta de Video", icon: "🖥️", componentType: "GPU",         optional: false, description: "Potencia gráfica para gaming" },
  RAM:         { label: "Memoria RAM",      icon: "💾", componentType: "RAM",         optional: false, description: "DDR4 o DDR5 según la placa" },
  STORAGE:     { label: "Almacenamiento",   icon: "🦊", componentType: "STORAGE_SSD", optional: false, description: "NVMe Gen4/5 o SSD SATA" },
  PSU:         { label: "Fuente de Poder",  icon: "🔌", componentType: "PSU",         optional: false, description: "Calculada según TDP total" },
  EXTRAS:      { label: "Extras",           icon: "✨", componentType: null,          optional: true,  description: "Fans, pasta térmica, OS" },
};

export interface SelectedComponent {
  productId: string;
  name: string;
  brand: string;
  price: number;
  sku: string;
  imageUrl?: string;
}

export interface BuilderState {
  buildId: string | null;
  currentStep: BuildStep;
  components: Partial<Record<BuildStep, SelectedComponent>>;
  totalPrice: number;
  compatibilityStatus: "idle" | "checking" | "ok" | "warning" | "error";
  compatibilityMessages: string[];
  hoveredSlot: BuildStep | null;
  activeSlot: BuildStep | null;
  panelOpen: boolean;

  // Actions
  setBuildId: (id: string) => void;
  setStep: (step: BuildStep) => void;
  selectComponent: (step: BuildStep, component: SelectedComponent) => void;
  removeComponent: (step: BuildStep) => void;
  setHoveredSlot: (slot: BuildStep | null) => void;
  setActiveSlot: (slot: BuildStep | null) => void;
  togglePanel: () => void;
  reset: () => void;
}

const defaultState = {
  buildId: null,
  currentStep: "CASE" as BuildStep,
  components: {} as Partial<Record<BuildStep, SelectedComponent>>,
  totalPrice: 0,
  compatibilityStatus: "idle" as const,
  compatibilityMessages: [],
  hoveredSlot: null,
  activeSlot: null,
  panelOpen: true,
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  ...defaultState,

  setBuildId: (id) => set({ buildId: id }),

  setStep: (step) => set({ currentStep: step, activeSlot: step, panelOpen: true }),

  selectComponent: (step, component) => {
    const components = { ...get().components, [step]: component };
    const totalPrice = Object.values(components).reduce(
      (sum, c) => sum + (c?.price ?? 0),
      0
    );
    // Auto-advance to next step
    const idx = BUILD_STEPS.indexOf(step);
    const nextStep = BUILD_STEPS[idx + 1] ?? step;
    set({ components, totalPrice, currentStep: nextStep, activeSlot: nextStep });
  },

  removeComponent: (step) => {
    const components = { ...get().components };
    delete components[step];
    const totalPrice = Object.values(components).reduce(
      (sum, c) => sum + (c?.price ?? 0),
      0
    );
    set({ components, totalPrice });
  },

  setHoveredSlot: (slot) => set({ hoveredSlot: slot }),
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  reset: () => set(defaultState),
}));
