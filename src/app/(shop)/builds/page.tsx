import type { Metadata } from "next";
import Link from "next/link";
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
    color: "#4488ff",
    icon: "🎮",
    priceMax: 600000,
  },
  {
    key: "mid",
    label: "Mid Range",
    tagline: "1080p sin compromiso",
    color: "#00ff66",
    icon: "⚡",
    priceMax: 1200000,
  },
  {
    key: "high",
    label: "High End",
    tagline: "1440p / 4K listo",
    color: "#ffb800",
    icon: "🔥",
    priceMax: 2500000,
  },
  {
    key: "ultra",
    label: "Ultra",
    tagline: "Sin límites",
    color: "#ff3333",
    icon: "💀",
    priceMax: 99999999,
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
      {/* Hero */}
      <div className="border-b border-[#1a1a1a] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-grid opacity-30"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <p className="text-xs text-[#00ff66] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-display)" }}>
            Configuraciones
          </p>
          <h1 className="text-4xl font-black uppercase text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}>
            PC Gaming Builds
          </h1>
          <p className="text-[#555] max-w-lg text-sm leading-relaxed">
            Encuentra el equipo ideal según tu presupuesto. Todas las PCs incluyen
            garantía, factura y soporte técnico post-venta.
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              href="/builder"
              className="px-5 py-2.5 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded hover:bg-[#00cc52] transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Armar PC personalizado
            </Link>
            <Link
              href="/productos"
              className="px-5 py-2.5 border border-[#333] text-[#888] text-sm uppercase tracking-wider rounded hover:border-[#555] hover:text-white transition-all"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {tiers.map((tier) => (
          <section key={tier.key}>
            {/* Tier header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
                style={{
                  background: `${tier.color}18`,
                  borderColor: `${tier.color}40`,
                }}
              >
                {tier.icon}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2
                    className="text-lg font-black uppercase tracking-wider"
                    style={{ color: tier.color, fontFamily: "var(--font-display)" }}
                  >
                    {tier.label}
                  </h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded border"
                    style={{ color: tier.color, borderColor: `${tier.color}40`, background: `${tier.color}10` }}
                  >
                    {tier.products.length} disponibles
                  </span>
                </div>
                <p className="text-xs text-[#555]">{tier.tagline}</p>
              </div>
              <div className="ml-auto hidden sm:block">
                <Link
                  href={`/productos?precioMax=${tier.priceMax}`}
                  className="text-xs text-[#444] hover:text-[#888] transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
            </div>

            {tier.products.length === 0 ? (
              <div className="flex items-center gap-3 p-6 bg-[#111] border border-[#1a1a1a] rounded-xl text-xs text-[#444]">
                No hay productos en este rango actualmente. Revisa más tarde.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tier.products.slice(0, 4).map((product) => {
                  const img = product.images[0]?.url;
                  const price = Number(product.price);
                  return (
                    <Link
                      key={product.id}
                      href={`/productos/${product.slug}`}
                      className="group flex flex-col bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#00ff66]/30 transition-all"
                    >
                      <div className="aspect-[4/3] bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
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
                        <p className="text-xs text-[#555] mb-1">{product.brand}</p>
                        <p className="text-sm font-semibold text-white leading-snug line-clamp-2 flex-1 group-hover:text-[#00ff66] transition-colors">
                          {product.name}
                        </p>
                        <div className="mt-3 flex items-end justify-between">
                          <p className="text-lg font-black font-mono text-[#00ff66]">
                            {formatCLP(price)}
                          </p>
                          {product.stock <= 3 && (
                            <span className="text-xs text-[#ffb800]">Últimas {product.stock}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {tier.products.length > 4 && (
              <div className="mt-4 text-center">
                <Link
                  href={`/productos`}
                  className="text-xs text-[#444] hover:text-[#888] transition-colors"
                >
                  +{tier.products.length - 4} equipos más en este rango →
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Builder CTA */}
      <div className="border-t border-[#1a1a1a] bg-[#0d1a0d]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-xs text-[#00ff66] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-display)" }}>
            ¿No encontraste lo que buscas?
          </p>
          <h2 className="text-2xl font-black uppercase text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}>
            Arma tu PC personalizado
          </h2>
          <p className="text-sm text-[#555] mb-8 leading-relaxed">
            Usa nuestro configurador para elegir cada componente a tu medida.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#00ff66] text-black text-sm font-black uppercase tracking-wider rounded hover:bg-[#00cc52] transition-all"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Arma tu PC →
          </Link>
        </div>
      </div>
    </main>
  );
}
