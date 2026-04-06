import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/trpc/server";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

const BANNER_GRADIENTS = [
  "from-[#003320] to-[#001a10]",
  "from-[#001830] to-[#000d1a]",
];

const BANNER_ACCENT = ["#00ff66", "#00aaff"];

export async function FeaturedBanners() {
  const featured = await api.products.featured({ limit: 4 });

  // Use first 2 featured, fallback if fewer
  const banners = featured.slice(0, 2);
  if (banners.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {banners.map((product, i) => {
        const price = Number(product.price);
        const compare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
        const disc = compare && compare > price
          ? Math.round(((compare - price) / compare) * 100)
          : null;
        const img = product.images[0]?.url;
        const accent = BANNER_ACCENT[i % BANNER_ACCENT.length]!;
        const gradient = BANNER_GRADIENTS[i % BANNER_GRADIENTS.length]!;

        return (
          <Link
            key={product.id}
            href={`/productos/${product.slug}`}
            className={`relative group flex items-center justify-between gap-4 bg-gradient-to-br ${gradient} border border-[#1a1a1a] hover:border-[${accent}]/30 rounded-2xl p-6 overflow-hidden transition-all duration-300`}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at 80% 50%, ${accent}15, transparent 70%)` }}
            />

            {/* Left: text */}
            <div className="relative z-10 flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>
                {product.brand}
              </p>
              <h3 className="text-white font-black text-base leading-snug mb-3 line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
                {product.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                <span className="text-2xl font-black" style={{ color: accent, fontFamily: "var(--font-display)" }}>
                  {formatCLP(price)}
                </span>
                {compare && (
                  <span className="text-sm text-[#444] line-through">{formatCLP(compare)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-black transition-all group-hover:scale-105"
                  style={{ backgroundColor: accent, fontFamily: "var(--font-display)" }}
                >
                  Comprar
                </span>
                {disc && (
                  <span className="text-xs text-[#555]">
                    Ahorrás {formatCLP(compare! - price)}
                  </span>
                )}
              </div>
            </div>

            {/* Right: image */}
            {img && (
              <div className="relative flex-shrink-0 w-32 h-32 sm:w-36 sm:h-36">
                <Image
                  src={img}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  sizes="150px"
                />
              </div>
            )}

            {/* Discount badge */}
            {disc && (
              <div
                className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full text-black"
                style={{ backgroundColor: accent }}
              >
                -{disc}%
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
