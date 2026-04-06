import Link from "next/link";
import { api } from "@/lib/trpc/server";

const CAT_ICON: Record<string, string> = {
  "componentes":           "🔧",
  "pc-gamer":              "🎮",
  "pc-gamer-start-series": "⚡",
  "pc-gamer-pro-series":   "🔥",
  "pc-elite":              "💀",
  "monitores":             "🖥️",
  "workstation":           "💻",
};

export async function HomeSidebar() {
  const categories = await api.products.categories();
  const brands = await api.products.brands({});

  const visible = categories.filter((c) => c._count.products > 0);
  const topBrands = brands.slice(0, 10);

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col gap-0 border-r border-[#111] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-[#080808]">

      {/* Categories */}
      <div className="px-4 pt-6 pb-2">
        <p className="text-[9px] font-bold text-[#2a2a2a] uppercase tracking-widest mb-3">Categorías</p>
        <nav className="space-y-0.5">
          {visible.map((cat) => (
            <Link
              key={cat.slug}
              href={`/productos?categoria=${cat.slug}`}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.04] group transition-colors"
            >
              <span className="text-base leading-none">{CAT_ICON[cat.slug] ?? "📦"}</span>
              <span className="flex-1 text-xs text-[#666] group-hover:text-white transition-colors truncate">
                {cat.name}
              </span>
              <span className="text-[10px] text-[#2a2a2a] tabular-nums">{cat._count.products}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-4 my-3 h-px bg-[#111]" />

      {/* Brands */}
      <div className="px-4 pb-6">
        <p className="text-[9px] font-bold text-[#2a2a2a] uppercase tracking-widest mb-3">Marcas</p>
        <div className="space-y-0.5">
          {topBrands.map(({ brand, count }) => (
            <Link
              key={brand}
              href={`/productos?marca=${encodeURIComponent(brand)}`}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/[0.04] group transition-colors"
            >
              <span className="text-xs text-[#555] group-hover:text-white transition-colors">{brand}</span>
              <span className="text-[10px] text-[#2a2a2a] tabular-nums">{count}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
