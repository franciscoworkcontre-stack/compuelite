"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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

const CAT_META: Record<string, { icon: string; color: string }> = {
  "componentes":           { icon: "🔧", color: "#888888" },
  "pc-gamer":              { icon: "🎮", color: "#00ff66" },
  "pc-gamer-start-series": { icon: "⚡", color: "#4488ff" },
  "pc-gamer-pro-series":   { icon: "🔥", color: "#00ff66" },
  "pc-elite":              { icon: "💀", color: "#ffb800" },
  "monitores":             { icon: "🖥️", color: "#cc44ff" },
  "workstation":           { icon: "💻", color: "#00ddff" },
};

const DEFAULT_META = { icon: "📦", color: "#00ff66" };

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

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 24 }}
    >
      <Link href={`/productos?categoria=${cat.slug}`}>
        <motion.div
          whileHover={{ scale: 1.02, x: 3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl border overflow-hidden cursor-pointer transition-colors"
          style={{
            backgroundColor: active ? `${meta.color}10` : "#0d0d0d",
            borderColor: active ? `${meta.color}40` : "#161616",
          }}
        >
          {/* Hover glow layer */}
          <motion.div
            initial={false}
            className="absolute inset-0 opacity-0 pointer-events-none"
            whileHover={{ opacity: 1 }}
            style={{
              background: `radial-gradient(ellipse at 0% 50%, ${meta.color}12, transparent 70%)`,
            }}
          />

          {/* Active left bar */}
          {active && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
          )}

          {/* Icon */}
          <div
            className="relative z-10 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg border"
            style={{
              backgroundColor: `${meta.color}10`,
              borderColor: `${meta.color}20`,
            }}
          >
            {meta.icon}
          </div>

          {/* Text */}
          <div className="relative z-10 flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate leading-tight transition-colors"
              style={{ color: active ? meta.color : "#aaa" }}
            >
              {cat.name}
            </p>
            <p className="text-[10px] text-[#333] mt-0.5">{cat._count.products} productos</p>
          </div>

          {/* Arrow */}
          <svg
            className="relative z-10 w-3 h-3 flex-shrink-0 transition-colors"
            style={{ color: active ? meta.color : "#2a2a2a" }}
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
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("categoria") ?? "";
  const activeBrand = searchParams.get("marca") ?? "";

  const visible = categories.filter((c) => c._count.products > 0);
  const topBrands = brands.slice(0, 8);

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col border-r border-[#0f0f0f] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-[#080808]">
      <div className="p-3 space-y-1.5">

        {/* Section header */}
        <div className="px-1 pt-2 pb-1">
          <p className="text-[9px] font-bold text-[#252525] uppercase tracking-widest">Categorías</p>
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

        {/* Divider */}
        <div className="h-px bg-[#0f0f0f] mx-1 my-2" />

        {/* Brands section */}
        <div className="px-1 pb-1">
          <p className="text-[9px] font-bold text-[#252525] uppercase tracking-widest mb-2">Marcas</p>
        </div>

        <div className="space-y-0.5">
          {topBrands.map(({ brand, count }, i) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: visible.length * 0.05 + i * 0.03 }}
            >
              <Link
                href={`/productos?marca=${encodeURIComponent(brand)}`}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg group transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className="text-xs transition-colors"
                  style={{ color: activeBrand === brand ? "#00ff66" : "#555" }}
                >
                  {brand}
                </span>
                <span className="text-[10px] text-[#2a2a2a] tabular-nums group-hover:text-[#444] transition-colors">
                  {count}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* All products link */}
        <div className="pt-2 pb-3">
          <Link
            href="/productos"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-[#161616] hover:border-[#00ff66]/30 hover:bg-[#00ff66]/5 transition-all group"
          >
            <span className="text-[10px] text-[#333] group-hover:text-[#00ff66] transition-colors uppercase tracking-wider">
              Ver todo el catálogo
            </span>
          </Link>
        </div>

      </div>
    </aside>
  );
}
