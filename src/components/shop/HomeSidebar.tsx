"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  slug: string;
  name: string;
  description: string | null;
  _count: { products: number };
};

type Brand = { brand: string; count: number };

// ─── Category meta ────────────────────────────────────────────────────────────

const CAT_META: Record<string, { icon: string; anim: "pulse" | "float" | "spin" | "bounce" | "shake" | "glow" | "wiggle" }> = {
  "componentes":           { icon: "🔧", anim: "spin"   },
  "pc-gamer":              { icon: "🎮", anim: "bounce" },
  "pc-gamer-start-series": { icon: "⚡", anim: "pulse"  },
  "pc-gamer-pro-series":   { icon: "🔥", anim: "float"  },
  "pc-elite":              { icon: "💀", anim: "shake"  },
  "monitores":             { icon: "🖥️", anim: "glow"   },
  "workstation":           { icon: "💻", anim: "wiggle" },
};

const DEFAULT_META = { icon: "📦", anim: "pulse" as const };

// ─── Icon animation variants ──────────────────────────────────────────────────

const iconAnims = {
  pulse: {
    animate: { scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  float: {
    animate: { y: [0, -4, 0] },
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
  spin: {
    animate: { rotate: [0, 12, -8, 0] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  bounce: {
    animate: { y: [0, -5, 0], scale: [1, 1.08, 1] },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeOut" },
  },
  shake: {
    animate: { x: [0, -3, 3, -2, 2, 0] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 },
  },
  glow: {
    animate: { scale: [1, 1.12, 1], filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"] },
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
  wiggle: {
    animate: { rotate: [0, -8, 8, -4, 4, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 },
  },
};

// ─── Green palette shades (cycle through for variety without being multi-color)
const GREEN_SHADES = [
  "#00ff66",
  "#00ffaa",
  "#39ff14",
  "#00ffd5",
  "#7fff00",
  "#00ff99",
  "#aaffcc",
];

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  active,
  index,
}: {
  cat: Category;
  active: boolean;
  index: number;
}) {
  const meta = CAT_META[cat.slug] ?? DEFAULT_META;
  const anim = iconAnims[meta.anim];
  const green = GREEN_SHADES[index % GREEN_SHADES.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 220, damping: 26 }}
    >
      <Link href={`/productos?categoria=${cat.slug}`}>
        <motion.div
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg border overflow-hidden cursor-pointer transition-colors"
          style={{
            backgroundColor: active ? `${green}0e` : "#0b0b0b",
            borderColor: active ? `${green}35` : "#141414",
          }}
        >
          {/* Hover glow layer */}
          <motion.div
            initial={false}
            className="absolute inset-0 opacity-0 pointer-events-none"
            whileHover={{ opacity: 1 }}
            style={{
              background: `radial-gradient(ellipse at 0% 50%, ${green}0f, transparent 70%)`,
            }}
          />

          {/* Active left bar */}
          {active && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
              style={{ backgroundColor: green }}
            />
          )}

          {/* Animated icon */}
          <motion.div
            animate={anim.animate as Record<string, unknown>}
            transition={anim.transition}
            className="relative z-10 flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-base border"
            style={{
              backgroundColor: `${green}0d`,
              borderColor: `${green}1a`,
            }}
          >
            {meta.icon}
          </motion.div>

          {/* Text */}
          <div className="relative z-10 flex-1 min-w-0">
            <p
              className="text-[11px] font-semibold truncate leading-tight transition-colors"
              style={{ color: active ? green : "#888" }}
            >
              {cat.name}
            </p>
            <p className="text-[9px] text-[#2a2a2a] mt-0.5 tabular-nums">{cat._count.products} items</p>
          </div>

          {/* Arrow */}
          <svg
            className="relative z-10 w-2.5 h-2.5 flex-shrink-0 transition-colors"
            style={{ color: active ? green : "#222" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export function HomeSidebar({
  categories,
}: {
  categories: Category[];
  brands?: Brand[];
}) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("categoria") ?? "";

  const visible = categories.filter((c) => c._count.products > 0);

  return (
    <aside className="w-52 flex-shrink-0 hidden lg:flex flex-col border-r border-[#0f0f0f] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-[#080808]">
      <div className="p-2.5 space-y-1">

        {/* Section header */}
        <div className="px-1 pt-2 pb-1.5">
          <p className="text-[9px] font-bold text-[#222] uppercase tracking-widest">Categorías</p>
        </div>

        {/* Category cards */}
        {visible.map((cat, i) => (
          <CategoryCard
            key={cat.slug}
            cat={cat}
            active={activeSlug === cat.slug}
            index={i}
          />
        ))}

        {/* All products link */}
        <div className="pt-2 pb-3">
          <Link
            href="/productos"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-[#141414] hover:border-[#00ff66]/25 hover:bg-[#00ff66]/4 transition-all group"
          >
            <span className="text-[9px] text-[#2a2a2a] group-hover:text-[#00ff66] transition-colors uppercase tracking-wider">
              Ver catálogo completo
            </span>
          </Link>
        </div>

      </div>
    </aside>
  );
}
