import type { Metadata } from "next";
import Link from "next/link";
import { Home, Gamepad2, Zap, Skull, Laptop } from "lucide-react";
import { api } from "@/lib/trpc/server";

export const metadata: Metadata = {
  title: "Builds Gaming — Compuelite",
  description: "PCs gaming armadas y configuradas listas para llevar.",
};

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

const BUILD_CATEGORIES = [
  {
    slug: "pc-gamer-start-series",
    label: "PC Gamer Start Series",
    tagline: "Tu primer PC gamer",
    description: "Entra al mundo del gaming PC sin romper el presupuesto. Rendimiento sólido para juegos competitivos y títulos populares en 1080p a alta tasa de fotogramas.",
    useCase: "FPS competitivos a 144fps+: Valorant, CS2, Fortnite, LoL",
    games: ["Valorant", "CS2", "Fortnite", "League of Legends"],
    specs: { cpu: "Ryzen 5 5600 / i3-12100F", gpu: "RX 6600 / RTX 3050", ram: "16GB DDR4", storage: "500GB NVMe" },
    color: "#4488ff",
    Icon: Zap,
    gradient: "from-blue-500/15 to-blue-600/5",
    glow: "rgba(68,136,255,0.12)",
  },
  {
    slug: "pc-gamer-pro-series",
    label: "PC Gamer Pro Series",
    tagline: "1080p / 1440p sin compromiso",
    description: "El punto dulce del gaming PC. Alta tasa de fotogramas en todos los títulos modernos. Listo para 1440p con configuración alta y ray tracing básico.",
    useCase: "AAA modernos en alta resolución con efectos visuales avanzados",
    games: ["Cyberpunk 2077", "Elden Ring", "Warzone", "Apex Legends"],
    specs: { cpu: "Ryzen 5 7600 / i5-13400F", gpu: "RTX 4060 Ti / RX 7700 XT", ram: "16-32GB DDR5", storage: "1TB NVMe Gen4" },
    color: "#00ff66",
    Icon: Gamepad2,
    gradient: "from-green-500/15 to-emerald-600/5",
    glow: "rgba(0,255,102,0.12)",
  },
  {
    slug: "pc-elite",
    label: "PC Elite®",
    tagline: "4K gaming. Sin límites.",
    description: "La cúspide del gaming PC. Componentes de primera línea, 4K fluido y ray tracing a máxima calidad. Para quienes no aceptan compromisos.",
    useCase: "4K con ray tracing, streaming y creación de contenido simultáneo",
    games: ["Alan Wake 2", "Spider-Man 2", "Flight Simulator", "Red Dead 2"],
    specs: { cpu: "Ryzen 7 7800X3D / i9-14900K", gpu: "RTX 4080 / RTX 4090", ram: "32-64GB DDR5", storage: "2TB NVMe Gen4" },
    color: "#ffb800",
    Icon: Skull,
    gradient: "from-yellow-500/15 to-orange-600/5",
    glow: "rgba(255,184,0,0.12)",
  },
  {
    slug: "workstation",
    label: "PC Workstation",
    tagline: "Rendimiento profesional",
    description: "Diseñada para trabajo intensivo: edición de video 4K, modelado 3D, renderizado, arquitectura y desarrollo. Estabilidad y potencia continua las 24h.",
    useCase: "Edición de video, render 3D, CAD, desarrollo y multitarea pesada",
    games: ["Adobe Premiere", "Blender", "AutoCAD", "DaVinci Resolve"],
    specs: { cpu: "Ryzen 9 7950X / Threadripper", gpu: "RTX 4090 / RTX A-series", ram: "64-128GB DDR5", storage: "4TB NVMe Gen4" },
    color: "#00ddff",
    Icon: Laptop,
    gradient: "from-cyan-500/15 to-blue-600/5",
    glow: "rgba(0,221,255,0.12)",
  },
  {
    slug: "componentes",
    label: "PC Hogar y Oficina",
    tagline: "Productividad y entretenimiento",
    description: "PCs versátiles para uso cotidiano: navegación, oficina, streaming, videollamadas y juegos casuales. Silenciosas, eficientes y confiables.",
    useCase: "Trabajo remoto, Office, streaming y gaming casual sin exigencias",
    games: ["Office 365", "Streaming 4K", "Zoom/Teams", "Juegos casuales"],
    specs: { cpu: "Ryzen 5 5600G / i5-12400", gpu: "Integrada / RX 6400", ram: "16GB DDR4", storage: "512GB SSD" },
    color: "#888888",
    Icon: Home,
    gradient: "from-gray-500/15 to-gray-600/5",
    glow: "rgba(136,136,136,0.12)",
  },
];

