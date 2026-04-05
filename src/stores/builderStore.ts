import { create } from "zustand";
import { ComponentType } from "@prisma/client";

export type BuildStep =
  | "GPU"
  | "CPU"
  | "MOTHERBOARD"
  | "RAM"
  | "STORAGE"
  | "CPU_COOLER"
  | "PSU"
  | "CASE";

export const BUILD_STEPS: BuildStep[] = [
  "GPU",
  "CPU",
  "MOTHERBOARD",
  "RAM",
  "STORAGE",
  "CPU_COOLER",
  "PSU",
  "CASE",
];

export const STEP_META: Record<
  BuildStep,
  {
    label: string;
    componentType: ComponentType;
    optional: boolean;
    description: string;
    icon: string;
  }
> = {
  GPU:         { label: "Tarjeta de Video", componentType: "GPU",         optional: false, description: "Potencia gráfica para gaming",        icon: "M" },
  CPU:         { label: "Procesador",       componentType: "CPU",         optional: false, description: "El cerebro del equipo",               icon: "P" },
  MOTHERBOARD: { label: "Placa Madre",      componentType: "MOTHERBOARD", optional: false, description: "Socket, slots y conectividad",        icon: "B" },
  RAM:         { label: "Memoria RAM",      componentType: "RAM",         optional: false, description: "DDR4 o DDR5 según la placa",          icon: "R" },
  STORAGE:     { label: "Almacenamiento",   componentType: "STORAGE_SSD", optional: false, description: "NVMe Gen4/5 o SSD SATA",             icon: "S" },
  CPU_COOLER:  { label: "Refrigeración",    componentType: "CPU_COOLER",  optional: true,  description: "Cooler o AIO",                        icon: "F" },
  PSU:         { label: "Fuente de Poder",  componentType: "PSU",         optional: false, description: "Calculada según TDP total",           icon: "A" },
  CASE:        { label: "Gabinete",         componentType: "CASE",        optional: false, description: "Formato y flujo de aire",             icon: "G" },
};

export interface SelectedComponent {
  productId: string;
  name: string;
  brand: string;
  price: number;
  sku: string;
  imageUrl?: string;
  specs?: Record<string, unknown>;
}

export interface CompatibilityIssue {
  type: "error" | "warning";
  message: string;
}

export function checkCompatibility(
  components: Partial<Record<BuildStep, SelectedComponent>>
): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const cpu = components.CPU;
  const mb = components.MOTHERBOARD;
  const gpu = components.GPU;
  const psu = components.PSU;
  const cooler = components.CPU_COOLER;
  const pcCase = components.CASE;

  // Socket compatibility: CPU ↔ Motherboard
  if (cpu && mb) {
    const cpuSocket = cpu.specs?.socket as string | undefined;
    const mbSocket = mb.specs?.socket as string | undefined;
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push({
        type: "error",
        message: `Socket incompatible: CPU requiere ${cpuSocket}, placa soporta ${mbSocket}`,
      });
    }
  }

  // PSU wattage vs GPU + CPU TDP
  if (psu && (gpu || cpu)) {
    const gpuTdp = (gpu?.specs?.tdp as number) ?? 0;
    const cpuTdp = (cpu?.specs?.tdp as number) ?? 0;
    const psuWatts = (psu.specs?.wattage as number) ?? 0;
    const required = gpuTdp + cpuTdp + 100;
    if (psuWatts > 0 && psuWatts < required) {
      issues.push({
        type: "warning",
        message: `Fuente insuficiente: necesitas ~${required}W, tienes ${psuWatts}W`,
      });
    }
  }

  // Cooler height vs case clearance
  if (cooler && pcCase) {
    const coolerH = (cooler.specs?.height as string | undefined)
      ?.replace("mm", "").trim();
    const caseMax = (pcCase.specs?.max_cooler_height as string | undefined)
      ?.replace("mm", "").trim();
    if (coolerH && caseMax && Number(coolerH) > Number(caseMax)) {
      issues.push({
        type: "error",
        message: `Cooler muy alto: ${coolerH}mm no cabe en gabinete (máx ${caseMax}mm)`,
      });
    }
  }

  return issues;
}

export interface BuilderState {
  components: Partial<Record<BuildStep, SelectedComponent>>;
  totalPrice: number;
  activeStep: BuildStep;

  setActiveStep: (step: BuildStep) => void;
  selectComponent: (step: BuildStep, component: SelectedComponent) => void;
  removeComponent: (step: BuildStep) => void;
  reset: () => void;
}

const calcTotal = (components: Partial<Record<BuildStep, SelectedComponent>>) =>
  Object.values(components).reduce((sum, c) => sum + (c?.price ?? 0), 0);

export const useBuilderStore = create<BuilderState>((set, get) => ({
  components: {},
  totalPrice: 0,
  activeStep: "GPU",

  setActiveStep: (step) => set({ activeStep: step }),

  selectComponent: (step, component) => {
    const components = { ...get().components, [step]: component };
    set({ components, totalPrice: calcTotal(components) });
  },

  removeComponent: (step) => {
    const components = { ...get().components };
    delete components[step];
    set({ components, totalPrice: calcTotal(components) });
  },

  reset: () => set({ components: {}, totalPrice: 0, activeStep: "GPU" }),
}));
