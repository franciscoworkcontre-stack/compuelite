"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { ReactElement } from "react";
import { type BuildStep, useBuilderStore, STEP_META } from "@/stores/builderStore";

// ─── Hotspot ──────────────────────────────────────────────────────────────────
function Hotspot({
  position,
  step,
  filled,
}: {
  position: [number, number, number];
  step: BuildStep;
  filled: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const { hoveredSlot, setHoveredSlot, setStep, activeSlot } = useBuilderStore();
  const isActive = activeSlot === step;
  const isHovered = hoveredSlot === step;

  useFrame(({ clock }) => {
    if (ref.current && !filled) {
      ref.current.scale.setScalar(
        1 + Math.sin(clock.getElapsedTime() * 3 + position[0]) * 0.12
      );
    }
  });

  if (filled) return null;

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={() => setHoveredSlot(step)}
      onPointerOut={() => setHoveredSlot(null)}
      onClick={() => setStep(step)}
    >
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshStandardMaterial
        color={isActive || isHovered ? "#00ff66" : "#00cc52"}
        emissive={isActive || isHovered ? "#00ff66" : "#004422"}
        emissiveIntensity={isHovered ? 2 : 1.2}
        roughness={0}
        metalness={0.1}
      />
    </mesh>
  );
}

// ─── Installed component meshes ──────────────────────────────────────────────

function CPUMesh({ color = "#c0c0c0" }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.22, 0.015, 0.22]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* IHS pattern */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.16, 0.008, 0.16]} />
        <meshStandardMaterial color="#a0a0a0" metalness={1} roughness={0.05} />
      </mesh>
    </group>
  );
}

