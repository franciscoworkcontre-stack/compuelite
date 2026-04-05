"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  Html,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PCCase3D } from "./PCCase3D";
import { useBuilderStore, STEP_META } from "@/stores/builderStore";

function HoveredLabel() {
  const { hoveredSlot } = useBuilderStore();
  if (!hoveredSlot) return null;
  const meta = STEP_META[hoveredSlot];
  return (
    <Html
      position={[0.22, 0.2, 0.25]}
      style={{ pointerEvents: "none" }}
      center
    >
      <div
        className="px-3 py-1.5 bg-[#0a0a0a]/90 border border-[#00ff66]/40 rounded text-xs text-[#00ff66] whitespace-nowrap backdrop-blur-sm"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {meta.icon} {meta.label}
      </div>
    </Html>
  );
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#112211" />
      <spotLight
        position={[2, 3, 2]}
        intensity={2}
        angle={0.4}
        penumbra={0.8}
        castShadow
        color="#ffffff"
      />
      <spotLight
        position={[-2, 1, -1]}
        intensity={0.8}
        angle={0.5}
        penumbra={1}
        color="#0044ff"
      />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#00ff66" />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* PC Case */}
      <Float
        speed={0.6}
        rotationIntensity={0.08}
        floatIntensity={0.04}
      >
        <PCCase3D />
        <HoveredLabel />
      </Float>

      {/* Floor shadow */}
      <ContactShadows
        position={[0, -0.42, 0]}
        opacity={0.6}
        scale={2}
        blur={2}
        far={1}
        color="#00ff66"
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          intensity={0.6}
          mipmapBlur
        />
      </EffectComposer>

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={0.8}
        maxDistance={2.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.6}
        autoRotate
        autoRotateSpeed={0.4}
        makeDefault
      />
    </>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00ff66] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#555] uppercase tracking-widest">
          Cargando escena 3D
        </p>
      </div>
    </div>
  );
}

export function Builder3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#050a05] rounded-xl overflow-hidden"
      style={{ cursor: "grab" }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,102,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Canvas */}
      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          camera={{ position: [1.2, 0.5, 1.4], fov: 45 }}
          gl={{ antialias: true, toneMapping: 3 /* ACESFilmic */ }}
          dpr={[1, 2]}
        >
          <Scene />
        </Canvas>
      </Suspense>

      {/* Corner legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1 pointer-events-none">
        <p className="text-xs text-[#333] uppercase tracking-wider">
          Arrastra para rotar · Scroll para zoom
        </p>
      </div>

      {/* Slot count badge */}
      <SlotCountBadge />
    </div>
  );
}

function SlotCountBadge() {
  const { components } = useBuilderStore();
  const filled = Object.keys(components).length;
  const total = 8; // CASE through PSU
  return (
    <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#0a0a0a]/80 border border-[#222] rounded-lg flex items-center gap-2 pointer-events-none">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-sm transition-all ${
              i < filled ? "bg-[#00ff66]" : "bg-[#222]"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-mono text-[#888]">
        {filled}/{total}
      </span>
    </div>
  );
}
