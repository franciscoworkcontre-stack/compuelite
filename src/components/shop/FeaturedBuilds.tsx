import Link from "next/link";

const featuredBuilds = [
  {
    id: "budget-gamer",
    name: "Budget Gamer",
    description: "El mejor rendimiento para 1080p gaming",
    price: 699990,
    components: ["Ryzen 5 7600", "RX 7600", "16GB DDR5", "B650 MOBO"],
    badge: "Más vendido",
    badgeColor: "#00ff66",
    fps: "144fps en 1080p",
    targetGames: ["Valorant", "CS2", "Fortnite"],
  },
  {
    id: "mid-range",
    name: "Mid-Range Elite",
    description: "1440p a alta resolución sin compromisos",
    price: 1299990,
    components: ["Ryzen 7 7800X3D", "RTX 4070 Ti", "32GB DDR5", "X670E MOBO"],
    badge: "Recomendado",
    badgeColor: "#0088ff",
    fps: "165fps en 1440p",
    targetGames: ["Cyberpunk", "Elden Ring", "Warzone"],
  },
  {
    id: "ultra-beast",
    name: "Ultra Beast",
    description: "4K sin límites. La build definitiva.",
    price: 2899990,
    components: ["Core i9-14900K", "RTX 4090", "64GB DDR5", "Z790 MOBO"],
    badge: "Top tier",
    badgeColor: "#ffb800",
    fps: "120fps en 4K",
    targetGames: ["Todo a Ultra", "4K/120fps"],
  },
];

function formatCLP(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

export function FeaturedBuilds({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="grid sm:grid-cols-3 gap-3">
        {featuredBuilds.map((build) => (
          <Link
            key={build.id}
            href={`/builder?base=${build.id}`}
            className="group flex items-center gap-3 p-4 bg-[#0d0d0d] border border-[#161616] rounded-xl hover:border-[#00ff66]/30 transition-all"
          >
            <div className="flex-shrink-0 text-3xl">🖥️</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p
                  className="text-xs font-black text-white group-hover:text-[#00ff66] transition-colors truncate"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {build.name}
                </p>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                  style={{ background: `${build.badgeColor}15`, color: build.badgeColor }}
                >
                  {build.badge}
                </span>
              </div>
              <p className="text-[10px] text-[#444] truncate">{build.fps}</p>
              <p className="text-xs font-bold text-[#00ff66] mt-1">{formatCLP(build.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs font-medium text-[#00ff66] uppercase tracking-widest mb-2">
            Configuraciones
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black uppercase text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Builds Populares
          </h2>
        </div>
        <Link
          href="/builds"
          className="hidden sm:flex items-center gap-2 text-sm text-[#888] hover:text-[#00ff66] transition-colors uppercase tracking-wider"
        >
          Ver todos
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {featuredBuilds.map((build) => (
          <div
            key={build.id}
            className="group relative flex flex-col bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#00ff66] transition-all duration-300"
          >
            {/* Preview placeholder */}
            <div className="relative h-48 bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
              <div className="text-6xl opacity-20">🖥️</div>

              {/* Badge */}
              <div
                className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
                style={{
                  background: `${build.badgeColor}15`,
                  color: build.badgeColor,
                  border: `1px solid ${build.badgeColor}40`,
                  fontFamily: "var(--font-display)",
                }}
              >
                {build.badge}
              </div>

              {/* FPS indicator */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#0a0a0a]/90 rounded border border-[#222] text-xs font-mono text-[#00ff66]">
                {build.fps}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
              <h3
                className="text-lg font-black text-white uppercase mb-1 group-hover:text-[#00ff66] transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {build.name}
              </h3>
              <p className="text-sm text-[#666] mb-4">{build.description}</p>

              {/* Components list */}
              <div className="space-y-1 mb-4">
                {build.components.map((comp) => (
                  <div key={comp} className="flex items-center gap-2 text-xs text-[#555]">
                    <span className="w-1 h-1 rounded-full bg-[#333]" />
                    {comp}
                  </div>
                ))}
              </div>

              {/* Games */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {build.targetGames.map((game) => (
                  <span
                    key={game}
                    className="text-xs px-2 py-0.5 bg-[#0a0a0a] border border-[#222] rounded text-[#555]"
                  >
                    {game}
                  </span>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="mt-auto flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#555] uppercase tracking-wider mb-0.5">Desde</div>
                  <div
                    className="text-xl font-bold font-mono text-[#00ff66]"
                    style={{}}
                  >
                    {formatCLP(build.price)}
                  </div>
                </div>
                <Link
                  href={`/builder?base=${build.id}`}
                  className="px-4 py-2 bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#00ff66] hover:text-black transition-all"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Personalizar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