function GPUMesh({ color = "#1a1a2e" }) {
  return (
    <group>
      {/* PCB */}
      <mesh>
        <boxGeometry args={[0.5, 0.025, 0.14]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Fans */}
      {[-0.15, 0.05, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.03, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.012, 16]} />
          <meshStandardMaterial color="#111" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
      {/* Heatsink fins */}
      <mesh position={[0.02, 0.02, 0]}>
        <boxGeometry args={[0.44, 0.015, 0.12]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function RAMMesh({ color = "#222244" }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.04, 0.12, 0.008]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Heat spreader */}
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[0.04, 0.018, 0.010]} />
        <meshStandardMaterial color="#00ff66" emissive="#00ff66" emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function StorageMesh({ color = "#111" }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.22, 0.006, 0.025]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* NAND chips */}
      {[-0.06, 0.04].map((x, i) => (
        <mesh key={i} position={[x, 0.005, 0]}>
          <boxGeometry args={[0.06, 0.004, 0.02]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function MotherboardMesh({ color = "#0a2a0a" }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.5, 0.008, 0.45]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* PCIe slot */}
      <mesh position={[0, 0.008, 0.08]}>
        <boxGeometry args={[0.38, 0.006, 0.016]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* RAM slots */}
      {[-0.06, -0.02, 0.02, 0.06].map((z, i) => (
        <mesh key={i} position={[-0.16, 0.01, z]}>
          <boxGeometry args={[0.008, 0.013, 0.13]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* CPU socket */}
      <mesh position={[-0.05, 0.01, -0.09]}>
        <boxGeometry args={[0.14, 0.01, 0.14]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* VRM heatsink */}
      <mesh position={[-0.16, 0.018, -0.1]}>
        <boxGeometry args={[0.06, 0.02, 0.08]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function CoolerMesh({ color = "#888" }) {
  return (
    <group>
      {/* Heatsink tower */}
      {[-0.015, -0.005, 0.005, 0.015].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0]}>
          <boxGeometry args={[0.006, 0.08, 0.07]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {/* Fan */}
      <mesh position={[0, 0.04, 0.04]}>
        <cylinderGeometry args={[0.035, 0.035, 0.008, 16]} />
        <meshStandardMaterial color="#222" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

function PSUMesh({ color = "#1a1a1a" }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.2, 0.085, 0.15]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Grill */}
      <mesh position={[0, 0, 0.076]}>
        <boxGeometry args={[0.18, 0.075, 0.004]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Fan */}
      <mesh position={[0, 0.046, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.006, 16]} />
        <meshStandardMaterial color="#222" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ─── Main PC Case ─────────────────────────────────────────────────────────────

const COMPONENT_POSITIONS: Partial<Record<BuildStep, [number, number, number]>> = {
  MOTHERBOARD: [0, -0.04, 0],
  CPU:         [-0.05, 0.04, -0.09],
  CPU_COOLER:  [-0.05, 0.11, -0.09],
  GPU:         [0.02, -0.06, 0.08],
  RAM:         [-0.14, 0.05, -0.04],
  STORAGE:     [0.1, -0.08, -0.12],
  PSU:         [0, -0.2, -0.12],
};

const HOTSPOT_POSITIONS: Partial<Record<BuildStep, [number, number, number]>> = {
  MOTHERBOARD: [0.2, 0.1, 0],
  CPU:         [0.2, 0.1, -0.09],
  CPU_COOLER:  [0.2, 0.18, -0.09],
  GPU:         [0.2, -0.04, 0.08],
  RAM:         [0.2, 0.08, -0.04],
  STORAGE:     [0.2, -0.06, -0.12],
  PSU:         [0.2, -0.16, -0.12],
};

function InstalledComponent({ step }: { step: BuildStep }) {
  const ref = useRef<THREE.Group>(null);
  const pos = COMPONENT_POSITIONS[step];

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y =
        (pos?.[1] ?? 0) + Math.sin(clock.getElapsedTime() * 0.8 + step.length) * 0.002;
    }
  });

  if (!pos) return null;

  const meshMap: Record<string, ReactElement> = {
    MOTHERBOARD: <MotherboardMesh />,
    CPU: <CPUMesh />,
    CPU_COOLER: <CoolerMesh />,
    GPU: <GPUMesh />,
    RAM: (
      <group>
        {[0, 0.05, 0.1, 0.15].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <RAMMesh />
          </group>
        ))}
      </group>
    ),
    STORAGE: <StorageMesh />,
    PSU: <PSUMesh />,
  };

  return (
    <group ref={ref} position={pos}>
      {meshMap[step] ?? null}
    </group>
  );
}

// ─── PCCase3D ─────────────────────────────────────────────────────────────────

export function PCCase3D() {
  const { components } = useBuilderStore();
  const caseRef = useRef<THREE.Group>(null);

  const hasMobo = Boolean(components.MOTHERBOARD);
  const hasCase = Boolean(components.CASE);

  // Steps that can have hotspots (unlocked after case)
  const unlocked: BuildStep[] = hasCase
    ? ["MOTHERBOARD", "CPU", "CPU_COOLER", "GPU", "RAM", "STORAGE", "PSU"]
    : ["CASE"];

  return (
    <group ref={caseRef}>
      {/* ── Case chassis ─────────────────────────────────────── */}
      <group>
        {/* Back panel */}
        <mesh position={[-0.28, 0, 0]}>
          <boxGeometry args={[0.008, 0.6, 0.5]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -0.296, 0]}>
          <boxGeometry args={[0.56, 0.008, 0.5]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Top */}
        <mesh position={[0, 0.296, 0]}>
          <boxGeometry args={[0.56, 0.008, 0.5]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Front */}
        <mesh position={[0.276, 0, 0]}>
          <boxGeometry args={[0.008, 0.6, 0.5]} />
          <meshStandardMaterial
            color={hasCase ? "#111" : "#0d1a0d"}
            metalness={0.6}
            roughness={0.4}
            emissive={hasCase ? "#000" : "#003300"}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Far side (solid) */}
        <mesh position={[0, 0, -0.252]}>
          <boxGeometry args={[0.56, 0.6, 0.008]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Glass side panel */}
        <mesh position={[0, 0, 0.252]}>
          <boxGeometry args={[0.56, 0.6, 0.006]} />
          <MeshTransmissionMaterial
            backside={false}
            samples={4}
            thickness={0.05}
            roughness={0.05}
            transmission={0.96}
            ior={1.5}
            chromaticAberration={0.02}
            anisotropicBlur={0.1}
            color="#88ffaa"
          />
        </mesh>

        {/* RGB strip — bottom */}
        <mesh position={[0, -0.29, 0.1]}>
          <boxGeometry args={[0.5, 0.004, 0.02]} />
          <meshStandardMaterial
            color="#00ff66"
            emissive="#00ff66"
            emissiveIntensity={hasCase ? 1.5 : 0.3}
          />
        </mesh>
        {/* RGB strip — top */}
        <mesh position={[0, 0.29, 0.1]}>
          <boxGeometry args={[0.5, 0.004, 0.02]} />
          <meshStandardMaterial
            color="#00ff66"
            emissive="#00ff66"
            emissiveIntensity={hasCase ? 1.5 : 0.3}
          />
        </mesh>

        {/* Front mesh grille */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0.276, -0.2 + i * 0.1, 0]}>
            <boxGeometry args={[0.01, 0.002, 0.45]} />
            <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}

        {/* Fans — front intake */}
        {[-0.1, 0.1].map((z, i) => (
          <mesh key={i} position={[0.21, 0, z]}>
            <cylinderGeometry args={[0.07, 0.07, 0.015, 20]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ── Motherboard tray (always visible) ────────────────── */}
      <mesh position={[-0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.48, 0.52, 0.003]} />
        <meshStandardMaterial
          color={hasMobo ? "#0a1a0a" : "#0d0d0d"}
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>

      {/* ── Installed components ──────────────────────────────── */}
      {(["MOTHERBOARD", "CPU", "CPU_COOLER", "GPU", "RAM", "STORAGE", "PSU"] as BuildStep[]).map(
        (step) =>
          components[step] ? <InstalledComponent key={step} step={step} /> : null
      )}

      {/* ── Hotspots for unlocked empty slots ────────────────── */}
      {unlocked.map((step) => {
        if (components[step]) return null;
        const pos = HOTSPOT_POSITIONS[step];
        if (!pos) return null;
        return (
          <Hotspot
            key={step}
            step={step}
            position={pos}
            filled={Boolean(components[step])}
          />
        );
      })}

      {/* ── Point light inside the case (RGB glow) ───────────── */}
      <pointLight
        position={[0, 0, 0.1]}
        intensity={hasCase ? 0.8 : 0.2}
        color="#00ff66"
        distance={0.8}
        decay={2}
      />
    </group>
  );
}
