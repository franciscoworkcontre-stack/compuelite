import Link from "next/link";

const categories = [
  {
    slug: "gpu",
    name: "Tarjetas de Video",
    description: "RTX 4090 hasta presupuesto",
    icon: "🖥️",
    count: "120+",
    color: "#ff6b35",
  },
  {
    slug: "cpu",
    name: "Procesadores",
    description: "Intel & AMD última generación",
    icon: "⚡",
    count: "80+",
    color: "#00ff66",
  },
  {
    slug: "motherboard",
    name: "Placas Madre",
    description: "AM5, LGA1700, DDR5",
    icon: "🔲",
    count: "95+",
    color: "#0088ff",
  },
  {
    slug: "ram",
    name: "Memorias RAM",
    description: "DDR4 y DDR5 hasta 7200MHz",
    icon: "💾",
    count: "60+",
    color: "#ff3333",
  },
  {
    slug: "almacenamiento",
    name: "Almacenamiento",
    description: "NVMe Gen4/5, SSD, HDD",
    icon: "🦊",
    count: "75+",
    color: "#ffb800",
  },
  {
    slug: "gabinetes",
    name: "Gabinetes",
    description: "ATX, Micro-ATX, ITX con RGB",
    icon: "🗂️",
    count: "50+",
    color: "#cc44ff",
  },
  {
    slug: "fuentes",
    name: "Fuentes de Poder",
    description: "80+ Gold, Platinum, Titanium",
    icon: "🔌",
    count: "45+",
    color: "#00ddff",
  },
  {
    slug: "refrigeracion",
    name: "Refrigeración",
    description: "AIO 240/360mm, aire premium",
    icon: "❄️",
    count: "55+",
    color: "#00ffdd",
  },
];

export function CategoriesSection() {
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
            Componentes
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
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/productos/${cat.slug}`}
            className="group relative flex flex-col p-5 bg-[#111] border border-[#222] rounded-lg hover:border-[#00ff66] hover:bg-[#111] transition-all duration-300 overflow-hidden"
          >
            {/* Background accent */}
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
              style={{ background: cat.color }}
            />

            {/* Icon */}
            <span className="text-3xl mb-3">{cat.icon}</span>

            {/* Name */}
            <h3 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-[#00ff66] transition-colors">
              {cat.name}
            </h3>

            {/* Description */}
            <p className="text-xs text-[#555] leading-snug mb-3">
              {cat.description}
            </p>

            {/* Count */}
            <div className="mt-auto flex items-center gap-1">
              <span
                className="text-xs font-mono font-bold"
                style={{ color: cat.color }}
              >
                {cat.count}
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
        ))}
      </div>
    </section>
  );
}
