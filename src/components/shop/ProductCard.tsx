import Link from "next/link";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImage = Product & {
  images: ProductImage[];
};

interface Props {
  product: ProductWithImage;
}

function formatCLP(n: number | string | { toNumber?: () => number }) {
  const val = typeof n === "object" && n.toNumber ? n.toNumber() : Number(n);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(val);
}

function discountPct(price: unknown, compare: unknown): number | null {
  if (!compare) return null;
  const p = Number(price);
  const c = Number(compare);
  if (c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

export function ProductCard({ product }: Props) {
  const disc = discountPct(product.price, product.compareAtPrice);
  const img = product.images[0]?.url;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#00ff66] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,102,0.08)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-5xl opacity-10 group-hover:opacity-20 transition-opacity">🖥️</div>
        )}

        {/* Discount badge */}
        {disc && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#ff3333] text-white text-xs font-bold rounded"
            style={{ fontFamily: "var(--font-display)" }}>
            -{disc}%
          </div>
        )}

        {/* Stock indicator */}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#ffb800]/20 border border-[#ffb800]/40 text-[#ffb800] text-xs rounded">
            Últimas {product.stock}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand */}
        <p className="text-xs text-[#555] uppercase tracking-wider mb-1">{product.brand}</p>

        {/* Name */}
        <h3 className="text-sm font-semibold text-white leading-snug mb-3 group-hover:text-[#00ff66] transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto">
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <p className="text-xs text-[#555] line-through mb-0.5">
              {formatCLP(product.compareAtPrice)}
            </p>
          )}
          <p
            className="text-lg font-bold font-mono text-[#00ff66]"
            style={{ textShadow: "0 0 12px rgba(0,255,102,0.25)" }}
          >
            {formatCLP(product.price)}
          </p>
          <p className="text-xs text-[#555] mt-0.5">IVA incluido</p>
        </div>
      </div>

      {/* CTA bar */}
      <div className="px-4 pb-4">
        <div className="w-full py-2 bg-[#00ff66]/5 border border-[#00ff66]/20 rounded text-center text-xs font-bold text-[#00ff66] uppercase tracking-wider group-hover:bg-[#00ff66] group-hover:text-black transition-all"
          style={{ fontFamily: "var(--font-display)" }}>
          Ver detalle
        </div>
      </div>
    </Link>
  );
}
