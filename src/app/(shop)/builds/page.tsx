import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, Zap, Rocket, Flame } from "lucide-react";
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

const BUILD_TIERS = [
  {
    key: "starter",
    label: "Starter",
    tagline: "Tu primer PC gamer",
    description: "Rendimiento sólido para juegos competitivos y títulos populares en 1080p. Ideal para quien entra al mundo PC gaming sin romper el presupuesto.",
    useCase: "FPS competitivos y juegos de alto rendimiento a 144fps+",
    games: ["Valorant", "CS2", "Fortnite", "League of Legends"],
    specs: { cpu: "Ryzen 5 5600 / i3-12100F", gpu: "RX 6600 / RTX 3050", ram: "16GB DDR4", storage: "500GB NVMe" },
    priceRange: "$400.000 – $700.000",
    priceMax: 700000,
    color: "#4488ff",
    Icon: Cpu,
    gradient: "from-blue-500/15 to-blue-600/5",
    glow: "rgba(68,136,255,0.15)",
  },
  {
    key: "mid",
    label: "Mid Range",
    tagline: "1080p / 1440p sin compromiso",
    description: "El punto dulce del gaming PC. Alta tasa de fotogramas en todos los títulos modernos. Preparado para 1440p con configuración alta.",
    useCase: "AAA modernos en alta resolución con ray tracing básico",
    games: ["Cyberpunk 2077", "Elden Ring", "Warzone", "Apex Legends"],
    specs: { cpu: "Ryzen 5 7600 / i5-13400F", gpu: "RTX 4060 Ti / RX 7600 XT", ram: "16GB DDR5", storage: "1TB NVMe Gen4" },
    priceRange: "$700.000 – $1.200.000",
    priceMax: 1200000,
    color: "#00ff66",
    Icon: Zap,
    gradient: "from-green-500/15 to-emerald-600/5",
    glow: "rgba(0,255,102,0.15)",
  },
  {
    key: "high",
    label: "High End",
    tagline: "4K gaming con ray tracing",
    description: "Experiencia premium en cualquier título. Máxima calidad gráfica, 4K fluido y preparado para los próximos 3-4 años sin degradar rendimiento.",
    useCase: "4K a máxima calidad, streaming y creación de contenido",
    games: ["Alan Wake 2", "Starfield", "Hogwarts Legacy", "Spider-Man 2"],
    specs: { cpu: "Ryzen 7 7800X3D / i7-13700K", gpu: "RTX 4070 Ti / RX 7900 XT", ram: "32GB DDR5", storage: "2TB NVMe Gen4" },
    priceRange: "$1.200.000 – $2.500.000",
    priceMax: 2500000,
    color: "#ffb800",
    Icon: Rocket,
    gradient: "from-yellow-500/15 to-orange-600/5",
    glow: "rgba(255,184,0,0.15)",
  },
  {
    key: "ultra",
    label: "Ultra",
    tagline: "Sin límites",
    description: "La cúspide del hardware gaming. Sin concesiones. Cada componente es lo mejor disponible. Para quienes exigen lo máximo sin importar el precio.",
    useCase: "4K/8K extremo, edición de video 4K, renderizado y gaming sin límites",
    games: ["Flight Simulator", "Red Dead 2", "Cualquier juego maxeado", "4K/144fps"],
    specs: { cpu: "Core i9-14900K / Ryzen 9 7950X3D", gpu: "RTX 4090", ram: "64GB DDR5", storage: "4TB NVMe Gen4" },
    priceRange: "$2.500.000+",
    priceMax: 99999999,
    color: "#ff3333",
    Icon: Flame,
    gradient: "from-red-500/15 to-orange-600/5",
    glow: "rgba(255,51,51,0.15)",
  },
];

