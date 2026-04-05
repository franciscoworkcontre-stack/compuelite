import Link from "next/link";
import { api } from "@/lib/trpc/server";

// Icon + color map per slug
const CAT_META: Record<string, { icon: string; color: string; description: string }> = {
  "componentes":           { icon: "🔧", color: "#888888", description: "GPU, CPU, RAM, almacenamiento y más" },
  "pc-gamer":              { icon: "🎮", color: "#00ff66", description: "PCs gamer armadas y listas para jugar" },
  "pc-gamer-start-series": { icon: "⚡", color: "#4488ff", description: "Tu primer PC gamer, desde $667K" },
  "pc-gamer-pro-series":   { icon: "🔥", color: "#00ff66", description: "1080p sin compromiso, RTX 3050–4070" },
  "pc-elite":              { icon: "💀", color: "#ffb800", description: "1440p / 4K — sin límites de rendimiento" },
  "monitores":             { icon: "🖥️", color: "#cc44ff", description: "144Hz, 165Hz, 240Hz — IPS y VA" },
  "workstation":           { icon: "💻", color: "#00ddff", description: "Estaciones de trabajo para creadores e IA" },
};

export async function CategoriesSection() {
  const categories = await api.products.categories();

  // Only show categories with products
  const visible = categories.filter((c) => c._count.products > 0);

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs font-medium text-[#00ff66] uppercase tracking-widest mb-2">
            Catálogo
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black uppercase text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Productos
          </h2>
        </div>
        <Link
          href="/productos"
          className="hidden sm:flex items-center gap-2 text-sm text-[#888] hover:text-[#00ff66] transition-colors uppercase tracking-wider"
        >
          Ver todo
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((cat) => {
          const meta = CAT_META[cat.slug] ?? { icon: "📦", color: "#00ff66", description: "" };
          return (
            <Link
              key={cat.slug}
              href={`/productos?categoria=${cat.slug}`}
              className="group relative flex flex-col p-5 bg-[#111] border border-[#222] rounded-lg hover:border-[#00ff66] transition-all duration-300 overflow-hidden"
            >
              {/* Background accent */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: meta.color }}
              />

              {/* Icon */}
              <span className="text-3xl mb-3">{meta.icon}</span>

              {/* Name */}
              <h3 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-[#00ff66] transition-colors">
                {cat.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#555] leading-snug mb-3">
                {cat.description ?? meta.description}
              </p>

              {/* Count */}
              <div className="mt-auto flex items-center gap-1">
                <span className="text-xs font-mono font-bold" style={{ color: meta.color }}>
                  {cat._count.products}
                </span>
                <span className="text-xs text-[#555]">productos</span>
              </div>

              {/* Arrow */}
              <svg
                className="absolute bottom-4 right-4 w-4 h-4 text-[#333] group-hover:text-[#00ff66] transition-all group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
