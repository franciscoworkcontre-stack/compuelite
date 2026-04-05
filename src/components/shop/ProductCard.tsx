import Link from "next/link";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImage = Product & { images: ProductImage[] };

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

function getSpecPills(product: ProductWithImage): string[] {
  const specs = product.specs as Record<string, unknown> | null;
  if (!specs || !product.componentType) return [];

  switch (product.componentType) {
    case "GPU":
      return [specs.vram, specs.tdp ? `${specs.tdp}W` : null].filter(Boolean) as string[];
    case "CPU":
      return [
        specs.cores ? `${specs.cores}C` : null,
        specs.boost_clock,
        specs.socket,
      ].filter(Boolean) as string[];
    case "MOTHERBOARD":
      return [specs.socket, specs.chipset, specs.form_factor].filter(Boolean) as string[];
    case "RAM":
      return [specs.capacity, specs.type, specs.speed?.toString().replace(" MHz", "MHz")].filter(Boolean) as string[];
    case "STORAGE_SSD":
      return [specs.capacity, specs.interface?.toString().replace("NVMe PCIe ", "PCIe ")].filter(Boolean) as string[];
    case "CPU_COOLER":
      return [specs.type, specs.tdp ? `${specs.tdp}W TDP` : null].filter(Boolean) as string[];
    case "PSU":
      return [specs.wattage ? `${specs.wattage}W` : null, specs.efficiency, specs.modular ? `${specs.modular} Modular` : null].filter(Boolean) as string[];
    case "CASE":
      return [specs.form_factor, specs.max_gpu_length ? `GPU ≤${specs.max_gpu_length}` : null].filter(Boolean) as string[];
    default:
      return [];
  }
}

export function ProductCard({ product }: { product: ProductWithImage }) {
  const disc = discountPct(product.price, product.compareAtPrice);
  const img = product.images[0]?.url;
  const pills = getSpecPills(product);

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group relative flex flex-col bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all duration-200"
    >
      {/* Corner brackets on hover — no glow */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden group-hover:block">
        <div className="absolute left-0 top-0 w-5 h-px bg-white/20" />
        <div className="absolute left-0 top-0 w-px h-5 bg-white/20" />
        <div className="absolute right-0 top-0 w-5 h-px bg-white/20" />
        <div className="absolute right-0 top-0 w-px h-5 bg-white/20" />
        <div className="absolute left-0 bottom-0 w-5 h-px bg-white/20" />
        <div className="absolute left-0 bottom-0 w-px h-5 bg-white/20" />
        <div className="absolute right-0 bottom-0 w-5 h-px bg-white/20" />
        <div className="absolute right-0 bottom-0 w-px h-5 bg-white/20" />
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-[#080808] overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-contain p-6 group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-[#222]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="text-xs text-white/90 uppercase tracking-widest font-medium border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm bg-black/30">
            Ver detalle →
          </span>
        </div>

        {/* Badges */}
        {disc && (
          <div
            className="absolute top-3 left-3 px-2 py-0.5 bg-white text-black text-[11px] font-bold rounded-full"
            style={{ fontFamily: "var(--font-display)" }}
          >
            -{disc}%
          </div>
        )}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#1a1200] border border-[#f5a623]/30 text-[#f5a623] text-[10px] rounded-full">
            Últimas {product.stock}
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#1a0a0a] border border-[#ff4545]/30 text-[#ff4545] text-[10px] rounded-full">
            Agotado
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-[10px] text-[#444] uppercase tracking-widest">{product.brand}</p>

        <h3 className="text-sm text-[#d0d0d0] leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {product.name}
        </h3>

        {/* Spec pills */}
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {pills.slice(0, 3).map((pill) => (
              <span key={pill} className="text-[10px] font-mono text-[#555] bg-[#141414] border border-[#1f1f1f] px-1.5 py-0.5 rounded">
                {pill}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-[#141414]">
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <p className="text-xs text-[#444] line-through mb-0.5">{formatCLP(product.compareAtPrice)}</p>
          )}
          <p className="text-base font-bold font-mono text-white">
            {formatCLP(product.price)}
          </p>
          <p className="text-[10px] text-[#383838] mt-0.5">IVA incluido</p>
        </div>
      </div>
    </Link>
  );
}
