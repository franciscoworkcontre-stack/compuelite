"use client";

import dynamic from "next/dynamic";
import { BuilderPanel } from "./BuilderPanel";
import { BuilderBottomBar } from "./BuilderBottomBar";
import { useBuilderStore } from "@/stores/builderStore";

// Three.js canvas must be dynamically imported (no SSR)
const Builder3DCanvas = dynamic(
  () => import("./Builder3DCanvas").then((m) => m.Builder3DCanvas),
  { ssr: false, loading: () => <CanvasLoader /> }
);

function CanvasLoader() {
  return (
    <div className="w-full h-full bg-[#050a05] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00ff66] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#555] uppercase tracking-widest">
          Cargando escena 3D
        </p>
      </div>
    </div>
  );
}

function PanelToggle() {
  const { panelOpen, togglePanel } = useBuilderStore();
  return (
    <button
      onClick={togglePanel}
      className="absolute top-4 right-4 z-10 w-8 h-8 bg-[#0a0a0a]/80 border border-[#222] rounded flex items-center justify-center text-[#555] hover:text-[#00ff66] hover:border-[#00ff66]/40 transition-all"
      title={panelOpen ? "Ocultar panel" : "Mostrar panel"}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {panelOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        )}
      </svg>
    </button>
  );
}

export function BuilderPage() {
  const { panelOpen } = useBuilderStore();

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Top nav bar */}
      <div className="h-12 border-b border-[#1a1a1a] flex items-center px-4 gap-3 flex-shrink-0">
        <a href="/" className="text-[#555] hover:text-[#00ff66] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div className="w-px h-4 bg-[#222]" />
        <span
          className="text-xs font-black text-white uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          PC Builder
        </span>
        <span className="text-xs text-[#555]">— Arma tu equipo ideal</span>
      </div>

      {/* Main area: canvas + panel */}
      <div className="flex flex-1 min-h-0">
        {/* 3D Canvas */}
        <div className="relative flex-1 min-w-0">
          <Builder3DCanvas />
          <PanelToggle />
        </div>

        {/* Side panel */}
        <div
          className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${
            panelOpen ? "w-80" : "w-0"
          }`}
        >
          <div className="w-80 h-full">
            <BuilderPanel />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0">
        <BuilderBottomBar />
      </div>
    </div>
  );
}
