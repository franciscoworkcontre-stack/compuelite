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

export async function BestDeals({ config = {} }: { config?: Record<string, unknown> }) {
  const limit = typeof config.maxItems === "number" ? config.maxItems : 10;
  const deals = await api.products.bestDeals({ limit });
  if (deals.length === 0) return null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff66]" />
            </span>
            <h2
              className="text-sm font-black text-white uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {typeof config.title === "string" ? config.title : "Today's Best Deals"}
            </h2>
          </div>
          <span className="text-[10px] text-[#333] border border-[#1a1a1a] rounded-full px-2 py-0.5">
            {deals.length} ofertas activas
          </span>
        </div>
        <Link
          href="/productos"
          className="text-[10px] text-[#444] hover:text-[#00ff66] transition-colors uppercase tracking-widest flex items-center gap-1"
        >
          Ver todos
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {deals.map((product) => {
          const price = Number(product.price);
          const compare = Number(product.compareAtPrice);
          const saved = compare - price;
          const img = product.images[0]?.url;

          return (
            <Link
              key={product.id}
              href={`/productos/${product.slug}`}
              className="group flex-shrink-0 w-40 flex flex-col bg-[#0d0d0d] border border-[#161616] rounded-xl overflow-hidden hover:border-[#00ff66]/30 transition-all duration-200"
            >
              {/* Image */}
              <div className="relative aspect-square bg-[#080808]">
                {img ? (
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#1a1a1a] text-3xl">📦</div>
                )}
                {/* Discount badge */}
                <div className="absolute top-2 left-2 bg-[#00ff66] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  -{product.discountPct}%
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-1.5">
                <p className="text-[9px] text-[#333] uppercase tracking-wider truncate">{product.brand}</p>
                <p className="text-xs text-[#888] group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  {product.name}
                </p>
                <div className="mt-auto pt-1.5 border-t border-[#111]">
                  <p className="text-[10px] text-[#444] line-through">{formatCLP(compare)}</p>
                  <p className="text-sm font-bold text-[#00ff66]" style={{ fontFamily: "var(--font-display)" }}>
                    {formatCLP(price)}
                  </p>
                  <p className="text-[9px] text-[#333]">Ahorrás {formatCLP(saved)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
