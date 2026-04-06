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

const FALLBACK_GRADIENTS = [
  "from-[#003320] to-[#001a10]",
  "from-[#001830] to-[#000d1a]",
];

export async function FeaturedBanners() {
  const [customBanners, featured] = await Promise.all([
    api.content.banners(),
    api.products.featured({ limit: 2 }),
  ]);

  // Prefer custom banners from admin; fall back to featured products
  if (customBanners.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {customBanners.slice(0, 2).map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            className="relative group flex items-center justify-between gap-3 bg-gradient-to-br from-[#0a1a0f] to-[#050d07] border border-[#1a1a1a] rounded-2xl p-4 sm:p-6 overflow-hidden transition-all duration-300 hover:border-[#00ff66]/20"
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at 80% 50%, ${banner.accentColor}15, transparent 70%)` }}
            />

            {/* Left: text */}
            <div className="relative z-10 flex-1 min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: banner.accentColor }}
              >
                {banner.subtitle ?? "Destacado"}
              </p>
              <h3
                className="text-white font-black text-base leading-snug mb-4 line-clamp-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {banner.title}
              </h3>
              <span
                className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-black transition-all group-hover:scale-105"
                style={{ backgroundColor: banner.accentColor, fontFamily: "var(--font-display)" }}
              >
                Ver más
              </span>
            </div>

            {/* Right: image */}
            <div className="relative flex-shrink-0 w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                sizes="150px"
              />
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // Fallback: featured products
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
        const accent = i === 0 ? "#00ff66" : "#00aaff";
        const gradient = FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]!;

        return (
          <Link
            key={product.id}
            href={`/productos/${product.slug}`}
            className={`relative group flex items-center justify-between gap-3 bg-gradient-to-br ${gradient} border border-[#1a1a1a] rounded-2xl p-4 sm:p-6 overflow-hidden transition-all duration-300`}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at 80% 50%, ${accent}15, transparent 70%)` }}
            />
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
                {compare && <span className="text-sm text-[#444] line-through">{formatCLP(compare)}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-black transition-all group-hover:scale-105"
                  style={{ backgroundColor: accent, fontFamily: "var(--font-display)" }}
                >
                  Comprar
                </span>
                {disc && <span className="text-xs text-[#555]">Ahorrás {formatCLP(compare! - price)}</span>}
              </div>
            </div>
            {img && (
              <div className="relative flex-shrink-0 w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36">
                <Image src={img} alt={product.name} fill className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" sizes="150px" />
              </div>
            )}
            {disc && (
              <div className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full text-black" style={{ backgroundColor: accent }}>
                -{disc}%
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