export default async function BuildsPage() {
  const { items: products } = await api.products.list({
    inStock: true,
    sort: "price_asc",
    limit: 100,
  });

  // Group by price tier
  const tiers = BUILD_TIERS.map((tier, i) => {
    const priceMin = i === 0 ? 0 : BUILD_TIERS[i - 1].priceMax;
    const tierProducts = products.filter((p) => {
      const price = Number(p.price);
      return price >= priceMin && price < tier.priceMax;
    });
    return { ...tier, products: tierProducts };
  });

  return (
    <main className="min-h-screen pt-16 bg-[#0a0a0a]">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-[#111]">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,255,102,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Center radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,255,102,0.08),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border mb-6"
            style={{ color: "#00ff66", borderColor: "#00ff6630", background: "#00ff6608" }}
          >
            Gaming Builds 2025
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
            Un build es una PC ensamblada y optimizada para un propósito específico. Cada tier combina componentes
            calibrados para entregar un objetivo de rendimiento concreto dentro de un rango de presupuesto.
            Elige según tu resolución objetivo, juegos y ambiciones.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {["Specs curados", "Stock disponible", "Garantía incluida"].map((label) => (
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

      {/* ── Tier cards ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier, idx) => {
            const { Icon } = tier;
            return (
              <div
                key={tier.key}
                className={`relative flex flex-col bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden group hover:border-opacity-60 transition-all duration-300`}
                style={{ ["--hover-border" as string]: tier.color }}
              >
                {/* Hover gradient fill */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />
                {/* Corner glow */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: tier.glow }}
                />

                <div className="relative p-5 flex-1 flex flex-col gap-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center border transition-colors"
                      style={{ background: `${tier.color}12`, borderColor: `${tier.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: tier.color }} />
                    </div>
                    <span
                      className="text-[9px] font-mono border rounded px-1.5 py-0.5"
                      style={{ color: tier.color, borderColor: `${tier.color}35`, background: `${tier.color}0a` }}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Name + price */}
                  <div>
                    <h2
                      className="text-xl font-black uppercase tracking-wider text-white mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {tier.label}
                    </h2>
                    <div
                      className="text-lg font-bold font-mono mb-2"
                      style={{ color: tier.color }}
                    >
                      {tier.priceRange}
                    </div>
                    <p className="text-xs text-[#555] leading-relaxed">{tier.description}</p>
                  </div>

                  {/* Use case */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: tier.color }}>
                      Uso ideal
                    </p>
                    <p className="text-xs text-[#666] leading-snug">{tier.useCase}</p>
                  </div>

                  {/* Games */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: tier.color }}>
                      Juegos de referencia
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tier.games.map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-2 py-0.5 rounded border text-[#555]"
                          style={{ borderColor: "#1a1a1a", background: "#0a0a0a" }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="border-t border-[#111] pt-3 space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: tier.color }}>
                      Specs típicos
                    </p>
                    {Object.entries(tier.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 text-[10px]">
                        <span className="text-[#333] uppercase font-bold">{k}:</span>
                        <span className="text-[#666] text-right">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/productos?precioMax=${tier.priceMax}`}
                    className="mt-auto flex items-center justify-between w-full pt-3 border-t border-[#111] text-xs font-bold uppercase tracking-wider transition-colors group/link"
                    style={{ color: "#333" }}
                  >
                    <span className="group-hover/link:text-white transition-colors">
                      Ver modelos disponibles
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

      {/* ── Products by tier ─────────────────────────────────────── */}
      <div className="border-t border-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
          {tiers.map((tier) => {
            if (tier.products.length === 0) return null;
            const { Icon } = tier;
            return (
              <section key={tier.key}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center border"
                    style={{ background: `${tier.color}12`, borderColor: `${tier.color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: tier.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        className="text-sm font-black uppercase tracking-widest"
                        style={{ color: tier.color, fontFamily: "var(--font-display)" }}
                      >
                        {tier.label}
                      </h2>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded border"
                        style={{ color: tier.color, borderColor: `${tier.color}35`, background: `${tier.color}0a` }}
                      >
                        {tier.products.length} disponibles
                      </span>
                    </div>
                    <p className="text-[10px] text-[#444]">{tier.tagline}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tier.products.slice(0, 4).map((product) => {
                    const img = product.images[0]?.url;
                    return (
                      <Link
                        key={product.id}
                        href={`/productos/${product.slug}`}
                        className="group flex flex-col bg-[#0d0d0d] border border-[#161616] rounded-xl overflow-hidden transition-all duration-300"
                        style={{ ["--hover-color" as string]: tier.color }}
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
                          <p className="text-xs font-semibold text-[#888] leading-snug line-clamp-2 flex-1 group-hover:text-white transition-colors">
                            {product.name}
                          </p>
                          <div className="mt-3 flex items-end justify-between">
                            <p className="text-base font-black font-mono" style={{ color: tier.color }}>
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

                {tier.products.length > 4 && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/productos?precioMax=${tier.priceMax}`}
                      className="text-xs text-[#333] hover:text-[#888] transition-colors"
                    >
                      +{tier.products.length - 4} equipos más en este rango →
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
