"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, type TargetAndTransition } from "framer-motion";
import {
  Wrench,
  Gamepad2,
  Zap,
  Flame,
  Skull,
  Monitor,
  Laptop,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  slug: string;
  name: string;
  description: string | null;
  _count: { products: number };
};

type Brand = { brand: string; count: number };

// ─── Category meta ────────────────────────────────────────────────────────────

type AnimType = "pulse" | "float" | "spin" | "bounce" | "shake" | "wiggle";

const CAT_META: Record<string, { Icon: LucideIcon; anim: AnimType }> = {
  "componentes":           { Icon: Wrench,   anim: "spin"   },
  "pc-gamer":              { Icon: Gamepad2, anim: "bounce" },
  "pc-gamer-start-series": { Icon: Zap,      anim: "pulse"  },
  "pc-gamer-pro-series":   { Icon: Flame,    anim: "float"  },
  "pc-elite":              { Icon: Skull,    anim: "shake"  },
  "monitores":             { Icon: Monitor,  anim: "wiggle" },
  "workstation":           { Icon: Laptop,   anim: "float"  },
};

const DEFAULT_META: { Icon: LucideIcon; anim: AnimType } = { Icon: Package, anim: "pulse" };

// ─── Icon animation variants ──────────────────────────────────────────────────

const iconAnims: Record<AnimType, { animate: TargetAndTransition; transition: Record<string, unknown> }> = {
  pulse: {
    animate: { scale: [1, 1.22, 1], opacity: [0.75, 1, 0.75] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  float: {
    animate: { y: [0, -3, 0] },
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
  spin: {
    animate: { rotate: [0, 14, -10, 0] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  bounce: {
    animate: { y: [0, -5, 0], scale: [1, 1.12, 1] },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeOut" },
  },
  shake: {
    animate: { x: [0, -3, 3, -2, 2, 0] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 },
  },
  wiggle: {
    animate: { rotate: [0, -8, 8, -4, 4, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 },
  },
};

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
  const { Icon, anim } = meta;
  const animDef = iconAnims[anim];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 220, damping: 26 }}
    >
      <Link href={`/productos?categoria=${cat.slug}`}>
        <div
          className="relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-[#00ff66]/5 group"
          style={{
            backgroundColor: active ? "#00ff6608" : "transparent",
            borderColor: active ? "#00ff6650" : "#00ff6618",
          }}
        >
          {/* Active left accent */}
          {active && (
            <motion.div
              layoutId="sidebar-active-bar"
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#00ff66]"
            />
          )}

          {/* Icon box — dark green bg + green icon, only icon animates */}
          <div
            className="relative z-10 flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center border"
            style={{
              backgroundColor: "#071a0e",
              borderColor: "#00ff6628",
            }}
          >
            <motion.div
              animate={animDef.animate}
              transition={animDef.transition}
              className="flex items-center justify-center"
            >
              <Icon
                className="w-[14px] h-[14px]"
                style={{ color: "#00ff66", strokeWidth: 2 }}
              />
            </motion.div>
          </div>

          {/* Text */}
          <div className="relative z-10 flex-1 min-w-0">
            <p
              className="text-[11px] font-semibold truncate leading-tight transition-colors"
              style={{ color: active ? "#00ff66" : "#666" }}
            >
              {cat.name}
            </p>
            <p className="text-[9px] text-[#2a2a2a] mt-0.5 tabular-nums group-hover:text-[#3a3a3a] transition-colors">
              {cat._count.products} items
            </p>
          </div>

          {/* Arrow */}
          <svg
            className="relative z-10 w-2.5 h-2.5 flex-shrink-0 transition-colors"
            style={{ color: active ? "#00ff66" : "#1e1e1e" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
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
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-[#00ff6618] hover:border-[#00ff6640] hover:bg-[#00ff6608] transition-all group"
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