export default async function BuildsPage() {
  const allCategories = await api.products.categories();

  // Fetch products per category slug
  const categoryProducts = await Promise.all(
    BUILD_CATEGORIES.map(async (cat) => {
      const { items } = await api.products.list({
        inStock: true,
        categorySlug: cat.slug,
        sort: "price_asc",
        limit: 8,
      });
      const dbCat = allCategories.find((c) => c.slug === cat.slug);
      return { ...cat, products: items, total: dbCat?._count.products ?? items.length };
    })
  );

  return (
    <main className="min-h-screen pt-16 bg-[#0a0a0a]">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-[#111]">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,255,102,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,255,102,0.07),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border mb-6"
            style={{ color: "#00ff66", borderColor: "#00ff6630", background: "#00ff6608" }}
          >
            Configuraciones 2025
          </span>

          <h1
            className="text-5xl sm:text-7xl font-black uppercase leading-none mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span style={{ color: "#00ff66" }}>ELIGE TU</span>
            <br />
            <span className="text-white">NIVEL DE PODER</span>
          </h1>

          <p className="text-[#555] max-w-2xl mx-auto text-sm leading-relaxed mb-8">
            Un build es una PC ensamblada y optimizada para un propósito específico. Cada línea combina
            componentes calibrados para entregar un objetivo de rendimiento concreto. Elige la línea
            que se ajuste a tu uso, presupuesto y ambiciones.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {["Garantía incluida", "Stock real", "Soporte postventa"].map((label) => (
              <div key={label} className="flex items-center gap-2 text-xs text-[#444] uppercase tracking-wider font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                {label}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/builder"
              className="px-6 py-2.5 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded hover:bg-[#00cc52] transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Armar PC personalizado →
            </Link>
            <Link
              href="/productos"
              className="px-6 py-2.5 border border-[#222] text-[#666] text-sm uppercase tracking-wider rounded hover:border-[#444] hover:text-white transition-all"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category tier cards ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categoryProducts.map((cat, idx) => {
            const { Icon } = cat;
            return (
              <div
                key={cat.slug}
                className="relative flex flex-col bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden group hover:border-opacity-50 transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />
                <div
                  className="absolute top-0 right-0 w-20 h-20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: cat.glow }}
                />

                <div className="relative p-4 flex-1 flex flex-col gap-3">
                  {/* Icon + index */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center border"
                      style={{ background: `${cat.color}12`, borderColor: `${cat.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <span
                      className="text-[9px] font-mono border rounded px-1.5 py-0.5"
                      style={{ color: cat.color, borderColor: `${cat.color}35`, background: `${cat.color}0a` }}
                    >
                      {cat.total} modelos
                    </span>
                  </div>

                  {/* Name */}
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-wide text-white mb-0.5 leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {cat.label}
                    </h2>
                    <p className="text-[10px]" style={{ color: cat.color }}>{cat.tagline}</p>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-[#555] leading-relaxed">{cat.description}</p>

                  {/* Use case */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: cat.color }}>
                      Uso ideal
                    </p>
                    <p className="text-[10px] text-[#555] leading-snug">{cat.useCase}</p>
                  </div>

                  {/* Reference apps/games */}
                  <div className="flex flex-wrap gap-1">
                    {cat.games.map((g) => (
                      <span
                        key={g}
                        className="text-[9px] px-1.5 py-0.5 rounded border text-[#444]"
                        style={{ borderColor: "#1a1a1a", background: "#0a0a0a" }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Specs */}
                  <div className="border-t border-[#111] pt-3 space-y-1">
                    {Object.entries(cat.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 text-[9px]">
                        <span className="text-[#2a2a2a] uppercase font-bold">{k}:</span>
                        <span className="text-[#555] text-right">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/productos?categoria=${cat.slug}`}
                    className="mt-auto flex items-center justify-between w-full pt-3 border-t border-[#111] text-[10px] font-bold uppercase tracking-wider transition-colors group/link"
                    style={{ color: "#2a2a2a" }}
                  >
                    <span className="group-hover/link:text-white transition-colors">
                      Ver todos los modelos
                    </span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Products per category ─────────────────────────────────── */}
      <div className="border-t border-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
          {categoryProducts.map((cat) => {
            if (cat.products.length === 0) return null;
            const { Icon } = cat;
            return (
              <section key={cat.slug}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{ background: `${cat.color}12`, borderColor: `${cat.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <h2
                        className="text-sm font-black uppercase tracking-widest"
                        style={{ color: cat.color, fontFamily: "var(--font-display)" }}
                      >
                        {cat.label}
                      </h2>
                      <p className="text-[10px] text-[#444]">{cat.tagline}</p>
                    </div>
                  </div>
                  <Link
                    href={`/productos?categoria=${cat.slug}`}
                    className="text-[10px] text-[#333] hover:text-[#888] transition-colors uppercase tracking-wider"
                  >
                    Ver todos →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cat.products.slice(0, 4).map((product) => {
                    const img = product.images[0]?.url;
                    return (
                      <Link
                        key={product.id}
                        href={`/productos/${product.slug}`}
                        className="group flex flex-col bg-[#0d0d0d] border border-[#161616] rounded-xl overflow-hidden transition-all duration-300 hover:border-opacity-40"
                      >
                        <div className="aspect-[4/3] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={product.name}
                              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-4xl opacity-10">🖥️</span>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <p className="text-[10px] text-[#333] mb-1">{product.brand}</p>
                          <p className="text-xs font-semibold text-[#777] leading-snug line-clamp-2 flex-1 group-hover:text-white transition-colors">
                            {product.name}
                          </p>
                          <div className="mt-3 flex items-end justify-between">
                            <p
                              className="text-base font-black font-mono"
                              style={{ color: cat.color }}
                            >
                              {formatCLP(Number(product.price))}
                            </p>
                            {product.stock <= 3 && (
                              <span className="text-[10px] text-[#ffb800]">Últimas {product.stock}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {cat.products.length > 4 && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/productos?categoria=${cat.slug}`}
                      className="text-xs text-[#333] hover:text-[#888] transition-colors"
                    >
                      +{cat.products.length - 4} modelos más en esta línea →
                    </Link>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* ── Builder CTA ──────────────────────────────────────────── */}
      <div className="border-t border-[#111] bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-[10px] text-[#00ff66] uppercase tracking-widest mb-3 font-bold">
            ¿No encontraste lo que buscas?
          </p>
          <h2
            className="text-2xl font-black uppercase text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Arma tu PC a medida
          </h2>
          <p className="text-xs text-[#444] mb-8 leading-relaxed max-w-md mx-auto">
            Usa nuestro configurador para elegir cada componente con verificación de compatibilidad en tiempo real.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded hover:bg-[#00cc52] transition-all"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Empezar build →
          </Link>
        </div>
      </div>

    </main>
  );
}
